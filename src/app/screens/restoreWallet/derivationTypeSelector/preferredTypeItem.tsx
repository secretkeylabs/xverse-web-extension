import { CheckCircle, Key } from '@phosphor-icons/react';
import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import type { MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const OptionButton = styled.button<{ $isSelected: boolean }>((props) => ({
  width: '100%',
  color: props.theme.colors.white_0,
  backgroundColor: props.$isSelected
    ? props.theme.colors.elevation6_600
    : props.theme.colors.transparent,
  padding: `${props.theme.space.s} ${props.theme.space.m}`,
  borderRadius: props.theme.space.s,
  border: `solid 1px ${props.theme.colors.white_800}`,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: props.theme.space.m,
  transition: 'background-color 0.1s ease',
  svg: {
    color: props.theme.colors[props.$isSelected ? 'white_0' : 'white_200'],
    transition: 'color 0.1s ease',
  },
  '&:hover': {
    backgroundColor: props.theme.colors.elevation6_800,
    svg: {
      color: `${props.theme.colors.white_0} !important`,
    },
  },
}));

const RowContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: props.theme.space.m,
}));

const TextContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  flex: `1 0 auto`,
  textAlign: 'left',
});

const IconContainer = styled.div({
  display: 'flex',
});

const SelectedContainer = styled.div({
  width: 20,
  height: 20,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  flex: '1 0 auto',
});

const SeeAccountsButton = styled(Button)({
  width: '100%',
  maxWidth: 139,
});

type Props = {
  title: string;
  accountCount: bigint;
  onClick: () => void;
  onShowAccountsClick: () => void;
  isSelected: boolean;
};

export default function PreferredTypeItem({
  title,
  onClick,
  onShowAccountsClick: onShowAccountsClickOuter,
  accountCount,
  isSelected,
}: Props) {
  const { t } = useTranslation('translation', {
    keyPrefix: 'RESTORE_WALLET_SCREEN.SELECT_DERIVATION_TYPE',
  });

  const onShowAccountsClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    onShowAccountsClickOuter();
  };

  return (
    <OptionButton type="button" onClick={onClick} $isSelected={isSelected}>
      <IconContainer>
        <Key size={24} weight="fill" />
      </IconContainer>
      <RowContainer>
        <TextContainer>
          <StyledP typography="body_medium_m" color="white_0">
            {title}
          </StyledP>
          <StyledP typography="body_medium_m" color="white_200">
            {`${accountCount} ${t('ACCOUNTS_FOUND')}`}
          </StyledP>
        </TextContainer>
        <SeeAccountsButton
          variant="secondary"
          type="button"
          onClick={onShowAccountsClick}
          title={t('SEE_ACCOUNTS')}
        />
      </RowContainer>
      <SelectedContainer>{isSelected && <CheckCircle size={20} weight="fill" />}</SelectedContainer>
    </OptionButton>
  );
}
