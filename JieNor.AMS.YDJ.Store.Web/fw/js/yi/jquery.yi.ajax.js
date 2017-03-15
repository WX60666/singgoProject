/*
    1.用途：
        处理 ajax 请求的通用方法，包括 post 请求 和 get 请求
    2.方法名简称：
        post -> p
        get  -> g
        gethtmlfile -> g
    3.参数：
        第一个参数：请求服务器的 url 为字符串
        第二个参数：提交给服务器的 data 为对象
        第三个参数：请求成功后的回调 function 为函数
        第四个参数：请求失败后的回调 function 为函数
        第五个参数：表示当前请求是否需要验证用户登录状态 login 为布尔值 ，如不传递该参数，则默认需要验证用户登录状态
    4.调用方式：
        yiAjax.p('url', {}, function(r){}, function(m){});
        yiAjax.g('url', {}, function(r){}, function(m){});
*/

; (function () {

    //第一层闭包
    var yiAjax = (function () {

        //第二层闭包
        return function () {
            
            var that = this;

            //post 请求
            this.p = function (url, data, success, error, login, block, extra) {

                this.px(url, data, success, error, login, block, extra, null);
            };

            //post 请求
            this.px = function (url, data, success, error, login, block, extra, bs) {

                //ajax 请求
                ajaxRequest('post', url, data, success, error, login, block, bs, 'application/json;charset=utf-8', function (r) {

                    //处理服务端返回结果
                    yiCacheScript.g('/fw/js/platform/serveraction/procsrvresult.js', function () {
                        ProcSrvResult.proc(r, extra);
                    });
                });
            };

            //get 请求
            this.g = function (url, data, success, error, login, block) {

                //ajax 请求
                ajaxRequest('get', url, data, success, error, login, block, 'application/json;charset=utf-8', null);
            };

            this.gf = function (url, data, success, error, login, block) {

                //ajax 请求
                ajaxRequest('get', url, data, success, error, login, block, 'application/html;charset=utf-8', null);
            }

            //ajax 请求
            function ajaxRequest(type, url, data, success, error, login, block, bs, contentType, procSrvResult) {

                //url 是否为空
                if (!$.trim(url)) {

                    var m = { responseText: '{"responseStatus":{"message":"ajax 请求的 url 地址为空，请检查操作！"}}' };

                    $.isFunction(error) && error(m);

                    return;
                }

                if (block) {
                    Metronic.blockUI({ target: block, animate: true });
                }

                //ajax 请求
                $.ajax({

                    //请求服务器的方式
                    type: type,

                    //请求服务器的Url
                    url: url,

                    //发送信息至服务器时的内容编码类型（统一为 json 格式的内容对象）
                    contentType: contentType,

                    //发送到服务器的数据（统一为 json 格式的字符串参数）
                    data: data ? $.toJSON(data) : '',

                    //添加请求发送前回调：譬如在这里可以设置特殊的http请求头或修改请求其它参数
                    beforeSend: function (request) {
                        $.isFunction(bs) && bs(request);

                        //request.setRequestHeader("Test", "Chenxizhang");
                    },

                    //请求成功后的回调函数
                    success: function (r) {

                        //第一时间解除block
                        if (block) {
                            Metronic.unblockUI(block);
                        }

                        //如果有传递成功后的回调函数，则执行该回调函数，并将服务器的响应 Response 传递到回调函数中
                        $.isFunction(success) && success(r);

                        //处理服务端返回结果
                        $.isFunction(procSrvResult) && procSrvResult(r);
                    },

                    //请求过程中出现异常错误后的回调函数
                    error: function (m) {

                        //第一时间解除block
                        if (block) {
                            Metronic.unblockUI(block);
                        }

                        //调用请求过程中出现错误时的处理方法
                        that.ajaxError(m, success, error, login);
                    }
                });
            }

            //请求过程中出现错误时的处理方法
            this.ajaxError = function(m, success, error, login) {

                //当前请求是否需要验证用户登录状态，如果没传递 login 参数，则默认需要验证用户登录状态
                login = $.type(login) === 'boolean' ? login : true;

                //响应的内容
                var rt = m.responseText ? $.parseJSON(m.responseText) : null;

                //如果需要验证用户登录状态，并且用户登录状态已过期
                if (login && (rt && rt.responseStatus && rt.responseStatus.errorCode && rt.responseStatus.errorCode.toLowerCase() === 'unauthorized'
                    || m && m.status===401)) {

                    //显示登录对话框
                    Index_UserBar.showLoginDialog(success);

                } else {

                    //如果有传递错误的回调函数，说明出现错误后是由 ajax 调用方自己处理
                    if ($.isFunction(error)) {

                        //执行错误调函数，并将错误信息 Message 传递到回调函数中
                        error(m);

                    } else {

                        //否则在此处统一提示错误信息
                        yiDialog.m({ msg: 'Ajax请求出错：' + yiCommon.extract(m) });
                    }
                }
            }
        };
        
    })();

    //扩展到 window 上面
    window.yiAjax = window.yiAjax || new yiAjax();

})();