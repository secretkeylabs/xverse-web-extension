import ARG from '@assets/img/settings/ars.svg';
import BRL from '@assets/img/settings/brl.svg';
import CNY from '@assets/img/settings/cny.svg';
import GBP from '@assets/img/settings/gbp.svg';
import HKD from '@assets/img/settings/hkd.svg';
import CanFlag from '@assets/img/settings/ic_can.svg';
import EurFlag from '@assets/img/settings/ic_eu.svg';
import JapanFlag from '@assets/img/settings/ic_jp.svg';
import UsFlag from '@assets/img/settings/ic_usa.svg';
import KRW from '@assets/img/settings/krw.svg';
import RUB from '@assets/img/settings/rub.svg';
import SGD from '@assets/img/settings/sgd.svg';
import type { SupportedCurrency } from '@secretkeylabs/xverse-core';

export interface Currency {
  name: SupportedCurrency;
  flag: string;
}

export const currencyList: Currency[] = [
  { name: 'CAD', flag: CanFlag },
  { name: 'CNY', flag: CNY },
  { name: 'EUR', flag: EurFlag },
  { name: 'USD', flag: UsFlag },
  { name: 'ARS', flag: ARG },
  { name: 'KRW', flag: KRW },
  { name: 'HKD', flag: HKD },
  { name: 'JPY', flag: JapanFlag },
  { name: 'SGD', flag: SGD },
  { name: 'GBP', flag: GBP },
  { name: 'BRL', flag: BRL },
  { name: 'RUB', flag: RUB },
];

export function getCurrencyFlag(currency: string) {
  const curr = currencyList.find((value) => value.name === currency);
  return curr?.flag ?? UsFlag;
}
