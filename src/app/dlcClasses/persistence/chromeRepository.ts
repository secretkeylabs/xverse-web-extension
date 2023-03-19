import {
  AnyContract,
  ContractQuery,
  ContractRepository,
  Utxo,
  RepositoryError,
  WalletStorage,
  ErrorCode,
  getId,
  ContractState,
} from 'dlc-lib'
import { LocationStore } from './locationStore'

const addressBucketTag = 'addressBucket'
const utxoBucketTag = 'utxoBucket'
const contractBucketTag = 'contractBucket'
const keyPairBucketTag = 'keyPairBucket'
const locationKey = 'locationKey'

// This class implements the storage using Chrome extension specific API. It is
// not used and hasn't been tested but is kept in case it's preferred. The main
// disadvantage of it is that it doesn't work when using the webpack development
// server.
export class ChromeRepository
  implements ContractRepository, WalletStorage, LocationStore
{
  readonly _db: chrome.storage.StorageArea | Storage

  constructor() {
    this._db = chrome.storage?.local || window.localStorage
  }
  saveLocation(location: string): Promise<void> {
    return this._db.set({ key: locationKey, value: location })
  }
  getLocation(): Promise<string> {
    const res = this._db.get(locationKey)
    if (locationKey in res) {
      return res[locationKey]
    }
    return null
  }

  upsertAddress(address: string, privkey: string): Promise<void> {
    return this.upsertInBucket(address, privkey, addressBucketTag)
  }

  deleteAddress(address: string): Promise<void> {
    return this.deleteInBucket(address, addressBucketTag)
  }

  getAddresses(): Promise<string[]> {
    return this.getAllKeysInBucket(addressBucketTag)
  }

  getPrivKeyForAddress(address: string): Promise<string> {
    return this.getValue(address)
  }

  upsertKeyPair(publicKey: string, privkey: string): Promise<void> {
    return this.upsertInBucket(publicKey, privkey, keyPairBucketTag)
  }

  getPrivKeyForPubkey(publicKey: string): Promise<string> {
    return this.getValue(publicKey)
  }

  upsertUtxo(utxo: Utxo): Promise<void> {
    const key = this.getUtxoKey(utxo)
    return this.upsertInBucket(key, JSON.stringify(utxo), utxoBucketTag)
  }

  deleteUtxo(utxo: Utxo): Promise<void> {
    const key = this.getUtxoKey(utxo)
    return this.deleteInBucket(key, utxoBucketTag)
  }

  getUtxos(): Promise<Utxo[]> {
    return this.getAllValuesInBucketOfType(utxoBucketTag)
  }

  async unreserveUtxo(txid: string, vout: number): Promise<void> {
    const key = this.getUtxoKey({ txid, vout })
    const utxo: Utxo = await this.getValueOfType(key)
    return this.upsertValueInBucket(
      key,
      {
        ...utxo,
        reserved: false,
      },
      utxoBucketTag
    )
  }

  createContract(contract: AnyContract): Promise<void> {
    return this.upsertValueInBucket(
      getId(contract),
      contract,
      contractBucketTag
    )
  }

  getContract(contractId: string): Promise<AnyContract> {
    return this.getValueOfType(contractId)
  }

  async getContracts(
    query?: ContractQuery | undefined
  ): Promise<AnyContract[]> {
    const allValues: AnyContract[] = await this.getAllValuesInBucketOfType(
      contractBucketTag
    )
    if (!query) return allValues
    return allValues.filter((x) => this.hasOneOfState(query.states, x))
  }

  async updateContract(contract: AnyContract): Promise<void> {
    if (contract.state === ContractState.Accepted) {
      await this.deleteInBucket(contract.temporaryContractId, contractBucketTag)
    }
    return this.upsertValueInBucket(
      getId(contract),
      contract,
      contractBucketTag
    )
  }

  deleteContract(contractId: string): Promise<void> {
    return this.deleteInBucket(contractId, contractBucketTag)
  }

  async hasContract(contractId: string): Promise<boolean> {
    const res = await this._db.get(contractId)
    return contractId in res
  }

  private getUtxoKey(utxo: { txid: string; vout: number }): string {
    return utxo.txid + utxo.vout.toString(16).padStart(2, '0')
  }

  private async getBucketKeys(bucketTag: string): Promise<string[]> {
    const res = await this._db.get(bucketTag)
    if (bucketTag in res) return res[bucketTag] as string[]

    return []
  }

  private async upsertInBucket(
    key: string,
    value: string,
    bucketTag: string
  ): Promise<void> {
    const keyList = await this.getBucketKeys(bucketTag)

    const index = keyList.indexOf(key)

    const toSet = []

    if (index === -1) {
      keyList.push(key)
      toSet.push({ key: bucketTag, value: keyList })
    }

    toSet.push({ key, value })

    return this._db.set(toSet)
  }

  private async upsertValueInBucket<T>(
    key: string,
    value: T,
    bucketTag: string
  ): Promise<void> {
    this.upsertInBucket(key, JSON.stringify(value), bucketTag)
  }

  private async deleteInBucket(key: string, bucketTag: string): Promise<void> {
    const keyList = await this.getBucketKeys(bucketTag)
    const index = keyList.indexOf(key)
    if (index === -1) {
      return
    }

    keyList.splice(index, 1)
    await this._db.set({ key: bucketTag, value: keyList })
    await this._db.remove(key)
  }

  private async getAllKeyValuesInBucket(bucketTag: string): Promise<{
    [key: string]: string
  }> {
    const keyList = await this.getBucketKeys(bucketTag)
    return this._db.get(keyList)
  }

  private async getAllValuesInBucket(bucketTag: string): Promise<string[]> {
    const keyValues = await this.getAllKeyValuesInBucket(bucketTag)
    const values: string[] = []
    for (const obj in keyValues) {
      values.push(keyValues[obj])
    }

    return values
  }

  private async getAllValuesInBucketOfType<T>(bucketTag: string): Promise<T[]> {
    return (await this.getAllValuesInBucket(bucketTag)).map(
      (x) => JSON.parse(x) as T
    )
  }

  private async getAllKeysInBucket(bucketTag: string): Promise<string[]> {
    const keyValues = await this.getAllKeyValuesInBucket(bucketTag)
    const keys: string[] = []
    for (const key in keyValues) {
      keys.push(key)
    }

    return keys
  }

  private async getValue(key: string): Promise<string> {
    const res = await this._db.get(key)
    if (key in res) {
      return res[key]
    }

    throw new RepositoryError(ErrorCode.NotFound, 'Key not found in db')
  }

  private async getValueOfType<T>(key: string): Promise<T> {
    const str = await this.getValue(key)
    return JSON.parse(str)
  }

  private isMatch(contract: AnyContract, query: ContractQuery): boolean {
    return this.hasOneOfState(query.states, contract)
  }

  private hasOneOfState(
    states: ContractState[] | undefined,
    contract: AnyContract
  ): boolean {
    return !states || states.includes(contract.state)
  }
}
