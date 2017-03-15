/*
    1.用途：
        用于动态加载 js 文件
    2.调用方式：
        yiCacheScript.g('url',function(){});
*/

; (function () {

    //第一层闭包
    var yiCacheScript = (function () {

        //第二层闭包
        return function () {

            //定义一个全局 scripts 的标记数组，用来标记某个 script 是否已经下载到本地
            var scripts = [];

            this.g = function (url, callback) {

                ////循环 scripts 标记数组
                //for (var s in scripts) {

                //    //如果某个 script 已经下载到了本地
                //    if (scripts[s] === url) {

                //        //直接执行回调函数
                //        $.isFunction(callback) && callback();

                //        return;
                //    }
                //}

                //请求 script 文件
                return $.ajax({

                    dataType: 'script',
                    url: url,
                    //cache: true //其实现在这缓存加与不加没多大区别

                }).done(function () {

                    ////将 url 地址放入 scripts 标记数组中
                    //scripts.push(url);

                    $.isFunction(callback) && callback();
                });
            };
        };

    })();

    //扩展到 window 上面
    window.yiCacheScript = window.yiCacheScript || new yiCacheScript();

})();