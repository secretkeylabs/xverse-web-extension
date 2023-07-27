import styled from 'styled-components';
import DropDownIcon from '@assets/img/transactions/dropDownIcon.svg';
import OutputIcon from '@assets/img/transactions/output.svg';
import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import ScriptIcon from '@assets/img/transactions/ScriptIcon.svg';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import { animated, config, useSpring } from '@react-spring/web';
import { StoreState } from '@stores/index';
import TransferDetailView from '@components/transferDetailView';
import { ParsedPSBT, PSBTInput, satsToBtc } from '@secretkeylabs/xverse-core';
import { getTruncatedAddress } from '@utils/helper';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.background.elevation1,
  borderRadius: 12,
  paddingTop: 12,
  paddingLeft: 16,
  paddingRight: 16,
  paddingBottom: 12,
  justifyContent: 'center',
  marginBottom: 12,
  overflowY: 'auto',
}));

const TransferDetailContainer = styled.div((props) => ({
  paddingBottom: props.theme.spacing(8),
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[200],
}));

const OutputTitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[200],
  marginBottom: props.theme.spacing(6),
}));

const SubValueText = styled.h1((props) => ({
  ...props.theme.body_m,
  fontSize: 12,
  color: props.theme.colors.white[400],
}));

const TxIdText = styled.h1((props) => ({
  ...props.theme.body_m,
  fontSize: 12,
  color: props.theme.colors.white[0],
  marginLeft: 4,
}));

const YourAddressText = styled.h1((props) => ({
  ...props.theme.body_m,
  fontSize: 12,
  color: props.theme.colors.white[0],
  marginRight: 4,
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'flex-end',
});

const DropDownContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'flex-end',
});

const TxIdContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const ExpandedContainer = styled(animated.div)({
  display: 'flex',
  flexDirection: 'column',
  marginTop: 16,
});

const Button = styled.button((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'transparent',
  marginLeft: props.theme.spacing(4),
}));

interface Props {
  address: string[];
  parsedPsbt: ParsedPSBT;
  isExpanded: boolean;
  onArrowClick: () => void;
}

function InputOutputComponent({ address, parsedPsbt, isExpanded, onArrowClick }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { btcAddress, ordinalsAddress } = useSelector((state: StoreState) => state.walletState);

  const slideInStyles = useSpring({
    config: { ...config.gentle, duration: 400 },
    from: { opacity: 0, height: 0 },
    to: {
      opacity: isExpanded ? 1 : 0,
      height: isExpanded ? 'auto' : 0,
    },
  });

  const arrowRotation = useSpring({
    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
    config: { ...config.stiff },
  });

  const renderAddress = (addressToBeDisplayed: string) =>
    addressToBeDisplayed === btcAddress || addressToBeDisplayed === ordinalsAddress ? (
      <TxIdContainer>
        <YourAddressText>(Your Address)</YourAddressText>
        <SubValueText>{getTruncatedAddress(addressToBeDisplayed)}</SubValueText>
      </TxIdContainer>
    ) : (
      <SubValueText>{getTruncatedAddress(addressToBeDisplayed)}</SubValueText>
    );
  const renderSubValue = (input: PSBTInput, address: string) =>
    input.userSigns ? (
      renderAddress(address)
    ) : (
      <TxIdContainer>
        <SubValueText>{getTruncatedAddress(input.txid)}</SubValueText>
        <TxIdText>(txid)</TxIdText>
      </TxIdContainer>
    );

  return (
    <Container>
      <RowContainer>
        <TitleText>{isExpanded ? t('INPUT') : t('INPUT_AND_OUTPUT')}</TitleText>
        <DropDownContainer>
          <Button onClick={onArrowClick}>
            <animated.img style={arrowRotation} src={DropDownIcon} alt="Drop Down" />
          </Button>
        </DropDownContainer>
      </RowContainer>

      {isExpanded && (
        <ExpandedContainer style={slideInStyles}>
          {parsedPsbt?.inputs.map((input, index) => (
            <TransferDetailContainer>
              <TransferDetailView
                icon={IconBitcoin}
                hideAddress
                hideCopyButton={btcAddress === address[index] || ordinalsAddress === address[index]}
                amount={`${satsToBtc(new BigNumber(input.value)).toString()} BTC`}
                address={input.userSigns ? address[index] : input.txid}
              >
                {renderSubValue(input, address[index])}
              </TransferDetailView>
            </TransferDetailContainer>
          ))}

          <OutputTitleText>{t('OUTPUT')}</OutputTitleText>
          {parsedPsbt?.outputs.map((output, index) => (
            <TransferDetailContainer>
              {output.outputScript ? (
                <TransferDetailView
                  icon={ScriptIcon}
                  hideAddress
                  hideCopyButton={true}
                  amount={`${satsToBtc(new BigNumber(output ? output.amount : 0n)).toString()} BTC`}
                  address={output.address}
                  outputScript={output.outputScript}
                  outputScriptIndex={index}
                >
                  <SubValueText>{`${t('SCRIPT_OUTPUT')} #${index}`}</SubValueText>
                </TransferDetailView>
              ) : (
                <TransferDetailView
                  icon={OutputIcon}
                  hideAddress
                  hideCopyButton={
                    btcAddress === output.address || ordinalsAddress === output.address
                  }
                  amount={`${satsToBtc(new BigNumber(output ? output.amount : 0n)).toString()} BTC`}
                  address={output.address}
                >
                  {output.address === btcAddress || output.address === ordinalsAddress ? (
                    <TxIdContainer>
                      <YourAddressText>(Your Address)</YourAddressText>
                      <SubValueText>{getTruncatedAddress(output.address)}</SubValueText>
                    </TxIdContainer>
                  ) : (
                    <SubValueText>{getTruncatedAddress(output.address)}</SubValueText>
                  )}
                </TransferDetailView>
              )}
            </TransferDetailContainer>
          ))}
        </ExpandedContainer>
      )}
    </Container>
  );
}

export default InputOutputComponent;
