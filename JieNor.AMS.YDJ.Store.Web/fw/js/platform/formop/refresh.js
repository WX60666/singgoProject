; (function () {
    var Refresh = (function () {
        return function (args) {
            var that = this;

            //列表页面刷新
            that.listRefresh = function (page) {

                //刷新列表控件数据
                page.refresh();

                //如果当前页面是页签方式打开的
                if (page.openStyle === Consts.openStyle.default) {

                    //页签管理容器
                    var tabMgr = TabMgr.getInstance();

                    //刷新页签（这个主要针对页签本身的一些处理）
                    tabMgr.refresh(page.pageId);
                }
            };

            //编辑页面刷新
            that.billRefresh = function (page) {

                //地址
                var url = '/{0}/{1}?operationno=refresh&pageid={2}'.format(page.domainType, page.formId, page.pageId);
                var parmas = { selectedRows: [{ PKValue: page.pkid }] };

                //页面容器
                var container = $(page.pageSelector);

                //获取单据数据包
                yiAjax.p(url, parmas, function (r) {

                    //获取页面 html 内容
                    yiAjax.gf(page.pageFile, null, function (html) {

                        //将页面 html 内容加载到页面容器中
                        container.html(html);

                        //设置单据数据包
                        page.opData = r.operationResult.srvData.data;

                        //重新初始化一下页面
                        page.init();

                        //如果当前页面是页签方式打开的
                        if (page.openStyle === Consts.openStyle.default) {

                            //页签管理容器
                            var tabMgr = TabMgr.getInstance();

                            //重命名页签标题
                            if (page.tabTitle) {

                                tabMgr.rename(page.pageId, page.tabTitle);
                            }

                            //刷新页签（这个主要针对页签本身的一些处理）
                            tabMgr.refresh(page.pageId);
                        }

                    }, null, true, container);

                }, null, null, container);
            };

            //获取页面实例对象
            var page = Index.getPage(args.pageId);
            if (!page) { return; }

            //主键ID
            page.pkid = page.pkid || args.pkid;

            //页签标题
            page.tabTitle = page.tabTitle || args.tabTitle;

            //领域类型统一转成小写
            page.domainType = page.domainType.toLowerCase();

            //根据 domaintype 来刷新不同的页面
            that[page.domainType + 'Refresh'](page);
        };
    })();
    window.Refresh = window.Refresh || Refresh;
})();