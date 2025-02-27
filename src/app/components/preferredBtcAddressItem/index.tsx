import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import useWalletSelector from '@hooks/useWalletSelector';
import { CheckCircle } from '@phosphor-icons/react';
import { satsToBtc } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { HIDDEN_BALANCE_LABEL } from '@utils/constants';
import { getShortTruncatedAddress } from '@utils/helper';
import BigNumber from 'bignumber.js';
import styled from 'styled-components';

const Button = styled.button<{ $isSelected: boolean }>((props) => ({
  color: props.theme.colors.white_0,
  backgroundColor: props.$isSelected
    ? props.theme.colors.elevation6_600
    : props.theme.colors.transparent,
  padding: props.theme.space.m,
  borderRadius: props.theme.space.s,
  border: `solid 1px ${props.theme.colors.white_800}`,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
  transition: 'background-color 0.1s ease',
  '&:hover': {
    backgroundColor: props.theme.colors.elevation6_800,
  },
}));

const BtcIcon = styled.img<{ $isSelected: boolean }>((props) => ({
  height: props.theme.space.xl,
  width: props.theme.space.xl,
  borderRadius: '50%',
  marginRight: props.theme.space.s,
  opacity: props.$isSelected ? 1 : 0.8,
  transition: 'opacity 0.1s ease',
}));

const TextContainer = styled.div((_) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
}));

const RowContainer = styled.div((_) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
}));

const SelectedContainer = styled.div((props) => ({
  width: 20,
  marginLeft: props.theme.space.s,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
}));

type Props = {
  title: string;
  balanceSats?: number | bigint;
  address?: string;
  onClick: () => void;
  isSelected: boolean;
};

export default function PreferredBtcAddressItem({
  title,
  onClick,
  address,
  balanceSats,
  isSelected,
}: Props) {
  const { balanceHidden } = useWalletSelector();
  const balance =
    balanceSats !== undefined ? `${satsToBtc(BigNumber(balanceSats.toString()))} BTC` : '';

  return (
    <Button type="button" onClick={onClick} $isSelected={isSelected}>
      <BtcIcon src={IconBitcoin} $isSelected={isSelected} />
      <TextContainer>
        <RowContainer>
          <StyledP typography="body_medium_m">{title}</StyledP>
          <StyledP typography="body_medium_m">
            {balanceHidden ? HIDDEN_BALANCE_LABEL : balance}
          </StyledP>
        </RowContainer>
        <RowContainer>
          <StyledP typography="body_medium_m" color="white_400">
            {address && getShortTruncatedAddress(address, 6)}
          </StyledP>
        </RowContainer>
      </TextContainer>
      <SelectedContainer>{isSelected && <CheckCircle size={20} weight="fill" />}</SelectedContainer>
    </Button>
  );
}
