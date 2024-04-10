#! /bin/bash

##
# create-release-pr.sh for xverse-web-extension
#
# NOTE: make sure you git commit your work before running this locally.
# Alternatively trigger it from the github action
#

set -e

if [[ -z "$BUMP" ]]; then
  echo "BUMP is required. major|minor|patch"
  exit 1
fi

echo -e "\n--- Prepare for $BUMP release branch ---"

git fetch --all
git checkout develop
git pull

npm version $BUMP --git-tag-version=false
VERSION=$(npm pkg get version | sed 's/"//g')
TAG="v$VERSION"
BRANCH="release/$TAG"
TITLE="release: $TAG"

git checkout -B $BRANCH
git commit -am "$TITLE"
git merge --allow-unrelated-histories origin/main -s ours

git push --set-upstream origin $BRANCH

for b in main develop; do
  echo -e "\n--- Create PR to $b ---"

  gh api \
    --method POST \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    /repos/{owner}/{repo}/pulls \
    -f title="$TITLE to $b" \
    -f body="Created by GitHub Actions Bot" \
    -f head="$BRANCH" \
    -f base="$b" > pr-$b.json

  # clean up temp files
  # rm pr-$b.json
done

echo -e "\n--- Done ---"
# clean up temp files
# rm release.json
# rm body.md
