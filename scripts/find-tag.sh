#! /bin/bash

##
# find-tag.sh
#
# a util for looking through a list of github releases and exporting the next tag
#
if [[ -z "$TAG" ]]; then
  echo "TAG is required. e.g. v0.26.0"
  exit 1
fi

if cat releases.json  | jq -r '.[].tag_name' | grep $TAG; then
  echo found releases matching $TAG

  for i in $(cat releases.json  | jq -r '.[].tag_name' | grep $TAG); do
    LATEST_RUNNING=$(echo $i | grep rc | sed 's/.*-rc.\(.*\)/\1/')

    if [[ -z "$LATEST_RC" || $LATEST_RUNNING -gt $LATEST_RC ]]; then
      LATEST_RC=$LATEST_RUNNING
    fi
  done

  if [[ -z "$LATEST_RC" ]]; then
    echo $TAG was already released
    exit 1;
  elif [[ -n "$LATEST_RC" ]]; then
    echo incrementing rc
    NEXT_TAG="$TAG-rc.$((LATEST_RC+1))"
  fi
else
  echo no releases matching $TAG yet
  NEXT_TAG="$TAG-rc.0"
fi

echo next tag will be $NEXT_TAG
export NEXT_TAG=$NEXT_TAG
