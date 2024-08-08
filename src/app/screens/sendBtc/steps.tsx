export enum Step {
  SelectRecipient = 0,
  SelectAmount = 1,
  Confirm = 2,
}

export const getNextStep = (currentStep: Step) => {
  switch (currentStep) {
    case Step.SelectRecipient:
      return Step.SelectAmount;
    case Step.SelectAmount:
      return Step.Confirm;
    case Step.Confirm:
      return Step.Confirm;
    default:
      throw new Error(`Unknown step: ${currentStep}`);
  }
};

export const getPreviousStep = (currentStep: Step) => {
  switch (currentStep) {
    case Step.SelectRecipient:
      return Step.SelectRecipient;
    case Step.SelectAmount:
      return Step.SelectRecipient;
    case Step.Confirm:
      return Step.SelectAmount;
    default:
      throw new Error(`Unknown step: ${currentStep}`);
  }
};
