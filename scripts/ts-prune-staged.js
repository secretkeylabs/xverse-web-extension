const {exec} = require('child_process');

const includedFiles = process.argv
  .slice(2)
  .map((path) => path.replace(process.cwd() + '/', ''));

exec('npm run --silent find-deadcode', (_, stdout) => {
  const result = stdout
    .split('\n')
    .filter((line) => includedFiles.some((file) => line.startsWith(file)))
    .join('\n');

  // eslint-disable-next-line no-console
  console.log(result);
  process.exit(result ? 1 : 0);
});
