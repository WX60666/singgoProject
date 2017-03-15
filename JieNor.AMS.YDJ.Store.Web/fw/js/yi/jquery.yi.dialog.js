/*
    1.用途：
        提示对话框，确认对话框，输入对话框，消息对话框，关闭对话框
    2.方法名简称：
        alert    -> a
        confirm  -> c
        prompt   -> p
        message  -> m
        dialog   -> d
        close    -> close
    3.调用方式：
        yiDialog.a('msg', function(){}, title);
        yiDialog.c('msg', function(){}, function(){}, title);
        yiDialog.p(opts); opts = { title: '', value: '', ok: function () { } };
        yiDialog.m(opts); opts = { msg: '', icon: 5, end: function () { } };
        yiDialog.d(opts); opts = { 各自自定义属性和方法 };
        yiDialog.close(index); index = 对话框的索引号
*/

; (function () {

    //第一层闭包
    var yiDialog = (function () {

        //第二层闭包
        return function () {

            //alert 提示对话框
            this.a = function (msg, yes, title) {
                layer.alert(msg, {
                    icon: 0,
                    title: title ? title : '提示信息',
                    resize: false
                }, function (index) {
                    $.isFunction(yes) && yes();
                    layer.close(index);
                });
            };

            //confirm 确认对话框
            this.c = function (msg, yes, no, title) {
                layer.confirm(msg, {
                    icon: 3,
                    title: title ? title : '确认信息',
                    resize: false
                }, function (index) {
                    $.isFunction(yes) && yes();
                    layer.close(index);
                }, function (index) {
                    $.isFunction(no) && no();
                    layer.close(index);
                });
            };

            //prompt 输入对话框
            this.p = function (opts) {
                var defs = { resize: false, formType: 0, title: '输入信息', value: '', ok: function () { } },
                    sets = $.extend(true, {}, defs, opts);
                layer.prompt(sets, function (value, index, elem) {
                    $.isFunction(sets.ok) && sets.ok(value);
                    layer.close(index);
                });
            };

            //message 消息对话框
            this.m = function (opts) {
                var defs = { msg: '', icon: 5, end: function () { } },
                    sets = $.extend(true, {}, defs, opts);
                layer.msg(sets.msg, sets, function () {
                    $.isFunction(sets.end) && sets.end();
                });
            };

            //dialog 自定义对话框
            this.d = function (opts) {
                if (opts && opts.content) {
                    opts.content = '<div style="padding:15px 15px;">' + opts.content + '</div>';
                }
                var index = layer.open(opts);
                $('#layui-layer' + index).find('.layui-layer-btn').css('border-top', '1px solid #eee');
                return index;
            };

            //close 关闭对话框
            this.close = function (index) {
                layer.close(index);
            };
        };

    })();

    //扩展到 window 上面
    window.yiDialog = window.yiDialog || new yiDialog();

})();