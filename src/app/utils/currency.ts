import ARG from '@assets/img/settings/currencies/ars.svg';
import AUS from '@assets/img/settings/currencies/aus.svg';
import BRA from '@assets/img/settings/currencies/bra.svg';
import CAN from '@assets/img/settings/currencies/can.svg';
import CHE from '@assets/img/settings/currencies/che.svg';
import CHN from '@assets/img/settings/currencies/chn.svg';
import COP from '@assets/img/settings/currencies/cop.svg';
import DOP from '@assets/img/settings/currencies/dop.svg';
import EU from '@assets/img/settings/currencies/eu.svg';
import GBR from '@assets/img/settings/currencies/gbr.svg';
import GTQ from '@assets/img/settings/currencies/gtq.svg';
import HKG from '@assets/img/settings/currencies/hkg.svg';
import HUN from '@assets/img/settings/currencies/hun.svg';
import IDN from '@assets/img/settings/currencies/idn.svg';
import IND from '@assets/img/settings/currencies/ind.svg';
import JPN from '@assets/img/settings/currencies/jpn.svg';
import KOR from '@assets/img/settings/currencies/kor.svg';
import MEX from '@assets/img/settings/currencies/mex.svg';
import MYS from '@assets/img/settings/currencies/mys.svg';
import NGA from '@assets/img/settings/currencies/nga.svg';
import PAK from '@assets/img/settings/currencies/pak.svg';
import PEN from '@assets/img/settings/currencies/pen.svg';
import PHL from '@assets/img/settings/currencies/phl.svg';
import POL from '@assets/img/settings/currencies/pol.svg';
import RON from '@assets/img/settings/currencies/ron.svg';
import RUS from '@assets/img/settings/currencies/rus.svg';
import SGP from '@assets/img/settings/currencies/sgp.svg';
import THA from '@assets/img/settings/currencies/tha.svg';
import TUR from '@assets/img/settings/currencies/tur.svg';
import TWN from '@assets/img/settings/currencies/twn.svg';
import USA from '@assets/img/settings/currencies/usa.svg';
import VNM from '@assets/img/settings/currencies/vnm.svg';
import ZAF from '@assets/img/settings/currencies/zaf.svg';

import type { SupportedCurrency } from '@secretkeylabs/xverse-core';

export interface Currency {
  name: SupportedCurrency;
  isoFlag: string;
}

// alphabetical order
export const currencyList: Currency[] = [
  { name: 'ARS', isoFlag: ARG }, // Argentina
  { name: 'AUD', isoFlag: AUS }, // Australia
  { name: 'BRL', isoFlag: BRA }, // Brazil
  { name: 'CAD', isoFlag: CAN }, // Canada
  { name: 'CHF', isoFlag: CHE }, // Switzerland
  { name: 'CNY', isoFlag: CHN }, // China
  { name: 'COP', isoFlag: COP }, // Colombia
  { name: 'DOP', isoFlag: DOP }, // Dominican Republic
  { name: 'EUR', isoFlag: EU }, // Eurozone
  { name: 'GBP', isoFlag: GBR }, // United Kingdom
  { name: 'GTQ', isoFlag: GTQ }, // Guatemala
  { name: 'HKD', isoFlag: HKG }, // Hong Kong
  { name: 'HUF', isoFlag: HUN }, // Hungary
  { name: 'IDR', isoFlag: IDN }, // Indonesia
  { name: 'INR', isoFlag: IND }, // India
  { name: 'JPY', isoFlag: JPN }, // Japan
  { name: 'KRW', isoFlag: KOR }, // South Korea
  { name: 'MXN', isoFlag: MEX }, // Mexico
  { name: 'MYR', isoFlag: MYS }, // Malaysia
  { name: 'NGN', isoFlag: NGA }, // Nigeria
  { name: 'PEN', isoFlag: PEN }, // Peru
  { name: 'PHP', isoFlag: PHL }, // Philippines
  { name: 'PKR', isoFlag: PAK }, // Pakistan
  { name: 'PLN', isoFlag: POL }, // Poland
  { name: 'RON', isoFlag: RON }, // Romania
  { name: 'RUB', isoFlag: RUS }, // Russia
  { name: 'SGD', isoFlag: SGP }, // Singapore
  { name: 'THB', isoFlag: THA }, // Thailand
  { name: 'TRY', isoFlag: TUR }, // Turkey
  { name: 'TWD', isoFlag: TWN }, // Taiwan
  { name: 'USD', isoFlag: USA }, // United States
  { name: 'VND', isoFlag: VNM }, // Vietnam
  { name: 'ZAR', isoFlag: ZAF }, // South Africa
].sort((a, b) => a.name.localeCompare(b.name)) as Currency[];
