; (function () {
    var Delete = (function () {
        return function (args) {
            var that = this;
			
            //列表页面删除后的操作
            that.listDeleted = function (r) {

                $(Consts.gridSelector.format(that.pageId)).trigger('reloadGrid');
            };

            //编辑页面删除后的操作
            that.billDeleted = function (r) {

                //获取页签管理实例
                TabMgr.getInstance().close(args.pageId);

                //刷新父页面列表控件
                $(Consts.gridSelector.format(args.parentPageId)).trigger('reloadGrid');
            };

            if (!args.pkids || args.pkids.length <= 0) {
                yiDialog.a('请选择一行或多行数据！');
                return;
            }

            //提示用户
            yiDialog.c('您确定要删除吗？', function () {
                
                //地址
                var url = '/{0}/{1}?operationno=delete&pageid={2}'.format(args.domainType, args.formId, args.pageId);

                //传递到服务端的主键ID数组
                var params = { selectedRows: [], simpleData: args.param };
                for (var i = 0; i < args.pkids.length; i++) {
                    params.selectedRows.push({ PKValue: args.pkids[i] });
                }

                //请求删除
                yiAjax.p(url, params,
                    function (r) {
                        that[args.domainType.toLowerCase() + 'Deleted'](r);
                    }, 
                    null, null, $(args.pageSelector)
                );
            });
        };
    })();
    window.Delete = window.Delete || Delete;
})();