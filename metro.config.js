const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow .md files to be bundled as assets (for Library content)
config.resolver.assetExts.push('md');

module.exports = config;
