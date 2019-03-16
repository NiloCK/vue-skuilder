const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    configureWebpack: {
        devtool: 'source-map',
        optimization: {
            minimize: false // works on its own, but makes a bigger output file
            // namedChunks: true,                 // | 
            // chunkIds: 'named',                 // | 
            // namedModules: true,                // | 
            // moduleIds: "named",                // | 
            // usedExports: false                 //  \
            // minimizer: [                       //   \
            //     new TerserPlugin({             //    =-  These do not work.
            //         terserOptions: {           //    =-  Class names are not emitted
            //             mangle: false,         //   /
            //             keep_classnames: true, //  /
            //             keep_fnames: true      // |
            //         }                          // |
            //     })                             // |
            // ]                                  // |    
        }
    },
    baseUrl: process.env.NODE_ENV === 'production' ?
        '/skuilder/'
        :
        '/'
    ,

    pwa: {
        name: 'Skuilder'
    }
}