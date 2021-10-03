const path = require("path");
const nodesHttpServer = require("./server/nodes");
const userPermissionHttpServer = require("./server/userPermission");
const userSettingHttpServer = require("./server/userSetting");

const CircularDependencyPlugin = require("circular-dependency-plugin");

module.exports = {
  entry: {
    fileManager: {
      import: "./src/loader.ts",
      filename: "basisCore.fileManager.js",
      library: {
        name: "[name]",
        type: "assign",
      },
    },
    fileManagerComponent: {
      import: "./src/BcComponentLoader.ts",
      filename: "basisCore.fileManager.component.js",
      library: {
        name: "bc",
        type: "assign",
      },
    },
  },
  output: {
    filename: "[name].js",
  },
  devServer: {
    static: path.resolve(__dirname, "wwwroot"),
    onBeforeSetupMiddleware: function (server) {
      server.app.use("/server", nodesHttpServer);
      server.app.use("/server", userPermissionHttpServer);
      server.app.use("/server", userSettingHttpServer);
    },
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["ts-loader"],
        exclude: /\.d\.ts$/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.d\.ts$/,
        use: ["ignore-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|jp2|webp|woff|ttf|eot|woff2)$/,
        type: "asset/resource",
      },
      // {
      //   test: /\.(png|jpe?g|gif|jp2|webp|woff|ttf|eot|woff2)$/,
      //   // use: [
      //   //   {
      //   //     loader: 'file-loader',
      //   //     options: {
      //   //       name: '[path][name].[ext][query]',
      //   //     },
      //   //   },
      //   // ],
      // }
    ],
  },
  resolve: {
    extensions: [".ts", ".d.ts", ".tsx", ".js", ".jsx", ".css", ".png", ".woff", ".ttf", ".eot", ".woff2"],
  },
  plugins: [
    new CircularDependencyPlugin({
      // `onStart` is called before the cycle detection starts
      onStart({ compilation }) {
        console.log("start detecting webpack modules cycles");
      },
      // `onDetected` is called for each module that is cyclical
      onDetected({ module: webpackModuleRecord, paths, compilation }) {
        // `paths` will be an Array of the relative module paths that make up the cycle
        // `module` will be the module record generated by webpack that caused the cycle
        compilation.errors.push(new Error(paths.join(" -> ")));
      },
      // `onEnd` is called before the cycle detection ends
      onEnd({ compilation }) {
        console.log("end detecting webpack modules cycles");
      },
    }),
  ],
};