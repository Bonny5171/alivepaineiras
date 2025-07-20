module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],       // permite import relativo raiz
        alias: {
          '@': './src',        // habilita "@/..."
        },
      },
    ],
    'react-native-reanimated/plugin', // **sempre o último**
  ],
};
