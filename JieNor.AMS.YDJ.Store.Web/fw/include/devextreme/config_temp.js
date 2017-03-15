({
    baseUrl: 'ui/', // 模块的跟目录
    name: 'data_grid', // 模块的入口文件，这里是app,那么r.js会从baseUrl+name去查找app.js，然后找出所有依赖的模块，然后进行合并与压缩。
    out: 'app_build.js',
    optimize: 'uglify', // optimize(none/uglify/colsure)，指定是否压缩，默认为uglify。
    paths: {
        'jquery': 'jquery'
    }
})