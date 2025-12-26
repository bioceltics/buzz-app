// Minimal Polyfills for React Native
// Only includes what's absolutely necessary - no DOM polyfills that interfere with RN internals

// Worker polyfill for expo-camera and other modules that need it
if (typeof global.Worker === 'undefined') {
  global.Worker = class Worker {
    constructor() {}
    postMessage() {}
    terminate() {}
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() { return true; }
  };
}

// Blob URL polyfill - some libraries need this
if (typeof URL !== 'undefined') {
  if (typeof URL.createObjectURL === 'undefined') {
    URL.createObjectURL = () => 'blob:react-native';
  }
  if (typeof URL.revokeObjectURL === 'undefined') {
    URL.revokeObjectURL = () => {};
  }
}
