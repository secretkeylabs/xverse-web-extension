import { btcTransaction } from '@secretkeylabs/xverse-core';

// TODO: remove after testing
const getPsbtDataWithMocks = (
  btcAddress: string,
  ordinalsAddress: string,
  inputs: btcTransaction.EnhancedInput[],
  outputs: btcTransaction.EnhancedOutput[],
  isPartialTransaction: boolean,
  feeOutput?: btcTransaction.TransactionFeeOutput,
) => {
  const outputsWithMocks = [...outputs];
  const inputsWithMocks = [...inputs];
  const feeOutputWithMocks = feeOutput ? { ...feeOutput } : undefined;

  if (localStorage.getItem('assetsInPayment') === 'true') {
    // TODO: mock data for items spend in payment address
    if (isPartialTransaction) {
      inputsWithMocks.push({
        // @ts-ignore
        extendedUtxo: {
          address: btcAddress,
          outpoint: '9851e0a32f6fd352dd763624025cb55cead8954c7bdde4430c290f7f9e3bcfeb:0',
          // @ts-ignore
          utxo: {
            value: 100000,
          },
        },
        inscriptions: [
          {
            contentType: 'image/png',
            fromAddress: btcAddress,
            id: 'f115397bbaf139f0daa954bf26e9a986b5468a2332628b0c0a9a9f6af34d1b3di0',
            number: 10951686,
            offset: 0,
          },
        ],
        satributes: [],
        sigHash: 131,
      });
    }
    outputsWithMocks.push(
      {
        address: 'bc1p6rh39e6s6utyc8adtlt3q09d9tnrwlwynngdwj9jse2uysekynxscnwfh7',
        amount: 10000,
        inscriptions: [
          {
            contentType: 'image/png',
            fromAddress: btcAddress,
            id: 'f115397bbaf139f0daa954bf26e9a986b5468a2332628b0c0a9a9f6af34d1b3di0',
            number: 10951686,
            offset: 0,
          },
        ],
        satributes: [],
      },
      {
        address: 'bc1p6rh39e6s6utyc8adtlt3q09d9tnrwlwynngdwj9jse2uysekynxscnwfh7',
        amount: 546,
        inscriptions: [],
        satributes: [
          {
            amount: 1,
            fromAddress: btcAddress,
            offset: 0,
            types: ['PALINDROME'],
          },
        ],
      },
    );
  }

  if (localStorage.getItem('bundleInOrdinal') === 'true') {
    // TODO: mock data for bundle item in ordinal address
    outputsWithMocks.push({
      address: ordinalsAddress,
      amount: 20,
      inscriptions: [
        {
          contentType: 'image/png',
          fromAddress: 'bc1prnplwl27eedudpvl9cjhd2pysudk0gzze08wjhsyy0998mfcgmcsaz4nse',
          id: '9f0a1ea3ca2e2431242350b63cf53708f0f3e560638eb26b1255d4e5dd766fc4i0',
          number: 10987226,
          offset: 0,
        },
        {
          contentType: 'image/png',
          fromAddress: 'bc1pmz88ylp258alrgeqsy7jn99u20ylkc4fuqcgwva3eef8s92ye9squunk5r',
          id: '2237248523bc923a7844b47cb7e2552c1666032ed54ab153a00fba1f5c3e1e22i0',
          number: 10878824,
          offset: 2,
        },
      ],
      satributes: [
        {
          amount: 1,
          fromAddress: 'bc1pugy3kp2zeuntlw649vse3eyy9zr6rwd2lfchdasx9pa7nvm2555qfeepyt',
          offset: 3,
          types: ['FIRST_TRANSACTION', 'VINTAGE', 'BLOCK9', 'NAKAMOTO'],
        },
        {
          amount: 1,
          fromAddress: 'bc1pugy3kp2zeuntlw649vse3eyy9zr6rwd2lfchdasx9pa7nvm2555qfeepyt',
          offset: 0,
          types: ['PIZZA'],
        },
      ],
    });
  }

  if (localStorage.getItem('assetsInFees') === 'true' && feeOutputWithMocks) {
    feeOutputWithMocks.satributes = [
      ...feeOutputWithMocks.satributes,
      {
        amount: 1,
        fromAddress: '38NMchWMVXBokHicGrs9nWimzJPfjJYhZ8',
        offset: 0,
        types: ['PALINDROME'],
      },
    ];
    feeOutputWithMocks.inscriptions = [
      ...feeOutputWithMocks.inscriptions,
      {
        contentType: 'image/png',
        fromAddress: '38NMchWMVXBokHicGrs9nWimzJPfjJYhZ8',
        id: 'f115397bbaf139f0daa954bf26e9a986b5468a2332628b0c0a9a9f6af34d1b3di0',
        number: 10951686,
        offset: 0,
      },
    ];
  }

  return {
    inputsWithMocks,
    outputsWithMocks,
    feeOutputWithMocks,
  };
};

export default getPsbtDataWithMocks;
