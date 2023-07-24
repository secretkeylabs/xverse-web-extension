import styled from 'styled-components';
import { getAccountGradient } from '@utils/gradient';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import { useTranslation } from 'react-i18next';
import { getTruncatedAddress, getAddressDetail, isHardwareAccount } from '@utils/helper';
import BarLoader from '@components/barLoader';
import Copy from '@assets/img/Copy.svg';
import { LoaderSize } from '@utils/constants';
import { Account } from '@secretkeylabs/xverse-core';
import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { ChangeShowBtcReceiveAlertAction } from '@stores/wallet/actions/actionCreators';
import useWalletSelector from '@hooks/useWalletSelector';
import LedgerBadge from '@assets/img/ledger/ledger_badge.svg';

interface GradientCircleProps {
  firstGradient: string;
  secondGradient: string;
  thirdGradient: string;
}

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
});

const GradientCircle = styled.div<GradientCircleProps>((props) => ({
  height: 40,
  width: 40,
  borderRadius: 25,
  background: `linear-gradient(to bottom,${props.firstGradient}, ${props.secondGradient},${props.thirdGradient} )`,
}));

const TopSectionContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  paddingTop: props.theme.spacing(8),
  backgroundColor: 'transparent',
  cursor: 'pointer',
}));

const CurrentAcountContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(6),
}));

const CurrentAccountTextContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: props.theme.spacing(4),
}));

const CurrentSelectedAccountText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['0'],
  textAlign: 'start',
}));

const CurrentUnSelectedAccountText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['400'],
  textAlign: 'start',
}));

const CurrentAccountDetailText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['400'],
  marginTop: props.theme.spacing(1),
  display: 'flex',
  justifyContent: 'flex-start',
}));

const BarLoaderContainer = styled.div((props) => ({
  width: 200,
  paddingTop: props.theme.spacing(2),
  backgroundColor: 'transparent',
}));

const CopyImage = styled.img`
  margin-right: 4px;
`;

export const StyledToolTip = styled(Tooltip)`
  background-color: #ffffff;
  color: #12151e;
  border-radius: 8px;
  padding: 7px;
`;

const AddressContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
});

const TransparentSpan = styled.span`
  background: transparent;
`;

const CopyButton = styled.button`
  opacity: 0.6;
  color: #ffffff;
  margin-top: 3px;
  margin-right: 10px;
  display: flex;
  title: Bitcoin;
  flexdirection: row;
  alignitems: center;
  justifycontent: center;
  background: transparent;
  :hover {
    opacity: 1;
  }
  :focus {
    opacity: 1;
  }
`;

const OrdinalImage = styled.img({
  width: 12,
  height: 12,
  marginRight: 4,
});

const AddressText = styled.h1((props) => ({
  ...props.theme.body_m,
  marginTop: props.theme.spacing(1),
  color: props.theme.colors.white['400'],
}));

const BitcoinDot = styled.div((props) => ({
  borderRadius: 20,
  background: props.theme.colors.feedback.caution,
  width: 10,
  marginRight: 4,
  marginLeft: 4,
  height: 10,
}));
interface Props {
  account: Account | null;
  isSelected: boolean;
  allowCopyAddress?: boolean;
  showOrdinalAddress?: boolean;
  onAccountSelected: (account: Account) => void;
}

