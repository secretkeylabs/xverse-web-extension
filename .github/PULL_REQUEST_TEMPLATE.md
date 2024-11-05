# 🔘 PR Type

What kind of change does this PR introduce?

<!-- Please check the one that applies to this PR using "x". -->

- [ ] Bugfix
- [ ] Enhancement
- [ ] Code style update (formatting, local variables)
- [ ] Refactoring (no functional changes, no API changes)
- [ ] Build related changes
- [ ] CI related changes
- [ ] Documentation content changes
- [ ] Other... Please describe:

# 📜 Background

Provide a brief explanation of why this pull request is needed. Include the problem you are solving or the functionality you are adding. Reference any related issues.

Issue Link: #[issue_number]
Context Link (if applicable):

# 🔄 Changes

Enumerate the changes made in this pull request, detailing what has been modified, added, or removed. Include technical details and implications if necessary.

Impact:

- Explain the broader impact of these changes.
- How it improves performance, fixes bugs, adds functionality, etc.

# 🧪 E2E Test Result

Include a screenshot of the e2e test result.

`Run E2E Tests`
Our End-to-end (E2E) test suite is build with Playwright. To run the whole E2E test suite, run:
`npm run e2etest`

If you only want to run the smoke test suite, run
`npm run e2etest:smoketest`

If you want to run the e2e test in UI Mode:
`npm run e2etest:ui`

To generate test report, run:
`npm run e2etest:report`

# 🖼 Screenshot / 📹 Video

Include screenshots or a video demonstrating the changes. This is especially helpful for UI changes.

# ✅ Review checklist

Please ensure the following are true before merging:

- [ ] Code Style is consistent with the project guidelines.
- [ ] Code is readable and well-commented.
- [ ] No unnecessary or debugging code has been added.
- [ ] Security considerations have been taken into account.
- [ ] The change has been manually tested and works as expected.
- [ ] Breaking changes and their impacts have been considered and documented.
- [ ] Code does not introduce new technical debt or issues.
