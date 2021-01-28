const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  // configureWebpack: {
  //     devtool: 'source-map',
  //     optimization: {
  //         minimize: false // works on its own, but makes a bigger output file
  //         // namedChunks: true,                 // |
  //         // chunkIds: 'named',                 // |
  //         // namedModules: true,                // |
  //         // moduleIds: "named",                // |
  //         // usedExports: false                 //  \
  //         // minimizer: [                       //   \
  //         //     new TerserPlugin({             //    =-  These do not work.
  //         //         terserOptions: {           //    =-  Class names are not emitted
  //         //             mangle: false,         //   /
  //         //             keep_classnames: true, //  /
  //         //             keep_fnames: true      // |
  //         //         }                          // |
  //         //     })                             // |
  //         // ]                                  // |
  //     }
  // },
  configureWebpack:
    process.env.NODE_ENV === 'production'
      ? config => {
          // get current options
          // const options = config.optimization.minimizer[0].options
          // console.log(`Options: ${JSON.stringify(options)}

          // These were the options`);
          // // set your own terser options
          // options.terserOptions = {}
          // options.terserOptions.keep_classname = true
          // replace current plugin instance with a fresh one
          // config.optimization.minimizer[0] = new TerserPlugin(options)
          config.optimization.minimizer[0] = new TerserPlugin(options);
        }
      : {
          devtool: 'source-map',
        },
  baseUrl: process.env.NODE_ENV === 'production' ? '/' : '/',
  pwa: {
    name: 'Skuilder',
  },
};

const options = {
  terserOptions: {
    keep_classnames: true,
  },
  test: [],
  extractComments: false,
  sourceMap: true,
  cache: true,
  parallel: true,
  // "uglifyOptions": {
  //     "compress": {
  //         "arrows": false,
  //         "collapse_vars": false,
  //         "comparisons": false,
  //         "computed_props": false,
  //         "hoist_funs": false,
  //         "hoist_props": false,
  //         "hoist_vars": false,
  //         "inline": false,
  //         "loops": false,
  //         "negate_iife": false,
  //         "properties": false,
  //         "reduce_funcs": false,
  //         "reduce_vars": false,
  //         "switches": false,
  //         "toplevel": false,
  //         "typeofs": false,
  //         "booleans": true,
  //         "if_return": true,
  //         "sequences": true,
  //         "unused": true,
  //         "conditionals": true,
  //         "dead_code": true,
  //         "evaluate": true
  //     },
  //     "output": {
  //         "comments": {}
  //     },
  //     "mangle": {
  //         "safari10": true
  //     }
  // }
};

const schema = {
  additionalProperties: false,
  definitions: {
    'file-conditions': {
      anyOf: [
        {
          instanceof: 'RegExp',
        },
        {
          type: 'string',
        },
      ],
    },
  },
  properties: {
    test: {
      anyOf: [
        {
          $ref: '#/definitions/file-conditions',
        },
        {
          items: {
            anyOf: [
              {
                $ref: '#/definitions/file-conditions',
              },
            ],
          },
          type: 'array',
        },
      ],
    },
    include: {
      anyOf: [
        {
          $ref: '#/definitions/file-conditions',
        },
        {
          items: {
            anyOf: [
              {
                $ref: '#/definitions/file-conditions',
              },
            ],
          },
          type: 'array',
        },
      ],
    },
    exclude: {
      anyOf: [
        {
          $ref: '#/definitions/file-conditions',
        },
        {
          items: {
            anyOf: [
              {
                $ref: '#/definitions/file-conditions',
              },
            ],
          },
          type: 'array',
        },
      ],
    },
    chunkFilter: {
      instanceof: 'Function',
    },
    cache: {
      anyOf: [
        {
          type: 'boolean',
        },
        {
          type: 'string',
        },
      ],
    },
    cacheKeys: {
      instanceof: 'Function',
    },
    parallel: {
      anyOf: [
        {
          type: 'boolean',
        },
        {
          type: 'integer',
        },
      ],
    },
    sourceMap: {
      type: 'boolean',
    },
    minify: {
      instanceof: 'Function',
    },
    terserOptions: {
      additionalProperties: true,
      type: 'object',
    },
    extractComments: {
      anyOf: [
        {
          type: 'boolean',
        },
        {
          type: 'string',
        },
        {
          instanceof: 'RegExp',
        },
        {
          instanceof: 'Function',
        },
        {
          additionalProperties: false,
          properties: {
            condition: {
              anyOf: [
                {
                  type: 'boolean',
                },
                {
                  type: 'string',
                },
                {
                  instanceof: 'RegExp',
                },
                {
                  instanceof: 'Function',
                },
              ],
            },
            filename: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  instanceof: 'Function',
                },
              ],
            },
            banner: {
              anyOf: [
                {
                  type: 'boolean',
                },
                {
                  type: 'string',
                },
                {
                  instanceof: 'Function',
                },
              ],
            },
          },
          type: 'object',
        },
      ],
    },
    warningsFilter: {
      instanceof: 'Function',
    },
  },
  type: 'object',
};
