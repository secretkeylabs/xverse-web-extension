import Eye from '@assets/img/createPassword/Eye.svg';
import Cross from '@assets/img/dashboard/X.svg';
import CopyButton from '@components/copyButton';
import { getTruncatedAddress } from '@utils/helper';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  alignItems: 'center',
});

const Icon = styled.img((props) => ({
  marginRight: props.theme.space.xs,
  width: 32,
  height: 32,
  borderRadius: 30,
}));

const Button = styled.button({
  background: 'none',
  display: 'flex',
});

const AddressContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'flex-end',
});

const TitleText = styled.p<{ $color?: string }>((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.$color ? props.theme.colors[props.$color] : props.theme.colors.white_200,
}));

const ValueText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
}));

const AmountText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
}));

const ColumnContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const ScriptOutputHeadingText = styled.p((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white_0,
  marginBottom: props.theme.space.l,
}));

const ScriptText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  width: 320,
  wordWrap: 'break-word',
}));

const CrossContainer = styled.div({
  display: 'flex',
  marginTop: 10,
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
});

const TransparentButton = styled.button({
  background: 'transparent',
  display: 'flex',
  alignItems: 'center',
  marginLeft: 10,
});

const ShowScriptBackgroundContainer = styled.div((props) => ({
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  position: 'fixed',
  background: props.theme.colors.background.modalBackdrop2,
  backdropFilter: 'blur(16px)',
  padding: props.theme.space.m,
  display: 'flex',
  flexDirection: 'column',
}));

type Props = {
  icon?: string;
  title?: string;
  amount?: string;
  dataTestID?: string;
  children?: ReactNode;
  address: string;
  hideAddress?: boolean;
  hideCopyButton?: boolean;
  outputScript?: Array<any>;
  outputScriptIndex?: number;
  titleColor?: string;
};

function TransferDetailView({
  icon,
  title,
  amount,
  dataTestID,
  children,
  address,
  hideAddress,
  hideCopyButton,
  outputScript,
  outputScriptIndex,
  titleColor,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const [showScriptOutput, setShowScriptOutput] = useState(false);

  const onButtonClick = () => {
    setShowScriptOutput(true);
  };

  const onCrossClick = () => {
    setShowScriptOutput(false);
  };

  return (
    <>
      {showScriptOutput && (
        <ShowScriptBackgroundContainer>
          <CrossContainer>
            <TransparentButton onClick={onCrossClick}>
              <img src={Cross} alt="cross" />
            </TransparentButton>
          </CrossContainer>
          <ScriptOutputHeadingText>{`${t(
            'SCRIPT_OUTPUT',
          )} #${outputScriptIndex}`}</ScriptOutputHeadingText>
          {outputScript &&
            outputScript.map((script) => {
              const keyProp = script.toString().substring(0, 5);
              if (script instanceof Uint8Array) {
                return <ScriptText key={keyProp}>{new TextDecoder().decode(script)},</ScriptText>;
              }
              return <ScriptText key={keyProp}>{script},</ScriptText>;
            })}
        </ShowScriptBackgroundContainer>
      )}

      <RowContainer>
        {icon && <Icon src={icon} />}
        {amount ? (
          <ColumnContainer>
            <AmountText data-testid={dataTestID}>{amount}</AmountText>
            {children}
          </ColumnContainer>
        ) : (
          <TitleText $color={titleColor}>{title}</TitleText>
        )}
        <AddressContainer>
          {outputScript && (
            <Button onClick={onButtonClick}>
              <img src={Eye} alt="show-script" height={24} />
            </Button>
          )}
          {!hideAddress && (
            <ValueText data-testid="address-receive">{getTruncatedAddress(address, 6)}</ValueText>
          )}
          {!hideCopyButton && <CopyButton text={address} />}
        </AddressContainer>
      </RowContainer>
    </>
  );
}

export default TransferDetailView;
