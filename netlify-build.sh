#!/bin/bash
set -e

# Create .npmrc with token from environment variable for Netlify builds
if [ -n "$NPM_TOKEN" ]; then
  echo "Setting up npm authentication for GitHub Packages..."
  echo "@salvadorsc:registry=https://npm.pkg.github.com" > .npmrc
  echo "//npm.pkg.github.com/:_authToken=\${NPM_TOKEN}" >> .npmrc
fi

# Install dependencies
npm install --legacy-peer-deps

# Build the project
npm run build
