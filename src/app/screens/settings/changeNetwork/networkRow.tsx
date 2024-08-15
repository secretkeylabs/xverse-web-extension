import TickIcon from '@assets/img/settings/tick.svg';
import type { SettingsNetwork } from '@secretkeylabs/xverse-core';
import styled, { useTheme } from 'styled-components';

interface TitleProps {
  color: string;
}

interface ButtonProps {
  border: string;
}

const Button = styled.button<ButtonProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  background: 'transparent',
  paddingBottom: props.theme.spacing(10),
  paddingTop: props.theme.spacing(10),
  borderBottom: props.border,
}));

const Text = styled.h1<TitleProps>((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.color,
  flex: 1,
  textAlign: 'left',
}));

interface Props {
  network: SettingsNetwork;
  isSelected: boolean;
  onNetworkSelected: (network: SettingsNetwork) => void;
  showDivider: boolean;
}

function NetworkRow({ network, isSelected, onNetworkSelected, showDivider }: Props) {
  const theme = useTheme();
  const onClick = () => {
    onNetworkSelected(network);
  };

  return (
    <Button
      onClick={onClick}
      border={showDivider ? `1px solid ${theme.colors.white_900}` : 'transparent'}
    >
      <Text color={isSelected ? theme.colors.white_0 : theme.colors.white_400}>{network.type}</Text>
      {isSelected && <img src={TickIcon} alt="tick" />}
    </Button>
  );
}

export default NetworkRow;
