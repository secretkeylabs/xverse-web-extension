import ARG from '@assets/img/settings/currencies/ars.svg';
import AUD from '@assets/img/settings/currencies/aud.svg';
import BRL from '@assets/img/settings/currencies/brl.svg';
import CAD from '@assets/img/settings/currencies/cad.svg';
import CNY from '@assets/img/settings/currencies/cny.svg';
import EUR from '@assets/img/settings/currencies/eur.svg';
import GBP from '@assets/img/settings/currencies/gbp.svg';
import HKD from '@assets/img/settings/currencies/hkd.svg';
import JPY from '@assets/img/settings/currencies/jpy.svg';
import KRW from '@assets/img/settings/currencies/krw.svg';
import RUB from '@assets/img/settings/currencies/rub.svg';
import SGD from '@assets/img/settings/currencies/sgd.svg';
import USD from '@assets/img/settings/currencies/usd.svg';
import type { SupportedCurrency } from '@secretkeylabs/xverse-core';

export interface Currency {
  name: SupportedCurrency;
  flag: string;
}

export const currencyList: Currency[] = [
  { name: 'CAD', flag: CAD },
  { name: 'CNY', flag: CNY },
  { name: 'EUR', flag: EUR },
  { name: 'USD', flag: USD },
  { name: 'ARS', flag: ARG },
  { name: 'KRW', flag: KRW },
  { name: 'HKD', flag: HKD },
  { name: 'JPY', flag: JPY },
  { name: 'SGD', flag: SGD },
  { name: 'GBP', flag: GBP },
  { name: 'BRL', flag: BRL },
  { name: 'RUB', flag: RUB },
  { name: 'AUD', flag: AUD },
];
