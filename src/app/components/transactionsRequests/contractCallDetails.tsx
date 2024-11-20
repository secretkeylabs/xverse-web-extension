import DropDownIcon from '@assets/img/transactions/dropDownIcon.svg';
import CopyButton from '@components/copyButton';
import { animated, config, useSpring } from '@react-spring/web';
import { extractFromPayload, type Args, type ContractFunction } from '@secretkeylabs/xverse-core';
import type { ContractCallPayload } from '@stacks/connect';
import { ClarityType, cvToJSON, cvToString, type SomeCV } from '@stacks/transactions';
import { StyledHeading, StyledP } from '@ui-library/common.styled';
import { getTruncatedAddress } from '@utils/helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.space.s,
  background: theme.colors.elevation1,
  padding: theme.space.m,
  marginTop: theme.space.xs,
  marginBottom: theme.space.xs,
}));

const RowContainer = styled.div<{ isLast?: boolean }>(({ theme, isLast }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: !isLast ? theme.space.m : undefined,
}));

const DetailsContainer = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: theme.space.m,
}));

const Button = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => props.theme.colors.elevation1};
`;

const TitleText = styled.p<{ $color?: string }>((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.$color ? props.theme.colors[props.$color] : props.theme.colors.white_400,
}));

const ValueText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
}));

const SubValueText = styled.p((props) => ({
  ...props.theme.typography.body_medium_s,
  textAlign: 'right',
  color: props.theme.colors.white_400,
  marginTop: props.theme.space.xxxs,
}));

const ColumnContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  alignItems: 'flex-end',
});

const ContractAddress = styled.div({
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'flex-end',
});

type ArgToView = { name: string; value: string; type: any };

function ContractCallDetails({
  contractCall,
  functionMetadata,
}: {
  contractCall: ContractCallPayload;
  functionMetadata: ContractFunction;
}) {
  const { t } = useTranslation('translation');
  const [isExpanded, setIsExpanded] = useState(false);

  const arrowRotation = useSpring({
    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
    config: { ...config.stiff },
  });

  const getFunctionArgs = (): Array<ArgToView> => {
    const { funcArgs } = extractFromPayload(contractCall);
    const args: Array<ArgToView> = functionMetadata?.args
      ? functionMetadata?.args?.map((arg: Args, index: number) => {
          const funcArg = cvToJSON(funcArgs[index]);

          const argTypeIsOptionalSome = funcArgs[index].type === ClarityType.OptionalSome;

          const funcArgType = argTypeIsOptionalSome
            ? (funcArgs[index] as SomeCV).value?.type
            : funcArgs[index]?.type;

          const funcArgValString = argTypeIsOptionalSome
            ? cvToString((funcArgs[index] as SomeCV).value, 'tryAscii')
            : cvToString(funcArgs[index]);

          const normalizedValue = (() => {
            switch (funcArgType) {
              case ClarityType.UInt:
                return funcArgValString.split('u').join('');
              case ClarityType.Buffer:
                return funcArgValString.substring(1, funcArgValString.length - 1);
              default:
                return funcArgValString;
            }
          })();
          const argToView: ArgToView = {
            name: arg.name,
            value: normalizedValue,
            type: funcArg.type,
          };

          return argToView;
        })
      : [];
    return args;
  };

  const truncateFunctionArgsView = (value: string) =>
    `${value.substring(0, 8)}...${value.substring(value.length - 8, value.length)}`;

  const functionArgsView = () => {
    const args = getFunctionArgs();
    return args.map((arg, index) => (
      <RowContainer key={arg.name} isLast={index === args.length - 1}>
        <TitleText>{arg.name}</TitleText>
        <ColumnContainer>
          <ValueText>
            {arg.value.length > 20 ? truncateFunctionArgsView(arg.value) : arg.value}
          </ValueText>
          <SubValueText>{arg.type}</SubValueText>
        </ColumnContainer>
      </RowContainer>
    ));
  };
  return (
    <>
      <StyledHeading typography="body_medium_m" color="white_200">
        {t('CONTRACT_CALL_REQUEST.TRANSACTION_DETAILS')}
      </StyledHeading>
      <Container>
        <Button type="button" onClick={() => setIsExpanded((prevState) => !prevState)}>
          <StyledP typography="body_medium_m" color="white_400">
            {t('CONTRACT_CALL_REQUEST.CONTRACT_CALL_DETAILS_TITLE')}
          </StyledP>
          <animated.img style={arrowRotation} src={DropDownIcon} alt="Dropdown" />
        </Button>
        {isExpanded && (
          <DetailsContainer>
            <RowContainer>
              <TitleText>{t('CONTRACT_CALL_REQUEST.CONTRACT_ADDRESS')}</TitleText>
              <ContractAddress>
                <ValueText>
                  {getTruncatedAddress(
                    `${contractCall.contractAddress}${
                      contractCall.contractName ? `.${contractCall.contractName}` : ''
                    }`,
                    6,
                  )}
                </ValueText>
                <CopyButton
                  text={`${contractCall.contractAddress}${
                    contractCall.contractName ? `.${contractCall.contractName}` : ''
                  }`}
                />
              </ContractAddress>
            </RowContainer>
            <RowContainer>
              <TitleText>{t('CONTRACT_CALL_REQUEST.FUNCTION_NAME')}</TitleText>
              <ColumnContainer>
                <ValueText>{contractCall.functionName}</ValueText>
              </ColumnContainer>
            </RowContainer>
            {functionArgsView()}
          </DetailsContainer>
        )}
      </Container>
    </>
  );
}
export default ContractCallDetails;
