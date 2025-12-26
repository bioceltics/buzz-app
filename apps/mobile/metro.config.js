const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Mock native-only modules on web
const webMocks = {
  'react-native-maps': '__mocks__/react-native-maps.js',
  'react-native-gesture-handler': '__mocks__/react-native-gesture-handler.js',
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && webMocks[moduleName]) {
    return {
      filePath: path.resolve(__dirname, webMocks[moduleName]),
      type: 'sourceFile',
    };
  }
  // Fall back to default resolution
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
