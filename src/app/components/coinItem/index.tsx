import { useState } from 'react';
import stc from 'string-to-color';
import styled from 'styled-components';
import Switch from 'react-switch';
import Theme from 'theme';
import { getTicker } from '@utils/helper';
import Seperator from '@components/seperator';
import { Coin } from '@secretkeylabs/xverse-core/types';

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(11),
}));

const CoinContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

const CoinIcon = styled.img((props) => ({
  marginRight: props.theme.spacing(7),
  width: 32,
  height: 32,
  resizeMode: 'stretch',
}));

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
}

function CoinItem({ coin, disabled, toggled, enabled }: Props) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const toggleSwitch = () => {
    setIsEnabled((previousState) => !previousState);
    toggled(!isEnabled, coin);
  };

  function getFtTicker() {
    let ticker = coin.ticker;
    return !ticker && coin.name ? getTicker(coin.name) : ticker;
  }

  function renderCoinIcon() {
    if (coin.image) return <CoinIcon src={coin.image}></CoinIcon>;
    else {
      const background = stc(getFtTicker());
      return (
        <TickerIconContainer color={background}>
          <TickerText>{getFtTicker()}</TickerText>
        </TickerIconContainer>
      );
    }
  }
  function renderCoinText() {
    return isEnabled ? (
      <SelectedCoinTitleText>{coin.name}</SelectedCoinTitleText>
    ) : (
      <UnSelectedCoinTitleText>{coin.name}</UnSelectedCoinTitleText>
    );
  }
  function renderSwitch() {
    return (
      <Switch
        onColor={Theme.colors.action.classic}
        offColor={Theme.colors.background.elevation3}
        onChange={toggleSwitch}
        checked={isEnabled!}
        uncheckedIcon={false}
        checkedIcon={false}
        disabled={disabled}
      />
    );
  }
  return (
    <>
      <RowContainer>
        <CoinContainer>
          {renderCoinIcon()}
          {renderCoinText()}
        </CoinContainer>
        {renderSwitch()}
      </RowContainer>
      <Seperator />
    </>
  );
}

export default CoinItem;
