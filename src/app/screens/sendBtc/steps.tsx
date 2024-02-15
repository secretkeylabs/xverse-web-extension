export enum Step {
  SelectRecipient = 0,
  SelectAmount = 1,
  Confirm = 2,
}

export const getNextStep = (currentStep: Step, amountEditable: boolean) => {
  switch (currentStep) {
    case Step.SelectRecipient:
      return amountEditable ? Step.SelectAmount : Step.Confirm;
    case Step.SelectAmount:
      return Step.Confirm;
    case Step.Confirm:
      return Step.Confirm;
    default:
      throw new Error(`Unknown step: ${currentStep}`);
  }
};

export const getPreviousStep = (
  currentStep: Step,
  addressEditable: boolean,
  amountEditable: boolean,
) => {
  switch (currentStep) {
    case Step.SelectRecipient:
      return Step.SelectRecipient;
    case Step.SelectAmount:
      return addressEditable ? Step.SelectRecipient : Step.SelectAmount;
      return Step.SelectRecipient;
    case Step.Confirm:
      return amountEditable ? Step.SelectAmount : Step.SelectRecipient;
    default:
      throw new Error(`Unknown step: ${currentStep}`);
  }
};
