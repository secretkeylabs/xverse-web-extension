import type { PropsWithChildren, ReactNode } from 'react';
import { TokenImage } from './components/TokenImage';
import { Container, ContentContainer, RowContainer } from './index.styles';

import IconStarknet from '@assets/img/dashboard/strk_icon.png';
import { TokenTicker, TokenTitle } from '@components/tokenTile/index.styled';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { balanceOf, contractType, format, STRK_TOKEN_ADDRESS } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

type TileTemplateProps = {
  firstRow: ReactNode;
  secondRow?: ReactNode;
  onClick?: () => void;
};

function TileTemplate({ firstRow, secondRow, onClick }: PropsWithChildren<TileTemplateProps>) {
  return (
    <Container onClick={onClick}>
      <TokenImage src={IconStarknet} textFallback="STRK" />
      <ContentContainer>
        <RowContainer>{firstRow}</RowContainer>
        {secondRow && <RowContainer>{secondRow}</RowContainer>}
      </ContentContainer>
    </Container>
  );
}

function Layout({ address }: { address: string }) {
  const navigate = useNavigate();

  // TODO: figure out how to manage networks beyond BTC and STX.
  //
  // Related: https://www.notion.so/xverseapp/App-API-Persistent-Reactive-Stores-1ae5520b9dee8061beb3e1b22ff23d00?pvs=4#1ae5520b9dee805ebd73eae199a1ba45

  const {
    isLoading,
    isError,
    data: amount,
  } = useQuery({
    queryKey: ['sn-balance', { STRK_TOKEN_ADDRESS, address }],
    queryFn: async () => balanceOf({ tokenAddress: STRK_TOKEN_ADDRESS, address }),
  });

  if (isLoading) {
    return (
      <TileTemplate
        firstRow={
          <>
            <TokenTitle>Starknet</TokenTitle>
            <div>Loading...</div>
          </>
        }
      />
    );
  }

  if (isError) {
    return (
      <TileTemplate
        firstRow={
          <>
            <TokenTitle>Starknet</TokenTitle>
            <div>Error loading balance.</div>
          </>
        }
      />
    );
  }

  return (
    <TileTemplate
      firstRow={<TokenTitle>Starknet</TokenTitle>}
      secondRow={
        <TokenTicker>
          {format({
            currency: 'crypto/starknet/starknet',
            amount: amount ?? 0,
          })}
        </TokenTicker>
      }
      onClick={() => {
        navigate('/coinDashboard/STRK');
      }}
    />
  );
}

function Loader() {
  const account = useSelectedAccount();

  if (account.accountType !== 'software') return null;

  // Support undefined strkAddresses during PoC period.
  if (!account.strkAddresses) return null;

  const { address } = account.strkAddresses[contractType.AX040W0G];

  return <Layout address={address} />;
}

export function StarknetTokenTile() {
  return <Loader />;
}
