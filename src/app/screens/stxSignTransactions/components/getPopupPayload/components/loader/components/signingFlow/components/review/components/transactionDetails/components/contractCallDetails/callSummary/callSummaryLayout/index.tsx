import {
  ClarityType,
  cvToString,
  getTypeString,
  type ClarityAbiFunction,
  type ClarityValue,
  type ContractCallPayload,
} from '@stacks/transactions';
import {
  truncateContractPrincipal,
  truncateStandardPrincipal,
  truncateTextMiddle,
} from '@utils/helper';

import { Card, CardRowContainer, CardRowPrimary, CardRowSecondary, CardStack } from '../../../card';
import { contractPrincipalFromContractCallPayload } from '../../postConditions/utils';
import { CopyableText } from './components/copyableText';
import { useFunctionInterface } from './hooks';

type ArgumentsProps = {
  args: ClarityValue[];
  functionInterface?: ClarityAbiFunction | undefined | null;
};

function Arguments({ args, functionInterface }: ArgumentsProps) {
  return args.map((arg, index) => {
    const argString = cvToString(arg);
    const key = `arg-${index}-${argString}`;
    const type = (() => {
      const argType = functionInterface?.args[index]?.type;
      if (!argType) return;
      return truncateTextMiddle(getTypeString(functionInterface.args[index].type), 30);
    })();
    const argDisplayText = (() => {
      if (arg.type === ClarityType.PrincipalStandard) return truncateStandardPrincipal(argString);
      if (arg.type === ClarityType.PrincipalContract) return truncateContractPrincipal(argString);
      return truncateTextMiddle(argString, 30);
    })();
    const argName = functionInterface?.args[index]?.name ?? `arg. ${index}`;
    return (
      <CardRowContainer key={key}>
        <CardRowPrimary title={argName} value={argDisplayText} />
        {type && <CardRowSecondary value={type} />}
      </CardRowContainer>
    );
  });
}

type CallSummaryLayoutProps = {
  contractPrincipal: string;
  functionName: string;
  functionArgs: ClarityValue[];
  functionInterface?: ClarityAbiFunction | undefined | null;
};

function CallSummaryLayout({
  contractPrincipal,
  functionName,
  functionArgs,
  functionInterface,
}: CallSummaryLayoutProps) {
  return (
    <Card>
      <CardStack>
        <CardRowPrimary
          title="Contract"
          value={
            <CopyableText
              text={contractPrincipal}
              displayText={truncateContractPrincipal(contractPrincipal)}
            />
          }
        />
        <CardRowPrimary title="Function" value={<CopyableText text={functionName} />} />
        <Arguments args={functionArgs} functionInterface={functionInterface} />
      </CardStack>
    </Card>
  );
}

type CallSummaryLoaderProps = {
  payload: ContractCallPayload;
};

export function CallSummaryLoader({ payload }: CallSummaryLoaderProps) {
  const contractPrincipal = contractPrincipalFromContractCallPayload(payload);
  const functionName = payload.functionName.content;
  const { functionArgs } = payload;
  const functionInterface = useFunctionInterface({ contractPrincipal, functionName });
  return (
    <CallSummaryLayout
      functionInterface={functionInterface}
      contractPrincipal={contractPrincipal}
      functionArgs={functionArgs}
      functionName={functionName}
    />
  );
}
