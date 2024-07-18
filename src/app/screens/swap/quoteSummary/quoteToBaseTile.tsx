// import { StyledP } from '@ui-library/common.styled';
// import { formatNumber } from '@utils/helper';
// import { useTranslation } from 'react-i18next';
// import styled from 'styled-components';
// import QuoteTile from '../quotesModal/quoteTile';

// const Container = styled.div``;

// interface Props {
//   baseImage: string;
//   quoteImage: string;
//   baseName: string;
//   quoteName: string;
//   baseAmount: string;
//   quoteAmount: string;
//   baseUnit: string;
//   quoteUnit: string
// }

// function QuoteToBaseTile({
//   baseImage,
//   quoteImage,
//   baseName,
//   quoteName,
//   baseAmount,
//   quoteAmount,
//   baseUnit,
//   quoteUnit
// }: Props) {
//   const { t } = useTranslation('translation');

//   return (
//     <Container>
//                 <QuoteTile
//             provider="Amount"
//             price={quoteAmount}
//             image={quoteImage}
//             subtitle={quoteName}
//             subtitleColor="white_400"
//             unit={quoteUnit}
//             fiatValue={
//               amm.to.protocol === 'btc'
//                 ? getBtcFiatEquivalent(
//                     new BigNumber(amm.receiveAmount),
//                     new BigNumber(btcFiatRate),
//                   ).toFixed(2)
//                 : ''
//             }
//           />
//     </Container>
//   );
// }

// export default QuoteToBaseTile;
