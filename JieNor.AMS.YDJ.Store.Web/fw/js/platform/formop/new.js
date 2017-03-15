//@ sourceURL=/fw/js/platform/formop/new.js
; (function () {
    var New = (function () {
        return function (args) {

            //地址
            var url = '/{0}/{1}?operationno=new&pageid={2}'.format(args.domainType, args.formId, args.pageId);

            //请求获取新增页面信息
            yiAjax.p(url,$.extend(args, { simpleData: args.param }), function (r) {

            }, null, null, $(args.pageSelector), { cp: args.cp || null });
        };
    })();
    window.New = window.New || New;
})();