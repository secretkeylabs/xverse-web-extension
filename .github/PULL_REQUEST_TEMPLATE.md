# Summary
Link to Linear issue (if not linked by bot):
- [ ] PR Title was updated to match: `<branch_type>: <descriptive, short message of what work was done> [<parent issue ID1>][<parent issue ID2>]`
[See Branch types here](https://www.notion.so/xverseapp/Xverse-Contributing-1215520b9dee80cb9497f6866a99e2f4?pvs=4#1365520b9dee80f78f9ecd9f0bb23a8f)

# 🖼 Screenshot / 📹 Video
Include screenshots or a video demonstrating the changes. This is especially helpful for UI changes.
| Before | After |
| :---: | :---: |
|<img width="50%" alt="" src="" />|<img width="50%" alt="" src="" />|

# 🔄 Changes
- What has been added, modified removed?
- Where was the fix?
- Include technical details and implications if necessary.
- What xverse-core changes were included?

Impact:
- Explain the broader impact of these changes.
- Which areas of the application have been touched?
- What should the tester be aware of when testing?
- What can help the reviewer to be aware of when reading the code?
- What are the security implications?

# 🔍 Testing Steps
1. How to set up testing of the changes
2. What steps to test
3. What is expected

- [ ] Does this need QA? (If so, add the label `Ready for test`) [See considerations here](https://www.notion.so/xverseapp/Xverse-Contributing-1215520b9dee80cb9497f6866a99e2f4?pvs=4#13e5520b9dee80938816fa66214541db)

# ✅ Author checklist (can be draft if not all ready)
Please ensure the following are true before submitting for review:
- [ ]  The PR template has been filled.
- [ ]  E2E tests or unit tests have been added/updated.
- [ ]  The changes have been self-reviewed, and has been tidied up for an easy peer review.
    - [ ]  No debugging code
    - [ ]  No out of scope changes
    - [ ]  Should the PR be split up for easier review?
- [ ]  The change has been manually tested and works as expected.
- [ ]  The PR has been labeled/flagged for QA if necessary.

# ✅ Reviewer checklist
- [ ]  The changes follow the intended scope.
- [ ]  Code is clean and readable. No anti-patterns, no code smells.
- [ ]  Code structure maintains separation of concerns.
- [ ]  Check that code does not belong in xverse-core, or also on mobile.
- [ ]  E2E tests or unit tests have been added/updated.
- [ ]  (If no QA) The PR has been manually tested and works as expected.
