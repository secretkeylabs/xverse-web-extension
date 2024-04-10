// ToDo: fill with better passworddata
export const passwordTestCases = [
  {
    password: '123',
    expectations: {
      errorMessageVisible: true,
      securityLevel: 'Weak',
      continueButtonEnabled: false,
    },
  },
  {
    password: '123456789',
    expectations: {
      errorMessageVisible: true,
      securityLevel: 'Weak',
      continueButtonEnabled: false,
    },
  },
  {
    password: 'Admin@1234',
    expectations: {
      errorMessageVisible: false,
      securityLevel: 'Medium',
      continueButtonEnabled: true,
    },
  },
  {
    password: 'Admin@1234!!',
    expectations: {
      errorMessageVisible: false,
      securityLevel: 'Strong',
      continueButtonEnabled: true,
    },
  },
];

module.exports = { passwordTestCases };
