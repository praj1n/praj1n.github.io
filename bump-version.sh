#!/bin/sh
# Bump the cache version everywhere (asset ?v= tags, the page's version check, version.json).
# Usage: ./bump-version.sh 20261115a
set -e
cd "$(dirname "$0")"
old=$(sed -n 's/.*"v":"\([^"]*\)".*/\1/p' version.json)
new=${1:?usage: ./bump-version.sh NEWVERSION}
sed -i '' "s/$old/$new/g" index.html 404.html privacy.html terms.html assets/js/tv.js version.json
echo "$old -> $new"
