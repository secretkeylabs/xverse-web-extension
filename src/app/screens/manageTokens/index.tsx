import stacksIcon from '@assets/img/dashboard/stx_icon.svg';
import OptionsDialog from '@components/optionsDialog/optionsDialog';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useGetBrc20FungibleTokens } from '@hooks/queries/ordinals/useGetBrc20FungibleTokens';
import { useRuneFungibleTokensQuery } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import { useGetSip10FungibleTokens } from '@hooks/queries/stx/useGetSip10FungibleTokens';
import useOptionsDialog from '@hooks/useOptionsDialog';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import CoinItem from '@screens/manageTokens/coinItem';
import {
  type FungibleTokenProtocol,
  type FungibleTokenWithStates,
} from '@secretkeylabs/xverse-core';
import {
  setBrc20ManageTokensAction,
  setRunesManageTokensAction,
  setShowSpamTokensAction,
  setSip10ManageTokensAction,
} from '@stores/wallet/actions/actionCreators';
import { TabItem } from '@ui-library/tabs';
import { SPAM_OPTIONS_WIDTH } from '@utils/constants';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Theme from 'theme';
import {
  ButtonRow,
  Container,
  Description,
  ErrorsText,
  FtInfoContainer,
  Header,
  ScrollContainer,
  TokenContainer,
  TokenText,
} from './index.styled';

function Stacks() {
  const { hideStx } = useWalletSelector();
  const { toggleStxVisibility } = useWalletReducer();
  const tickerConstant = 'STX';
  return (
    <CoinItem
      id={tickerConstant}
      key={tickerConstant}
      name="Stacks"
      ticker={tickerConstant}
      image={stacksIcon}
      disabled={false}
      toggled={toggleStxVisibility}
      enabled={!hideStx}
    />
  );
}

function ManageTokens() {
  const { t } = useTranslation('translation', { keyPrefix: 'TOKEN_SCREEN' });

  const selectedAccount = useSelectedAccount();
  const { showSpamTokens } = useWalletSelector();
  const { data: runesList, isError: runeError } = useRuneFungibleTokensQuery((data) =>
    data.filter((ft) => ft.showToggle),
  );
  const { data: sip10List, isError: sip10Error } = useGetSip10FungibleTokens((data) =>
    data.filter((ft) => ft.showToggle),
  );
  const { data: brc20List, isError: brc20Error } = useGetBrc20FungibleTokens((data) =>
    data.filter((ft) => ft.showToggle),
  );

  const [selectedProtocol, setSelectedProtocol] = useState<FungibleTokenProtocol>('runes');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const menuDialog = useOptionsDialog(SPAM_OPTIONS_WIDTH);

  const toggled = (isEnabled: boolean, _coinName: string, coinKey: string) => {
    const runeFt = runesList?.find((ft: FungibleTokenWithStates) => ft.principal === coinKey);
    const sip10Ft = sip10List?.find((ft: FungibleTokenWithStates) => ft.principal === coinKey);
    const brc20Ft = brc20List?.find((ft: FungibleTokenWithStates) => ft.principal === coinKey);

    const payload = { principal: coinKey, isEnabled };

    if (selectedProtocol === 'runes' && runeFt) {
      dispatch(setRunesManageTokensAction(payload));
    } else if (selectedProtocol === 'stacks' && sip10Ft) {
      dispatch(setSip10ManageTokensAction(payload));
    } else if (selectedProtocol === 'brc-20' && brc20Ft) {
      dispatch(setBrc20ManageTokensAction(payload));
    }
  };

  const handleBackButtonClick = () => navigate('/');

  const getCoinsList = () => {
    let coins: FungibleTokenWithStates[];
    let error: boolean;
    switch (selectedProtocol) {
      case 'stacks':
        coins = sip10List ?? [];
        error = sip10Error;
        break;
      case 'brc-20':
        coins = brc20List ?? [];
        error = brc20Error;
        break;
      case 'runes':
        coins = runesList ?? [];
        error = runeError;
        break;
      default:
        coins = [];
        error = false;
    }

    if (error) return <ErrorsText>{t('FAILED_TO_FETCH')}</ErrorsText>;

    return (
      <>
        {selectedProtocol === 'stacks' && <Stacks />}
        {coins.map((coin) => (
          <CoinItem
            id={coin.principal}
            key={coin.principal}
            name={coin.name}
            image={coin.image}
            ticker={coin.ticker}
            runeInscriptionId={coin.runeInscriptionId}
            runeSymbol={coin.runeSymbol}
            disabled={false}
            toggled={toggled}
            enabled={coin.isEnabled}
            protocol={selectedProtocol}
          />
        ))}
        {!coins.length && <ErrorsText>{t('NO_COINS')}</ErrorsText>}
      </>
    );
  };

  return (
    <>
      <TopRow onClick={handleBackButtonClick} onMenuClick={menuDialog.open} />
      {menuDialog.isVisible && (
        <OptionsDialog
          closeDialog={menuDialog.close}
          optionsDialogIndents={menuDialog.indents}
          width={SPAM_OPTIONS_WIDTH}
        >
          <ButtonRow
            onClick={() => {
              dispatch(setShowSpamTokensAction(!showSpamTokens));
            }}
          >
            {showSpamTokens ? (
              <EyeSlash size={24} color={Theme.colors.white_200} />
            ) : (
              <Eye size={24} color={Theme.colors.white_200} />
            )}
            <TokenText color="white_200" typography="body_medium_l">
              {showSpamTokens ? t('HIDE_SPAM_TOKENS') : t('DISPLAY_SPAM_TOKENS')}
            </TokenText>
          </ButtonRow>
        </OptionsDialog>
      )}
      <ScrollContainer>
        <Container>
          <Header>{t('ADD_COINS')}</Header>
          <Description>{t('DESCRIPTION')}</Description>
          <FtInfoContainer>
            <TabItem
              $active={selectedProtocol === 'runes'}
              onClick={() => setSelectedProtocol('runes')}
            >
              RUNES
            </TabItem>
            <TabItem
              $active={selectedProtocol === 'brc-20'}
              onClick={() => setSelectedProtocol('brc-20')}
            >
              BRC-20
            </TabItem>
            {selectedAccount?.stxAddress && (
              <TabItem
                $active={selectedProtocol === 'stacks'}
                onClick={() => setSelectedProtocol('stacks')}
              >
                STACKS
              </TabItem>
            )}
          </FtInfoContainer>
          <TokenContainer>{getCoinsList()}</TokenContainer>
        </Container>
      </ScrollContainer>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default ManageTokens;
