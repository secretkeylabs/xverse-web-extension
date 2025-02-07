export enum Step {
  SelectRecipient = 0,
  SelectAccount = 1,
  SelectAmount = 2,
  Confirm = 3,
}

export const getNextStep = (currentStep: Step, canSelectAccount: boolean) => {
  switch (currentStep) {
    case Step.SelectRecipient:
      return canSelectAccount ? Step.SelectAccount : Step.SelectAmount;
    case Step.SelectAccount:
      return Step.SelectAmount;
    case Step.SelectAmount:
      return Step.Confirm;
    case Step.Confirm:
      return Step.Confirm;
    default:
      throw new Error(`Unknown step: ${currentStep}`);
  }
};

export const getPreviousStep = (currentStep: Step, canSelectAccount: boolean) => {
  switch (currentStep) {
    case Step.SelectRecipient:
      return Step.SelectRecipient;
    case Step.SelectAccount:
      return Step.SelectRecipient;
    case Step.SelectAmount:
      return canSelectAccount ? Step.SelectAccount : Step.SelectRecipient;
    case Step.Confirm:
      return Step.SelectAmount;
    default:
      throw new Error(`Unknown step: ${currentStep}`);
  }
};
