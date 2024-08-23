import DropDownIcon from '@assets/img/transactions/dropDownIcon.svg';
import { useParsedTxSummaryContext } from '@components/confirmBtcTransaction/hooks/useParsedTxSummaryContext';
import { animated, config, useSpring } from '@react-spring/web';
import { StyledP } from '@ui-library/common.styled';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { isScriptOutput } from '../utils';
import TransactionInput from './transactionInput';
import TransactionOutput from './transactionOutput';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  borderRadius: props.theme.space.s,
  background: props.theme.colors.elevation1,
  padding: props.theme.space.m,
  marginBottom: props.theme.space.s,
}));

const Button = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => props.theme.colors.elevation1};
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const OutputTitleText = styled(StyledP)((props) => ({
  marginBottom: props.theme.space.m,
}));

const ExpandedContainer = styled(animated.div)((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.space.m,
}));

function TxInOutput() {
  const [isExpanded, setIsExpanded] = useState(false);

  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { summary } = useParsedTxSummaryContext();

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

  let scriptOutputCount = 1;

  return (
    <Container>
      <Button type="button" onClick={() => setIsExpanded((prevState) => !prevState)}>
        <Row>
          <StyledP typography="body_medium_m" color="white_400">
            {isExpanded ? t('INPUT') : t('INPUT_AND_OUTPUT')}
          </StyledP>
        </Row>
        <animated.img style={arrowRotation} src={DropDownIcon} alt="Dropdown" />
      </Button>
      {isExpanded && (
        <ExpandedContainer style={slideInStyles}>
          {summary?.inputs.map((input) => (
            <TransactionInput input={input} key={input.extendedUtxo.outpoint} />
          ))}
          <OutputTitleText typography="body_medium_m" color="white_400">
            {t('OUTPUT')}
          </OutputTitleText>
          {summary?.outputs.map((output, index) => (
            <TransactionOutput
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              output={output}
              scriptOutputCount={isScriptOutput(output) ? scriptOutputCount++ : undefined}
            />
          ))}
        </ExpandedContainer>
      )}
    </Container>
  );
}

export default TxInOutput;
