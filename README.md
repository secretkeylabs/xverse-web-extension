# xverse-extension

## Installing and Running

### Procedures

1. Check if your [Node.js](https://nodejs.org/) version is >= **14**.
2. Clone this repository.
3. Make sure you're logged in to the @secretkeylabs scope on the GitHub NPM package registry. See the [Guide](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-with-a-personal-access-token)
   1. Create a GitHub personal access token (classic) 
   2. Run `npm login --scope=@secretkeylabs --registry=https://npm.pkg.github.com`
   3. Username: GITHUB USERNAME
      Password: PERSONAL_ACCESS_TOKEN
      Email: PUBLIC-EMAIL-ADDRESS
4. Run `npm install` to install the dependencies.
5. Run `npm start`
6. Load your extension on Chrome following:
   1. Access `chrome://extensions/`
   2. Check `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the `build` folder.
