import TickIcon from '@assets/img/settings/tick.svg';
import type { SettingsNetwork } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import styled, { useTheme } from 'styled-components';

const Button = styled.button<{
  border: string;
}>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  background: 'transparent',
  padding: `${props.theme.space.m} 0px`,
  borderBottom: props.border,
  transition: 'color 0.1s ease',
  '&:hover > p': {
    color: props.theme.colors.white_0,
  },
}));

const Text = styled(StyledP)((_) => ({
  flex: 1,
  textAlign: 'left',
}));

type Props = {
  network: SettingsNetwork;
  isSelected: boolean;
  onNetworkSelected: (network: SettingsNetwork) => void;
  showDivider: boolean;
  disabled?: boolean;
};

function NetworkRow({ network, isSelected, onNetworkSelected, showDivider, disabled }: Props) {
  const theme = useTheme();
  const onClick = () => {
    onNetworkSelected(network);
  };

  return (
    <Button
      onClick={onClick}
      border={showDivider ? `1px solid ${theme.colors.white_900}` : 'transparent'}
      disabled={disabled}
    >
      <Text
        typography={isSelected ? 'body_bold_m' : 'body_m'}
        color={isSelected ? 'white_0' : 'white_400'}
      >
        {network.type === 'Testnet' ? 'Testnet3' : network.type}
      </Text>
      {isSelected && <img src={TickIcon} alt="tick" />}
    </Button>
  );
}

export default NetworkRow;
