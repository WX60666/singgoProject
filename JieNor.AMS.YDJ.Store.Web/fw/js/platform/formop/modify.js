; (function () {
    var Modify = (function () {
        return function (args) {

            if (!args.pkids || args.pkids.length <= 0) {
                yiDialog.a('请选择一行数据！');
                return;
            }

            if (args.pkids.length > 1) {
                yiDialog.a('只允许选择一行数据！');
                return;
            }

            //地址
            var url = '/list/{0}?operationno=modify&pageid={1}'.format(args.formId, args.pageId);

            //请求获取修改页面信息
            yiAjax.p(url, { selectedRows: [{ PKValue: args.pkids[0] }], simpleData: args.param }, function (r) {

            }, null, null, $(args.pageSelector), { cp: args.cp || null });
        };

    })();
    window.Modify = window.Modify || Modify;
})();