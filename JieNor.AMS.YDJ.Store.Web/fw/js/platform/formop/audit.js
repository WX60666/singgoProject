; (function () {
    var Audit = (function () {
        return function (args) {
			
            if (!args.pkids || args.pkids.length <= 0) {
                yiDialog.a('请选择一行或多行数据！');
                return;
            }

            //弹窗输入审批意见
            yiAjax.gf('/views/auditcheck.html', {}, function (html) {
                yiDialog.d({
                    id: dialogId,
                    type: 1,
                    content: html,
                    resize: false,
                    title: '填写审批意见',
                    btn: ['同意', '驳回', '取消'],
                    yes: function (index, layero) {
                        submit(args, index, true);
                        return false;
                    },
                    btn2: function (index, layero) {
                        submit(args, index, false);
                        return false;
                    },
                    btn3: function (index, layero) {
                        return true;
                    }
                });
            });
        };
    })();

    //对话框 id
    var dialogId = 'auditOpinionDialog';

    //提交审批
    function submit(args, index, ac) {

        //传递到服务端的主键ID数组
        var params = {
            selectedRows: [],
            //获取审批意见
            simpleData: $.extend({
                checkAgree: ac,
                checkDesc: $.trim($('#txtCheckDesc').val())
            }, args.param)
        };

        for (var i = 0; i < args.pkids.length; i++) {
            params.selectedRows.push({ PKValue: args.pkids[i] });
        }

        //地址
        var url = '/{0}/{1}?operationno=audit&pageid={2}'.format(args.domainType, args.formId, args.pageId);

        //请求审核
        yiAjax.p(url, params, function (r) {

            layer.close(index);

        }, null, null, $('#' + dialogId).parent());
    }

    window.Audit = window.Audit || Audit;
})();