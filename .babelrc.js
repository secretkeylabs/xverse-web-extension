module.exports = {
  presets: ['env', 'react'],
  plugins: [
    'babel-plugin-styled-components',
    process.env.NODE_ENV === 'development' && require.resolve('react-refresh/babel'),
  ].filter(Boolean),
};
