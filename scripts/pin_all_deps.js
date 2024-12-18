const fs = require('fs');

const packageLock = require('../package-lock.json');
const packageJson = require('../package.json');

const dependencies = packageLock.dependencies;
const devDependencies = packageLock.packages;

for (const packageName in packageJson.dependencies) {
  if (packageJson.dependencies.hasOwnProperty(packageName) && dependencies[packageName]) {
    const installedVersion = dependencies[packageName].version;
    packageJson.dependencies[packageName] = installedVersion;
  }
}

for (const packageName in packageJson.devDependencies) {
  const auxDevPackageName = `../node_modules/${packageName}`;
  if (
    packageJson.devDependencies.hasOwnProperty(packageName) &&
    devDependencies[auxDevPackageName]
  ) {
    const installedVersion = devDependencies[auxDevPackageName].version;
    packageJson.devDependencies[packageName] = installedVersion;
  }
}

fs.writeFileSync('../package.json', JSON.stringify(packageJson, null, 2));
