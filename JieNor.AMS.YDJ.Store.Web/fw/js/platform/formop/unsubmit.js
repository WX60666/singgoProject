; (function () {
    var Unsubmit = (function () {
        return function (args) {

            if (!args.pkids || args.pkids.length <= 0) {
                yiDialog.a('请选择一行或多行数据！');
                return;
            }

            //地址
            var url = '/{0}/{1}?operationno=unsubmit&pageid={2}'.format(args.domainType, args.formId, args.pageId);

            //传递到服务端的主键ID数组
            var params = { selectedRows: [] ,simpleData:args.param};
            for (var i = 0; i < args.pkids.length; i++) {
                params.selectedRows.push({ PKValue: args.pkids[i] });
            }

            //请求撤销
            yiAjax.p(url, params, null, null, null, $(args.pageSelector));
        };
    })();
    window.Unsubmit = window.Unsubmit || Unsubmit;
})();