const config = {
  mode: 'production',
  entry: {
    index: './src/js/index.js',
    // contacts: './src/js/contacts.js',
    // about: './src/js/about.js',
  },
  output: {
    // index.bunle.js (contacts.bundle.js ...)
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        // import styles into DOM (some lib export css files)
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};

export default config;
