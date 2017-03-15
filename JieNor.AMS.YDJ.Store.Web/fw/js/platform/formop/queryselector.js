//列表查询
; (function () {
    var QuerySelector = (function () {
        return function (args) {
            
            //地址
            var url = '/{0}/{1}?operationno=queryselector&pageid={2}'.format(args.domainType, args.formId, args.pageId),

                //参数
                params = {
                    simpledata: {
                        fieldKey: args.fieldKey,
                    }
                };

            //请求获取弹窗列表页面信息
            yiAjax.p(url, params, null, null, null, $('body'), args.extra);
        };
    })();
    window.QuerySelector = window.QuerySelector || QuerySelector;
})();