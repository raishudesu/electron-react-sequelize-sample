#!/bin/bash

# Build Windows x64 package using Docker with proper user permissions
docker run --rm \
  -v "$PWD":/workspace \
  -w /workspace \
  -u $(id -u):$(id -g) \
  -e npm_config_cache=/tmp/.npm \
  electronuserland/builder:wine \
  bash -c "
    export npm_config_cache=/tmp/.npm
    npm cache clean --force
    npm install --no-optional
    npx electron-builder --win --x64
  "
