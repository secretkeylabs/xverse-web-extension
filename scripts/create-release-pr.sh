#! /bin/bash

if [[ -z "$BUMP" ]]; then
  echo "BUMP is required. major|minor|patch"
  exit 1
fi

git fetch --all
git checkout develop
git pull

npm version $BUMP --git-tag-version=false
VERSION=$(npm pkg get version | sed 's/"//g')
TAG="v$VERSION"
BRANCH=release/$TAG
TITLE=release: $TAG

git checkout -b $BRANCH
git commit -am "$TITLE"
git merge origin/main -s ours

git push --set-upstream origin $BRANCH

gh api \                                                                                                                                                                                                                                                 ─╯
  --method POST \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/{owner}/{repo}/releases \
  -f tag_name=$TAG \
  -f target_commitish="$BRANCH" \
  -f name=$TAG \
  -F draft=true \
  -F prerelease=true \
  -F generate_release_notes=true > release.json

cat release.json | jq -r .body > body.md
echo -e "\n\nDraft release: $(cat release.json | jq -r .html_url)" >> body.md

for b in main develop; do 
  gh api \
    --method POST \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    /repos/{owner}/{repo}/pulls \
    -f title="$TITLE" \
    -f body="Created by GitHub Actions Bot" \
    -f head="$BRANCH to $b" \
    -f base="$b" > pr-$b.json

  $PR_ID=$(cat pr-$b.json | jq -r .id)

  gh api \
    --method PATCH \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    /repos/{owner}/{repo}/pulls/$PR_ID \
    -F 'body=@body.md'

  # clean up temp files
  # rm pr-$b.json
done

# clean up temp files
# rm release.json
# rm body.md
