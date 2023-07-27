import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import FoldIconUp from '@assets/img/swap/fold_arrow_up.svg';
import FoldDownIcon from '@assets/img/swap/fold_arrow_down.svg';
import AddressIcon from '@assets/img/swap/address.svg';
import CopyIcon from '@assets/img/swap/copy.svg';
import { getTruncatedAddress } from '@utils/helper';
import { StyledToolTip } from '@components/accountRow';
import { useCallback, useState } from 'react';
import { EstimateUSDText } from '@screens/swap/swapTokenBlock';
import { SwapConfirmationOutput } from '@screens/swap/swapConfirmation/useConfirmSwap';
import TokenImage from '@components/tokenImage';

export const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: props.theme.spacing(10),
  marginBottom: props.theme.spacing(6),
  background: props.theme.colors.background.elevation1,
  borderRadius: 12,
}));

export const TitleContainer = styled.div(() => ({
  display: 'flex',
  flex: '1',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

export const TitleText = styled.h3((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[200],
  fontSize: 14,
  fontWeight: 500,
}));

export const FoldArrow = styled.img(() => ({
  width: 14,
  height: 14,
  cursor: 'pointer',
}));

const DescriptionText = styled.h3((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[400],
  fontSize: 14,
  fontWeight: 500,
  marginTop: props.theme.spacing(8),
  marginBottom: props.theme.spacing(4),
}));

const AmountContainer = styled.div(() => ({
  display: 'flex',
  alignItems: 'center',
  'flex-direction': 'column',
}));

const AmountLabel = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[200],
  fontSize: 14,
  fontWeight: 500,
  marginLeft: props.theme.spacing(5),
}));

const SpaceBetweenContainer = styled.div(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
}));

const AddressImg = styled.img(() => ({
  width: 32,
  height: 32,
}));

const ItemsCenterContainer = styled.div(() => ({
  display: 'flex',
  alignItems: 'center',
}));

const AddressLabelText = styled.h3((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[200],
  marginLeft: props.theme.spacing(5),
}));

const CopyButton = styled.div(() => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
}));

const CopyImg = styled.img(() => ({
  width: 20,
  height: 20,
}));

const AddressText = styled.p((props) => ({
  ...props.theme.body_medium_m,
  marginRight: props.theme.spacing(4),
}));

const CurrencyText = styled.p((props) => ({
  ...props.theme.body_medium_m,
  marginLeft: props.theme.spacing(4),
}));

interface StxInfoCardProps {
  type: 'transfer' | 'receive';
  swap: SwapConfirmationOutput;
}

export function FoldButton({ isFold, onSwitch }: { isFold: boolean; onSwitch: () => void }) {
  return <FoldArrow src={isFold ? FoldDownIcon : FoldIconUp} onClick={() => onSwitch()} />;
}

export default function StxInfoBlock({ type, swap }: StxInfoCardProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_CONFIRM_SCREEN' });
  const [isCopied, setIsCopied] = useState(false);
  const [isFold, setIsFold] = useState(false);
  const copyId = `address-${type}`;
  const onCopy = useCallback(async () => {
    await navigator.clipboard.writeText(swap.address);
    setIsCopied(true);
  }, []);
  const token = type === 'transfer' ? swap.fromToken : swap.toToken;
  return (
    <Container>
      <TitleContainer>
        <TitleText>
          {type === 'transfer' ? t('YOU_WILL_TRANSFER') : t('YOU_WILL_RECEIVE')}
        </TitleText>
        <FoldButton isFold={isFold} onSwitch={() => setIsFold((prev) => !prev)} />
      </TitleContainer>
      {isFold ? null : (
        <>
          <DescriptionText>{t('LESS_THAN_OR_EQUAL_TO')}</DescriptionText>
          <AmountContainer>
            <SpaceBetweenContainer>
              <ItemsCenterContainer>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <TokenImage {...token.image} />
                <AmountLabel>{token.name}</AmountLabel>
              </ItemsCenterContainer>
              <ItemsCenterContainer>
                <CurrencyText>{token.amount}</CurrencyText>
                <CurrencyText>{token.name}</CurrencyText>
              </ItemsCenterContainer>
            </SpaceBetweenContainer>
            <EstimateUSDText>{` ~ $${token.fiatAmount} USD`}</EstimateUSDText>
          </AmountContainer>
          <DescriptionText>{t('TO')}</DescriptionText>
          <SpaceBetweenContainer>
            <ItemsCenterContainer>
              <AddressImg src={AddressIcon} />
              <AddressLabelText>{t('YOUR_ADDRESS')}</AddressLabelText>
            </ItemsCenterContainer>
            <CopyButton id={copyId} onClick={onCopy}>
              <AddressText>{getTruncatedAddress(swap.address)}</AddressText>
              <CopyImg src={CopyIcon} />
            </CopyButton>
            <StyledToolTip
              anchorId={copyId}
              variant="light"
              content={isCopied ? t('COPIED') : t('COPY_YOUR_ADDRESS')}
              events={['hover']}
              place="top"
            />
          </SpaceBetweenContainer>
        </>
      )}
    </Container>
  );
}
