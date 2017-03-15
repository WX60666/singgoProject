//@ sourceURL=/fw/js/platform/formop/query.js
//列表查询
; (function () {
    var Query = (function () {
        return function (args) {
            
            //地址
            var url = '/{0}/{1}?operationno=query&pageid={2}&openstyle={3}'.format(args.domainType, args.formId, args.pageId, args.openStyle);

            //请求获取列表页面信息
            yiAjax.p(url, args, function (r) {

                //如果当前打开的页签已经存在，则需要切换到对应的页签
                if (r &&!r.operationResult.isSuccess) {
                    TabMgr.getInstance().activate(r.operationResult.srvData.pageId);
                }

            }, null, null, $('body'), { cp: args.cp || null });
        };
    })();
    window.Query = window.Query || Query;
})();