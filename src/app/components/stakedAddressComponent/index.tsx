import AddressIcon from '@assets/img/transactions/address.svg';
import LockIcon from '@assets/img/transactions/Lock.svg';
import ScriptIcon from '@assets/img/transactions/ScriptIcon.svg';
import AccountRow from '@components/accountRow';
import TokenImage from '@components/tokenImage';
import TransferDetailView from '@components/transferDetailView';
import useCoinRates from '@hooks/queries/useCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import { CubeTransparent } from '@phosphor-icons/react';
import type { Account } from '@secretkeylabs/xverse-core';
import { currencySymbolMap, FungibleToken, getFiatEquivalent } from '@secretkeylabs/xverse-core';
import { CurrencyTypes, MAX_ACC_NAME_LENGTH } from '@utils/constants';
import { formatDate } from '@utils/date';
import { getAccountGradient } from '@utils/gradient';
import { getTicker } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const GradientCircle = styled.div<{
  firstGradient: string;
  secondGradient: string;
  thirdGradient: string;
}>((props) => ({
  width: 32,
  height: 32,
  borderRadius: 25,
  background: `linear-gradient(to bottom,${props.firstGradient}, ${props.secondGradient},${props.thirdGradient} )`,
}));

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: '16px 16px',
  justifyContent: 'center',
  marginBottom: 12,
}));

const RecipientTitleText = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.space.xs,
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  alignItems: 'flex-start',
  marginBottom: 12,
});
const AccountContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  alignItems: 'center',
  gap: 8,
});

const Icon = styled.img((props) => ({
  marginRight: props.theme.spacing(4),
  width: 32,
  height: 32,
  borderRadius: 30,
}));

const DownArrowIcon = styled.img((props) => ({
  width: 16,
  height: 16,
  marginTop: props.theme.spacing(4),
  marginLeft: props.theme.spacing(4),
  marginBottom: props.theme.spacing(4),
}));

const TitleText = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_200,
  textAlign: 'center',
}));

const ValueText = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_0,
}));

const SubValueText = styled.p((props) => ({
  ...props.theme.body_m,
  fontSize: 12,
  color: props.theme.colors.white_400,
}));

const TokenContainer = styled.div({
  marginRight: 10,
});

const IconContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 30,
  backgroundColor: props.theme.colors.elevation3,
  width: 32,
  height: 32,
  marginRight: props.theme.spacing(4),
}));

const LockTimeContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'flex-end',
});

function LockTimeRow({ icon, title, lockTime }: { icon: string; title: string; lockTime: number }) {
  const date = formatDate(new Date(lockTime * 1000));
  return (
    <LockTimeContainer>
      {icon && <Icon src={icon} />}
      <TitleText>{title}</TitleText>
      <LockTimeContainer>
        <ValueText>{date}</ValueText>
      </LockTimeContainer>
    </LockTimeContainer>
  );
}

interface Props {
  address?: string;
  value: string;
  title: string;
  script: string;
  locktime: number;
  currencyType: CurrencyTypes;
  valueDetail?: string;
  icon?: string;
  fungibleToken?: FungibleToken;
  heading?: string;
  account?: Account;
}
function StakedAddressComponent({
  address,
  script,
  locktime,
  value,
  valueDetail,
  title,
  fungibleToken,
  icon,
  currencyType,
  heading,
  account,
}: Props) {
  const { t } = useTranslation('translation');
  const [fiatAmount, setFiatAmount] = useState<string | undefined>('0');
  const { fiatCurrency } = useWalletSelector();
  const { btcFiatRate, stxBtcRate } = useCoinRates();
  const gradient = getAccountGradient(account?.stxAddress || account?.btcAddress!);

  useEffect(() => {
    setFiatAmount(
      getFiatEquivalent(
        Number(value),
        currencyType,
        BigNumber(stxBtcRate),
        BigNumber(btcFiatRate),
        fungibleToken,
      ),
    );
  }, [value]);

  function getFtTicker() {
    if (fungibleToken?.ticker) {
      return fungibleToken?.ticker.toUpperCase();
    }
    if (fungibleToken?.name) {
      return getTicker(fungibleToken.name).toUpperCase();
    }
    return '';
  }

  const getFiatAmountString = (amount: BigNumber) => {
    if (amount) {
      if (amount.isLessThan(0.01)) {
        return `<${currencySymbolMap[fiatCurrency]}0.01 ${fiatCurrency}`;
      }
      return (
        <NumericFormat
          value={amount.toFixed(2).toString()}
          displayType="text"
          thousandSeparator
          prefix={`~ ${currencySymbolMap[fiatCurrency]} `}
          suffix={` ${fiatCurrency}`}
        />
      );
    }
    return '';
  };

  const renderIcon = () => {
    if (currencyType === 'RareSat') {
      return (
        <IconContainer>
          <CubeTransparent size="16" weight="regular" />
        </IconContainer>
      );
    }

    if (icon) {
      return <Icon src={icon} />;
    }

    return (
      <TokenContainer>
        <TokenImage
          currency={currencyType}
          loading={false}
          size={32}
          fungibleToken={fungibleToken}
        />
      </TokenContainer>
    );
  };

  const getName = () => {
    const name =
      account?.accountName ??
      account?.bnsName ??
      `${t('ACCOUNT_NAME')} ${`${(account?.id ?? 0) + 1}`}`;

    return name.length > MAX_ACC_NAME_LENGTH ? `${name.slice(0, MAX_ACC_NAME_LENGTH)}...` : name;
  };

  return (
    <Container>
      {heading && <RecipientTitleText>{heading}</RecipientTitleText>}
      {address && (
        <RowContainer>
          <TransferDetailView icon={AddressIcon} title={t('STAKES.ADDRESS')} address={address} />
        </RowContainer>
      )}
      {/* {value && (
        <RowContainer>
          {renderIcon()}
          <TitleText>{title}</TitleText>
          {currencyType === 'NFT' || currencyType === 'Ordinal' || currencyType === 'RareSat' ? (
            <ColumnContainer>
              <ValueText>{value}</ValueText>
              {valueDetail && <SubValueText>{valueDetail}</SubValueText>}
            </ColumnContainer>
          ) : (
            <ColumnContainer>
              <NumericFormat
                value={Number(value)}
                displayType="text"
                thousandSeparator
                suffix={currencyType === 'FT' ? ` ${getFtTicker()} ` : ` ${currencyType}`}
                renderText={(amount) => <ValueText>{amount}</ValueText>}
              />
              <SubValueText>{getFiatAmountString(new BigNumber(fiatAmount!))}</SubValueText>
            </ColumnContainer>
          )}
        </RowContainer>
      )} */}
      {script && (
        <RowContainer>
          <TransferDetailView
            icon={ScriptIcon}
            title={t('STAKES.REDEEM_SCRIPT')}
            address={script}
          />
        </RowContainer>
      )}
      {locktime && (
        <RowContainer>
          <LockTimeRow icon={LockIcon} title={t('STAKES.LOCK_TIME')} lockTime={locktime} />
          {/* <TransferDetailView icon={LockIcon} title={t('LOCK_TIME')} address={lockTime} /> */}
        </RowContainer>
      )}

      {account && (
        <div>
          <AccountContainer>
            <GradientCircle
              firstGradient={gradient[0]}
              secondGradient={gradient[1]}
              thirdGradient={gradient[2]}
            />
            <TitleText>{getName()}</TitleText>
          </AccountContainer>
        </div>
      )}
    </Container>
  );
}

export default StakedAddressComponent;
