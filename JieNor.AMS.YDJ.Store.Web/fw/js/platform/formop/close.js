; (function () {
    var Close = (function () {
        return function (args) {

            //地址
            var url = '/dynamic/{0}?operationno=close&pageid={1}'.format(args.formId, args.pageId);

            //请求关闭页面
            yiAjax.p(url, { simpleData: args.param }, function (r) {

                closePage(args);

            }, function (m) {

                yiDialog.m({ msg: 'Ajax请求出错：' + yiCommon.extract(m) });

                closePage(args);

            }, null, null);
        };
    })();

    function closePage(args) {

        switch (args.openStyle)
        {
            case Consts.openStyle.default:
                //关闭页签
                TabMgr.getInstance().close(args.pageId);
                break;

            case Consts.openStyle.modal:
            case Consts.openStyle.nonmodal:
                //关闭对话框，获取对话框的索引号
                var dialogIndex = $(Index.getPageSelector(args.pageId)).closest('[times]').attr('times');
                if (dialogIndex !== undefined) {
                    layer.close(dialogIndex);
                }
                break;
        }

        //及时释放页面对象
        args = null;
    }

    window.Close = window.Close || Close;
})();