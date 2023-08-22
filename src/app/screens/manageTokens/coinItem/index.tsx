import { useState } from 'react';
import stc from 'string-to-color';
import styled from 'styled-components';
import Switch from 'react-switch';
import { Coin } from '@secretkeylabs/xverse-core/types';
import Theme from 'theme';
import { getTicker } from '@utils/helper';
import Separator from '@components/separator';

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(11),
}));

const CoinContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const BottomContainer = styled.div({
  marginBottom: 30,
});

const CoinIcon = styled.img((props) => ({
  marginRight: props.theme.spacing(7),
  width: 32,
  height: 32,
  resizeMode: 'stretch',
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
  height: 30,
  width: 30,
  borderRadius: props.theme.radius(3),
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: props.color,
}));

const TickerText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
  wordBreak: 'break-all',
  fontSize: 10,
}));

const SelectedCoinTitleText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const UnSelectedCoinTitleText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['400'],
  textAlign: 'center',
}));

interface Props {
  coin: Coin;
  disabled: boolean;
  toggled(enabled: boolean, coin: Coin): void;
  enabled?: boolean;
  showDivider: boolean;
}

function CoinItem({ coin, disabled, toggled, enabled, showDivider }: Props) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const toggleSwitch = () => {
    setIsEnabled((previousState) => !previousState);
    toggled(!isEnabled, coin);
  };

  function getFtTicker() {
    const { ticker } = coin;
    return !ticker && coin.name ? getTicker(coin.name) : ticker;
  }
  const background = stc(getFtTicker());

  return (
    <>
      <RowContainer>
        <CoinContainer>
          {coin.image ? (
            <CoinIcon src={coin.image} />
          ) : (
            <TickerIconContainer color={background}>
              <TickerText>{getFtTicker()}</TickerText>
            </TickerIconContainer>
          )}
          {isEnabled ? (
            <SelectedCoinTitleText>{coin.name}</SelectedCoinTitleText>
          ) : (
            <UnSelectedCoinTitleText>{coin.name}</UnSelectedCoinTitleText>
          )}
        </CoinContainer>
        <CustomSwitch
          onColor={Theme.colors.purple_main}
          offColor={Theme.colors.background.elevation3}
          onChange={toggleSwitch}
          checked={isEnabled!}
          uncheckedIcon={false}
          checkedIcon={false}
          disabled={disabled}
        />
      </RowContainer>
      {showDivider ? <Separator /> : <BottomContainer />}
    </>
  );
}

export default CoinItem;
