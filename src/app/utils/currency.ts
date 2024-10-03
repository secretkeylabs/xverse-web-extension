import CAN from '@assets/img/settings/currencies/can.svg';
import CHN from '@assets/img/settings/currencies/chn.svg';
import EU from '@assets/img/settings/currencies/eu.svg';
import USA from '@assets/img/settings/currencies/usa.svg';
import ARG from '@assets/img/settings/currencies/ars.svg';
import KOR from '@assets/img/settings/currencies/kor.svg';
import HKG from '@assets/img/settings/currencies/hkg.svg';
import JPN from '@assets/img/settings/currencies/jpn.svg';
import SGP from '@assets/img/settings/currencies/sgp.svg';
import GBR from '@assets/img/settings/currencies/gbr.svg';
import BRA from '@assets/img/settings/currencies/bra.svg';
import RUS from '@assets/img/settings/currencies/rus.svg';
import AUS from '@assets/img/settings/currencies/aus.svg';
import NGA from '@assets/img/settings/currencies/nga.svg';
import TUR from '@assets/img/settings/currencies/tur.svg';
import IND from '@assets/img/settings/currencies/ind.svg';
import CHE from '@assets/img/settings/currencies/che.svg';
import VNM from '@assets/img/settings/currencies/vnm.svg';
import POL from '@assets/img/settings/currencies/pol.svg';
import MYS from '@assets/img/settings/currencies/mys.svg';
import TWN from '@assets/img/settings/currencies/twn.svg';
import IDN from '@assets/img/settings/currencies/idn.svg';
import HUN from '@assets/img/settings/currencies/hun.svg';
import THA from '@assets/img/settings/currencies/tha.svg';
import PHL from '@assets/img/settings/currencies/phl.svg';
import PAK from '@assets/img/settings/currencies/pak.svg';
import ZAF from '@assets/img/settings/currencies/zaf.svg';
import MEX from '@assets/img/settings/currencies/mex.svg';

import type { SupportedCurrency } from '@secretkeylabs/xverse-core';

export interface Currency {
  name: SupportedCurrency;
  isoFlag: string;
}

export const currencyList: Currency[] = [
  { name: 'CAD', isoFlag: CAN },    // Canada
  { name: 'CNY', isoFlag: CHN },    // China
  { name: 'EUR', isoFlag: EU },     // Eurozone
  { name: 'USD', isoFlag: USA },    // United States
  { name: 'ARS', isoFlag: ARG },    // Argentina
  { name: 'KRW', isoFlag: KOR },    // South Korea
  { name: 'HKD', isoFlag: HKG },    // Hong Kong
  { name: 'JPY', isoFlag: JPN },    // Japan
  { name: 'SGD', isoFlag: SGP },    // Singapore
  { name: 'GBP', isoFlag: GBR },    // United Kingdom
  { name: 'BRL', isoFlag: BRA },    // Brazil
  { name: 'RUB', isoFlag: RUS },    // Russia
  { name: 'AUD', isoFlag: AUS },    // Australia
  { name: 'NGN', isoFlag: NGA },    // Nigeria
  { name: 'TRY', isoFlag: TUR },    // Turkey
  { name: 'INR', isoFlag: IND },    // India
  { name: 'CHF', isoFlag: CHE },    // Switzerland
  { name: 'VND', isoFlag: VNM },    // Vietnam
  { name: 'PLN', isoFlag: POL },    // Poland
  { name: 'MYR', isoFlag: MYS },    // Malaysia
  { name: 'TWD', isoFlag: TWN },    // Taiwan
  { name: 'IDR', isoFlag: IDN },    // Indonesia
  { name: 'HUF', isoFlag: HUN },    // Hungary
  { name: 'THB', isoFlag: THA },    // Thailand
  { name: 'PHP', isoFlag: PHL },    // Philippines
  { name: 'PKR', isoFlag: PAK },    // Pakistan
  { name: 'ZAR', isoFlag: ZAF },    // South Africa
  { name: 'MXN', isoFlag: MEX },    // Mexico
];