function AccountRow({
  account,
  isSelected,
  onAccountSelected,
  allowCopyAddress,
  showOrdinalAddress,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'DASHBOARD_SCREEN' });
  const { showBtcReceiveAlert } = useWalletSelector();
  const gradient = getAccountGradient(account?.stxAddress || account?.btcAddress!);
  const [onStxCopied, setOnStxCopied] = useState(false);
  const [onBtcCopied, setOnBtcCopied] = useState(false);
  const dispatch = useDispatch();
  const btcCopiedTooltipTimeoutRef = useRef<NodeJS.Timeout | undefined>();
  const stxCopiedTooltipTimeoutRef = useRef<NodeJS.Timeout | undefined>();

  useEffect(() => () => {
    clearTimeout(btcCopiedTooltipTimeoutRef.current);
    clearTimeout(stxCopiedTooltipTimeoutRef.current);
  }, []);

  const getName = () => {
    const name = (account?.accountName
      ?? account?.bnsName
      ?? `${t('ACCOUNT_NAME')} ${`${(account?.id ?? 0) + 1}`}`
    );

    return name.length > 20 ? `${name.slice(0, 20)}...` : name;
  }

  const handleOnBtcAddressClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    navigator.clipboard.writeText(account?.btcAddress!);
    setOnBtcCopied(true);
    setOnStxCopied(false);
    // set 'Copied' text back to 'Bitcoin address' after 3 seconds
    btcCopiedTooltipTimeoutRef.current = setTimeout(() => setOnBtcCopied(false), 3000);
    if (showBtcReceiveAlert !== null) {
      dispatch(ChangeShowBtcReceiveAlertAction(true));
    }
    event.stopPropagation();
  };

  const handleOnStxAddressClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    navigator.clipboard.writeText(account?.stxAddress!);
    setOnStxCopied(true);
    setOnBtcCopied(false);
    // set 'Copied' text back to 'Stacks address' after 3 seconds
    stxCopiedTooltipTimeoutRef.current = setTimeout(() => setOnStxCopied(false), 3000);
    event.stopPropagation();
  };

  const onClick = () => {
    onAccountSelected(account!);
  };

  const showOrdinalBtcAddress = (
    <RowContainer>
      <AddressContainer>
        <OrdinalImage src={OrdinalsIcon} />
        <AddressText>{`${getTruncatedAddress(account?.ordinalsAddress!)} / `}</AddressText>
      </AddressContainer>
      <AddressContainer>
        <BitcoinDot />
        <AddressText>{`${getTruncatedAddress(account?.btcAddress!)}`}</AddressText>
      </AddressContainer>
    </RowContainer>
  );

  const displayAddress = allowCopyAddress ? (
    <RowContainer>
      <CopyButton id="bitcoin-address" onClick={handleOnBtcAddressClick}>
        <CopyImage src={Copy} alt="copy" />
        <CurrentUnSelectedAccountText>
          {getTruncatedAddress(account?.btcAddress!)}
        </CurrentUnSelectedAccountText>
      </CopyButton>
      <StyledToolTip
        anchorId="bitcoin-address"
        variant="light"
        content={onBtcCopied ? 'Copied' : 'Bitcoin address'}
        events={['hover']}
        place="bottom"
      />

      <CopyButton id="stacks-address" onClick={handleOnStxAddressClick}>
        <CopyImage src={Copy} alt="copy" />
        <CurrentUnSelectedAccountText>
          {getTruncatedAddress(account?.stxAddress!)}
        </CurrentUnSelectedAccountText>
      </CopyButton>
      <StyledToolTip
        anchorId="stacks-address"
        variant="light"
        content={onStxCopied ? 'Copied' : 'Stacks address'}
        events={['hover']}
        place="bottom"
      />
    </RowContainer>
  ) : (
    <CurrentAccountDetailText>
      {showOrdinalAddress ? showOrdinalBtcAddress : getAddressDetail(account!)}
    </CurrentAccountDetailText>
  );

  return (
    <TopSectionContainer onClick={onClick}>
      <GradientCircle
        firstGradient={gradient[0]}
        secondGradient={gradient[1]}
        thirdGradient={gradient[2]}
      />
      <CurrentAcountContainer>
        {account
          && (isSelected ? (
            <TransparentSpan>
              <CurrentAccountTextContainer>
                <CurrentSelectedAccountText>{getName()}</CurrentSelectedAccountText>
                {isHardwareAccount(account) && <img src={LedgerBadge} alt="Ledger icon" />}
              </CurrentAccountTextContainer>
            </TransparentSpan>
          ) : (
            <TransparentSpan onClick={onClick}>
              <CurrentAccountTextContainer>
                <CurrentUnSelectedAccountText>{getName()}</CurrentUnSelectedAccountText>
                {isHardwareAccount(account) && <img src={LedgerBadge} alt="Ledger icon" />}
              </CurrentAccountTextContainer>
            </TransparentSpan>
          ))}

        {!!account && !isHardwareAccount(account) && (
          displayAddress
        )}

        {!account && (
          <BarLoaderContainer>
            <BarLoader loaderSize={LoaderSize.LARGE} />
            <BarLoader loaderSize={LoaderSize.MEDIUM} />
          </BarLoaderContainer>
        )}
      </CurrentAcountContainer>
    </TopSectionContainer>
  );
}

export default AccountRow;
