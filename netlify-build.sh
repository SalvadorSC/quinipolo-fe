#!/bin/bash
set -e

# Create .npmrc with token from environment variable for Netlify builds
if [ -n "$NPM_TOKEN" ]; then
  echo "Setting up npm authentication for GitHub Packages..."
  echo "@salvadorsc:registry=https://npm.pkg.github.com" > .npmrc
  echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" >> .npmrc
else
  echo "WARNING: NPM_TOKEN not set. GitHub Packages authentication will fail!"
  exit 1
fi

# Build the project (dependencies are already installed by Netlify)
npm run build
