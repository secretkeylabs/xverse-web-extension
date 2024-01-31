import { getTicker } from '@utils/helper';
import { useState } from 'react';
import Switch from 'react-switch';
import stc from 'string-to-color';
import styled from 'styled-components';
import Theme from 'theme';

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${(props) => props.theme.space.m} 0;
`;

const CoinContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const CoinIcon = styled.img((props) => ({
  marginRight: props.theme.spacing(7),
  width: 32,
  height: 32,
  resizeMode: 'stretch',
  borderRadius: '50%',
}));

const CustomSwitch = styled(Switch)`
  .react-switch-handle {
    background-color: ${({ checked }) =>
      checked ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)'} !important;
    border: ${({ checked }) => (checked ? '' : '4px solid rgba(255, 255, 255, 0.2)')} !important;
  }
`;

const TickerIconContainer = styled.div((props) => ({
  display: 'flex',
  marginRight: props.theme.spacing(7),
  height: '32px',
  width: '32px',
  borderRadius: props.theme.radius(3),
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: props.color,
  flexShrink: 0,
}));

const TickerText = styled.h1((props) => ({
  ...props.theme.typography.body_s,
  color: props.theme.colors.white_0,
  textAlign: 'center',
  wordBreak: 'break-all',
  fontSize: 10,
  width: '100%',
}));

const SelectedCoinTitleText = styled.h1((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_0,
  textAlign: 'center',
}));

const UnSelectedCoinTitleText = styled.h1((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_400,
  textAlign: 'center',
}));

interface Props {
  id: string;
  name: string;
  image?: string;
  ticker?: string;
  disabled: boolean;
  toggled(enabled: boolean, coinName: string, coinKey: string): void;
  enabled?: boolean;
}

function CoinItem({ id, name, image, ticker, disabled, toggled, enabled }: Props) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const toggleSwitch = () => {
    setIsEnabled((previousState) => !previousState);
    toggled(!isEnabled, name, id);
  };

  function getTickerName() {
    return !ticker && name ? getTicker(name) : ticker;
  }
  const background = stc(getTickerName());

  return (
    <RowContainer>
      <CoinContainer>
        {image ? (
          <CoinIcon src={image} />
        ) : (
          <TickerIconContainer color={background}>
            <TickerText>{getTickerName()}</TickerText>
          </TickerIconContainer>
        )}
        {isEnabled ? (
          <SelectedCoinTitleText>{name}</SelectedCoinTitleText>
        ) : (
          <UnSelectedCoinTitleText>{name}</UnSelectedCoinTitleText>
        )}
      </CoinContainer>
      <CustomSwitch
        onColor={Theme.colors.tangerine}
        offColor={Theme.colors.elevation3}
        onChange={toggleSwitch}
        checked={isEnabled!}
        uncheckedIcon={false}
        checkedIcon={false}
        disabled={disabled}
      />
    </RowContainer>
  );
}

export default CoinItem;
