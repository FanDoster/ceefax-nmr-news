#!/bin/bash
set -e
npm ci
npm run build
npx surge dist --domain ceefax-nmr-news.surge.sh
echo "Deployed to https://ceefax-nmr-news.surge.sh"
