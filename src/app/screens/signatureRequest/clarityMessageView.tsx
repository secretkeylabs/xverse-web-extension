import {
  bytesToHex, ClarityType, ClarityValue, cvToString,
} from '@stacks/transactions';
import { principalToString } from '@stacks/transactions/dist/esm/clarity/types/principalCV';
import styled from 'styled-components';

const Container = styled.div<{ isRoot: boolean }>((props) => ({
  marginTop: props.isRoot ? 0 : 20,
  marginLeft: props.isRoot ? 0 : -5,
}));

const ContentContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
});

const ClarityValueText = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[0],
  wordWrap: 'break-word',
}));

const ClarityValueKey = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[200],
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
        const str = bytesToAscii(val.buffer);
        if (/[ -~]/.test(str)) return wrapText(JSON.stringify(str));
      }
      return wrapText(`0x${bytesToHex(val.buffer)}`);
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
      return wrapText(principalToString(val));
    case ClarityType.List:
      return wrapText(`[${val.list.map((v) => cvToString(v, encoding)).join(', ')}]`);
    case ClarityType.Tuple:
      return (
        <Container isRoot={isRoot}>
          {Object.entries(val.data).map(([key, value]) => (
            <ContentContainer>
              <ClarityValueKey>
                {key}
                :
              </ClarityValueKey>
              <ClarityValueText>
                <ClarityMessageView val={value} encoding="tryAscii" isRoot={false} />
              </ClarityValueText>
            </ContentContainer>
          ))}
        </Container>
      );
    case ClarityType.StringASCII:
      return wrapText(`"${val.data}"`);
    case ClarityType.StringUTF8:
      return wrapText(`u"${val.data}"`);
    default:
      return <> </>;
  }
}
