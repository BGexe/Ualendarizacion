const { override } = require("customize-cra");
const webpack = require("webpack");

module.exports = override((config) => {
  config.resolve = {
    ...config.resolve,
    fallback: {
      assert: require.resolve("assert"),
      buffer: require.resolve("buffer"),
      crypto: require.resolve("crypto-browserify"),
      fs: false,
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      net: false,
      os: require.resolve("os-browserify/browser"),
      path: require.resolve("path-browserify"),
      stream: require.resolve("stream-browserify"),
      tls: false,
      url: require.resolve("url"),
      util: require.resolve("util"),
      zlib: require.resolve("browserify-zlib"),
      child_process: false,
      http2: false,
      querystring: require.resolve("querystring-es3"),
      process: require.resolve("process/browser"),
    },
    alias: {
      ...config.resolve.alias,
      "node:events": require.resolve("events"),
      "node:process": require.resolve("process/browser"),
      "node:util": require.resolve("util"),
      "node:url": require.resolve("url"),
      "node:http": require.resolve("stream-http"),
      "node:https": require.resolve("https-browserify"),
      "node:stream": require.resolve("stream-browserify"),
    },
    // Evitar que Webpack interprete `node:` como un esquema especial
    fullySpecified: false,
  };

  config.plugins = [
    ...(config.plugins || []),
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ];

  return config;
});