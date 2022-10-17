import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Coin } from '@utils/utils';
import { FungibleToken, NetworkType } from '@secretkeylabs/xverse-core/types';
import { useState } from 'react';
import CoinItem from '@components/coinItem';
import { useNavigate } from 'react-router-dom';
import TopRow from '@components/topRow';

const TokenContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 22px;
  padding-right: 22px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));
interface Props {
  coins: Coin[];
  coinsList: FungibleToken[];
  stxAddress: string;
  visibleCoins: Coin[];
  updateVisibleCoins: (coin: Coin, visible: boolean) => void;
  fetchFtData: (stxAddress: string, network: NetworkType) => void;
}

function ManageTokens({
  coins,
  coinsList,
  stxAddress,
  visibleCoins,
  updateVisibleCoins,
  fetchFtData,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'TOKEN_SCREEN' });
  coins = [
    {
      contract: 'SP1H1733V5MZ3SZ9XRW9FKYGEZT0JDGEB8Y634C7R.miamicoin-token-v2',
      decimals: 6,
      description: 'A CityCoin for Miami, ticker is MIA, Stack it to earn Stacks (STX)',
      image: 'https://cdn.citycoins.co/logos/miamicoin.png',
      name: 'MiamiCoin v2',
      supported: true,
      ticker: 'MIA',
      tokenFiatRate: 0.00049301083,
      visible: true,
    },
    {
      contract: 'SP2H8PY27SEZ03MWRKS5XABZYQN17ETGQS3527SA5.newyorkcitycoin-token',
      decimals: 0,
      description: 'A CityCoin for New York City, ticker is NYC, Stack it to earn Stacks (STX)',
      image: 'https://cdn.citycoins.co/logos/newyorkcitycoin.png',
      name: 'NewYorkCityCoin v1',
      supported: true,
      ticker: 'NYC',
    },
    {
      contract: 'SPSCWDV3RKV5ZRN1FQD84YE1NQFEDJ9R1F4DYQ11.newyorkcitycoin-token-v2',
      decimals: 6,
      description: 'A CityCoin for New York City, ticker is NYC, Stack it to earn Stacks (STX)',
      image: 'https://cdn.citycoins.co/logos/newyorkcitycoin.png',
      name: 'NewYorkCityCoin v2',
      supported: true,
      ticker: 'NYC',
    },
    {
      contract: 'SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.Wrapped-Bitcoin',
      decimals: 8,
      description:
        'Wrapped Bitcoin on Stacks (xBTC) is a 1:1 equivalent of Bitcoin (BTC) on the Stacks network. xBTC combines the security of Bitcoin with general purpose smart contracts of Stacks, making DeFi applications for the Bitcoin ecosystem possible.',
      image: 'https://wrapped.com/images/xbtc.png',
      name: 'Wrapped Bitcoin',
      supported: true,
      ticker: 'xBTC',
      tokenFiatRate: 18849.967499992475,
    },
    {
      contract: 'SP2TZK01NKDC89J6TA56SA47SDF7RTHYEQ79AAB9A.Wrapped-USD',
      decimals: 8,
      description:
        'Wrapped USD on Stacks (xUSD) is a 1:1 equivalent of stable-backed USD on the Stacks network.',
      image: 'https://wrapped.com/images/xusd.png',
      name: 'Wrapped USD',
      supported: true,
      ticker: 'xUSD',
    },
    {
      contract: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token',
      decimals: 6,
      description: 'A crypto-overcollateralised stablecoin on Stacks',
      image: 'https://app.arkadiko.finance/assets/tokens/usda.svg',
      name: 'USDA',
      supported: true,
      ticker: 'USDA',
    },
    {
      contract: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.age000-governance-token',
      decimals: 8,
      description:
        'Bring your Bitcoin to Life: launch new projects, earn interest, rewrite finance, reinvent culture',
      image: 'https://cdn.alexlab.co/logos/ALEX_Token.png',
      name: 'ALEX',
      supported: true,
      ticker: 'alex',
    },
    {
      contract: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.auto-alex',
      decimals: 8,
      description:
        'Bring your Bitcoin to Life: launch new projects, earn interest, rewrite finance, reinvent culture',
      image: 'https://cdn.alexlab.co/logos/AutoALEX_Token.png',
      name: 'Auto ALEX',
      supported: true,
      ticker: 'auto-alex',
    },
    {
      contract: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token',
      decimals: 6,
      description: "Arkadiko's Governance token",
      image: 'https://app.arkadiko.finance/assets/tokens/diko.svg',
      name: 'Arkadiko Token',
      supported: true,
      ticker: 'DIKO',
    },
    {
      contract: 'SP125J1ADVYWGWB9NQRCVGKYAG73R17ZNMV17XEJ7.slime-token',
      decimals: 6,
      description: '',
      image: '',
      name: 'SLIME',
      supported: true,
      ticker: 'SLM',
    },
  ];
  const navigate = useNavigate();
  const [showAddCoinAlert, setShowAddCoinAlert] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(coins[0]);
  function toggled(isEnabled: boolean, coin: Coin) {
    if (isEnabled) {
      // check here if the coin is already in dashboard
      // if not already in wallet, show an alert to add coin
      const index = coinsList.findIndex((ft) => {
        return ft.principal === coin.contract;
      });
      if (index === -1) {
        setShowAddCoinAlert(true);
      }
      setSelectedCoin(coin);
      updateVisibleCoins(coin, true);
    } else {
      // remove this coin from the visible list
      updateVisibleCoins(coin, false);
    }
  }

  const handleBackButtonClick = () => {
    navigate('/');
  };

  return (
    <Container>
      <TopRow title={t('ADD_COINS')} onClick={handleBackButtonClick} />
      <TokenContainer>
        {coins.map((coin) => {
          return <CoinItem coin={coin} disabled={false} toggled={toggled} enabled={coin.visible} />;
        })}
      </TokenContainer>
    </Container>
  );
}

export default ManageTokens;
