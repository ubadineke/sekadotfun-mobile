const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Force Metro to resolve 'buffer' to the installed 'buffer' package
// instead of React Native's incomplete internal implementation.
config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    buffer: path.resolve(__dirname, 'node_modules/buffer'),
    stream: path.resolve(__dirname, 'node_modules/stream-browserify'),
    crypto: path.resolve(__dirname, 'node_modules/expo-crypto'),
};

module.exports = config;
