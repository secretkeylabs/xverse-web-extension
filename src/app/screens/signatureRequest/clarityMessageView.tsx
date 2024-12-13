import { hexToBytes } from '@noble/hashes/utils';
import { ClarityType, cvToString, type ClarityValue } from '@stacks/transactions';
import styled from 'styled-components';

const Container = styled.div<{ isRoot: boolean }>((props) => ({
  marginTop: props.isRoot ? 0 : 20,
  marginLeft: props.isRoot ? 0 : -5,
}));

const ContentContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
});

const ClarityValueText = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white_0,
  wordWrap: 'break-word',
}));

const ClarityValueKey = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white_200,
  marginRight: props.theme.spacing(4),
  wordWrap: 'break-word',
}));

function wrapText(text: string): JSX.Element {
  return <ClarityValueText>{text}</ClarityValueText>;
}

function bytesToAscii(arr) {
  return String.fromCharCode.apply(null, arr);
}

interface ClarityMessageViewProps {
  val: ClarityValue;
  encoding?: 'tryAscii' | 'hex';
  isRoot?: boolean;
}
export default function ClarityMessageView(props: ClarityMessageViewProps) {
  const { val, encoding, isRoot = true } = props;

  switch (val.type) {
    case ClarityType.BoolTrue:
      return wrapText('true');
    case ClarityType.BoolFalse:
      return wrapText('false');
    case ClarityType.Int:
      return wrapText(val.value.toString());
    case ClarityType.UInt:
      return wrapText(`u${val.value.toString()}`);
    case ClarityType.Buffer:
      if (encoding === 'tryAscii') {
        const str = bytesToAscii(hexToBytes(val.value));
        if (/[ -~]/.test(str)) {
          return JSON.stringify(str);
        }
      }
      return wrapText(`0x${val.value}`);
    case ClarityType.OptionalNone:
      return wrapText('none');
    case ClarityType.OptionalSome:
      return wrapText(`some ${cvToString(val.value, encoding)}`);
    case ClarityType.ResponseErr:
      return wrapText(`err ${cvToString(val.value, encoding)}`);
    case ClarityType.ResponseOk:
      return wrapText(`ok ${cvToString(val.value, encoding)}`);
    case ClarityType.PrincipalStandard:
    case ClarityType.PrincipalContract:
      return wrapText(cvToString(val));
    case ClarityType.List:
      return wrapText(`[${val.value.map((v) => cvToString(v, encoding)).join(', ')}]`);
    case ClarityType.Tuple:
      return (
        <Container isRoot={isRoot}>
          {Object.entries(val.value).map(([key, value]) => (
            <ContentContainer key={key}>
              <ClarityValueKey>{key}:</ClarityValueKey>
              <ClarityValueText>
                <ClarityMessageView val={value} encoding="tryAscii" isRoot={false} />
              </ClarityValueText>
            </ContentContainer>
          ))}
        </Container>
      );
    case ClarityType.StringASCII:
      return wrapText(`"${val.value}"`);
    case ClarityType.StringUTF8:
      return wrapText(`u"${val.value}"`);
    default:
      return <> </>;
  }
}
