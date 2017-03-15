//@ sourceURL=/fw/js/platform/formop/save.js
; (function () {
    var Save = (function () {
        return function (args) {

            //如果验证不通过，则终止后续操作
            var $form = $('form', args.pageSelector);
            if (!$form.valid()) {
                return;
            }
            //提交（注意，这里不是提交数据到服务端，而是表单插件本身的验证提交）
            $form.submit();

            //数据包
            var packet = {
                id: args.pkids[0], formId: args.formId, operationNo: 'save',
                billData: [{ id: args.pkids[0] }],
                simpleData:args.param
            };

            //表头字段数据统一打包
            var billHead = yiCommon.getFormValue(args.pageSelector);

            //表体字段数据统一打包
            var billEntry = yiCommon.getFormEntrys(args.pageSelector);

            //特殊表体字段数据由各自页面对象自己打包
            var specialEntry = {};
            var page = Index.getPage(args.pageId);
            if (page && $.isFunction(page.getEntrys)) {
                specialEntry = page.getEntrys();
            }

            //合并表单字段（表头，表体，特殊表体）
            $.extend(packet.billData[0], billHead, billEntry, specialEntry);

            //将 billData 转换为 json 字符串
            packet.billData = JSON.stringify(packet.billData);

            //地址
            var url = '/{0}/{1}?operationno=save&pageid={2}'.format(args.domainType, args.formId, args.pageId);

            //保存
            yiAjax.p(url, packet, function (r) {

                //保存成功后刷新页面（列表页面刷新列表数据，编辑页面重新绑定控件值）
                yiCacheScript.g('/fw/js/platform/formop/refresh.js', function () {
                    var sd = r.operationResult.srvData[0];
                    new Refresh({
                        pageId: args.pageId,
                        tabTitle: sd.caption, //比如：用户-修改
                        pkid: sd.id
                    });
                });

            }, null, null, $(args.pageSelector));
        };
    })();
    window.Save = window.Save || Save;
})();