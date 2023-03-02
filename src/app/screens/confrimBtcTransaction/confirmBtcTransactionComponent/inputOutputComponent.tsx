import styled from 'styled-components';
import DropDownIcon from '@assets/img/transactions/dropDownIcon.svg';
import OutputIcon from '@assets/img/transactions/output.svg';
import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { currencySymbolMap } from '@secretkeylabs/xverse-core/types/currency';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import {
  animated, config, useSpring,
} from '@react-spring/web';
import { StoreState } from '@stores/index';
import TransferDetailView from '@components/transferDetailView';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.background.elevation1,
  borderRadius: 12,
  padding: '12px 16px',
  justifyContent: 'center',
  marginBottom: 12,
}));

const TransferDetailContainer = styled.div((props) => ({
  marginBottom: props.theme.spacing(8),
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[200],
}));

const OutputTitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[200],
  marginBottom: props.theme.spacing(6),
}));

const SubValueText = styled.h1((props) => ({
  ...props.theme.body_m,
  fontSize: 12,
  color: props.theme.colors.white[400],
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'flex-end',
});

const DropDownContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'flex-end',
});

const ExpandedContainer = styled(animated.div)({
  display: 'flex',
  flexDirection: 'column',
  marginTop: 16,
});

const Button = styled.button((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'transparent',
  marginLeft: props.theme.spacing(4),
}));

interface Props {
  address: string;
  value: string;
  subValue: string;
  isExpanded: boolean;
  onArrowClick: () => void;

}

function InputOutputComponent({
  address, value, subValue, isExpanded, onArrowClick,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const {
    fiatCurrency,
  } = useSelector((state: StoreState) => state.walletState);

  const slideInStyles = useSpring({
    config: { ...config.gentle, duration: 400 },
    from: { opacity: 0, height: 0 },
    to: {
      opacity: isExpanded ? 1 : 0,
      height: isExpanded ? 180 : 0,
    },
  });

  const arrowRotation = useSpring({
    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
    config: { ...config.stiff },
  });

  const getFiatAmountString = (fiatAmount: BigNumber) => {
    if (fiatAmount) {
      if (fiatAmount.isLessThan(0.01)) {
        return `<${currencySymbolMap[fiatCurrency]}0.01 ${fiatCurrency}`;
      }
      return (
        <NumericFormat
          value={fiatAmount.toFixed(2).toString()}
          displayType="text"
          thousandSeparator
          prefix={`~ ${currencySymbolMap[fiatCurrency]} `}
          suffix={` ${fiatCurrency}`}
          renderText={(text) => <SubValueText>{text}</SubValueText>}
        />
      );
    }
    return '';
  };
  return (
    <Container>
      <RowContainer>
        <TitleText>{isExpanded ? t('INPUT') : t('INPUT_AND_OUTPUT')}</TitleText>
        <DropDownContainer>
          <Button onClick={onArrowClick}>
            <animated.img style={arrowRotation} src={DropDownIcon} alt="Drop Down" />
          </Button>
        </DropDownContainer>
      </RowContainer>

      {isExpanded && (
      <ExpandedContainer style={slideInStyles}>
        <TransferDetailContainer>
          <TransferDetailView icon={IconBitcoin} amount={value} fiatAmount={getFiatAmountString(subValue)} address={address} />
        </TransferDetailContainer>
        <TransferDetailContainer>
          <TransferDetailView icon={IconBitcoin} amount={value} fiatAmount={getFiatAmountString(subValue)} address={address} />
        </TransferDetailContainer>
        <OutputTitleText>{t('OUTPUT')}</OutputTitleText>
        <TransferDetailContainer>
          <TransferDetailView icon={OutputIcon} amount={value} fiatAmount={getFiatAmountString(subValue)} address={address} />
        </TransferDetailContainer>
      </ExpandedContainer>
      )}
    </Container>
  );
}

export default InputOutputComponent;
