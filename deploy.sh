#!/bin/bash
set -e
npm ci
npm run build
cp dist/index.html dist/200.html
npx surge dist --domain ceefax-nmr-news.surge.sh
echo "Deployed to https://ceefax-nmr-news.surge.sh"
