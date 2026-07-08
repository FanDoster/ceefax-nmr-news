#!/bin/bash
set -e
# Plain static site — nothing to build, just publish ./public
npx surge public --domain ceefax-nmr-news.surge.sh
echo "Deployed to https://ceefax-nmr-news.surge.sh"
