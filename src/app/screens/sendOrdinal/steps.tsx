export enum Step {
  SelectRecipient = 0,
  Confirm = 1,
}

export const getNextStep = (currentStep: Step) => {
  switch (currentStep) {
    case Step.SelectRecipient:
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
    case Step.Confirm:
      return Step.SelectRecipient;
    default:
      throw new Error(`Unknown step: ${currentStep}`);
  }
};
