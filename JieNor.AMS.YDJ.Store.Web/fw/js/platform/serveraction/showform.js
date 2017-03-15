//处理服务端返回的指令，服务端返回参数如下：
//{
//    "ActionId" : "showForm",
//    "ActionParams" :
//    {

//        "url": "/fw/js/sec/sec_user.js",
//        "formCaption": "用户 - 修改",
//        "status": "modify",
//        "openStyle": "default",
//        "pkId": "100292838",
//        "formid": "sec_user",
//        "domaintype": "bill"
//    }
//}

/// <reference path="/fw/js/consts.js" />
/// <reference path="/fw/js/tabmgr.js" />
//@ sourceURL=/fw/js/platform/serveraction/showform.js
; (function () {
    var Showform = (function () {

        //参数：response, actionParam, extra
        return function (r, ap, e) {

            var that = this;

            //模态对话框打开
            that.modalShowForm = function (r, ap, e) {
                dialogShowForm(r, ap, e, true);
            };
            
            //模态对话框打开
            that.nonmodalShowForm = function (r, ap, e) {
                dialogShowForm(r, ap, e, false);
            };

            //默认页签打开
            that.defaultShowForm = function (r, ap, e) {

                TabMgr.getInstance().open({
                    title: ap.formCaption,
                    pageId: ap.pageid,
                    callback: function (panel) {

                        //创建页面实例所需的参数
                        var opts = $.extend(true, {}, getCreatePageInstanceOpts(r, ap), { panel: panel, cp: e && e.cp ? e.cp : null });

                        //加载页面 js 文件
                        loadPageJs(opts, function () {

                            //创建页面实例
                            var pageObj = createPageInstance(opts);

                            //获取页面 html 内容
                            getPageHtml(opts, pageObj, function (r) {

                                //如果是列表页面
                                if (opts.domainType === Consts.domainType.list) {
                                    r = r.format(pageObj.pageId);
                                }

                                //加载 tab 页签 html
                                opts.panel.html(r);

                                //初始化页面
                                pageObj.init();

                                //管理 tab 页签容器
                                TabMgr.getInstance().manage(pageObj);
                            })
                        });
                    }
                });
            };

            //在指定的容器中打开
            that.incontainerShowForm = function (r, ap, e) {

                if (!ap.containerid) {
                    yiDialog.m({ msg: '指定的 containerId 为空！' });
                    return;
                }

                var container = $('#' + ap.containerid);
                if (!container) {
                    yiDialog.m({ msg: '指定的页面容器不存在！' });
                    return;
                }

                //创建页面实例所需的参数
                var opts = $.extend(true, {}, getCreatePageInstanceOpts(r, ap), { panel: container, cp: e && e.cp ? e.cp : null });

                //加载页面 js 文件
                loadPageJs(opts, function () {

                    //创建页面实例
                    var pageObj = createPageInstance(opts);

                    //获取页面 html 内容
                    getPageHtml(opts, pageObj, function (r) {

                        //如果是列表页面
                        if (opts.domainType === Consts.domainType.list) {
                            r = r.format(pageObj.pageId);
                        }

                        //将页面 html 内容加载到指定容器中
                        opts.panel.html('<div id="{0}">{1}</div>'.format(opts.pageId, r));

                        //初始化页面
                        pageObj.init();

                        //记录页面对象
                        Index.addPage(pageObj);
                    })
                });
            };

            //如果 actionParam 不存在，则无需处理
            if (!ap) { return; }

            //领域类型统一转成小写
            ap.domaintype = ap.domaintype.toLowerCase();
            ap.openStyle = ap.openStyle.toLowerCase();

            //根据 openStyle 来不同方式打开页面
            that[ap.openStyle + 'ShowForm'](r, ap, e);
        };

    })();

    //对话框打开
    function dialogShowForm(r, ap, e, isModal) {

        //创建页面实例所需的参数
        var opts = getCreatePageInstanceOpts(r, ap);
        opts.cp = e && e.cp ? e.cp : null;

        //加载页面 js 文件
        loadPageJs(opts, function () {

            //创建页面实例
            var pageObj = createPageInstance(opts);

            //获取页面 html 内容
            yiAjax.gf(pageObj.pageFile, {}, function (html) {

                //如果是列表页面
                if (opts.domainType === Consts.domainType.list) {
                    html = html.format(pageObj.pageId);
                }

                //显示对话框
                yiDialog.d({
                    id: ap.pageid,
                    type: 1,
                    shade: isModal ? 0.3 : 0,
                    content: html,
                    title: ap.formCaption,
                    scrollbar: false,
                    maxmin: true,
                    area: ['80%', '90%'],
                    btn: ['确定', '取消'],
                    //点击确定按钮后要做的事情
                    yes: function (index, layero) {

                        //如果有关闭后的回调函数
                        if (e && e.callback) {

                            //获取选中的数据行
                            var datas = pageObj.getSelectDatas();

                            //执行回调函数
                            e.callback(datas);
                        }

                        //关闭对话框
                        layer.close(index);
                    },
                    //点击取消按钮后要做的事情
                    btn2: function (index, layero) {

                    },
                    success: function (layero, index) {

                        //初始化页面
                        pageObj.init();

                        //记录页面对象
                        Index.addPage(pageObj);
                    },
                    end: function () {

                        //销毁页面对象
                        Index.disposePage(ap.pageid);

                        //销毁对话框的同时也释放 pageId
                        yiAjax.p('/dynamic/{0}?operationno=close&pageid={1}'.format(ap.formid, ap.pageid));
                    }
                });
            });
        });
    }

    //构造创建页面实例所需的参数对象
    function getCreatePageInstanceOpts(r, ap) {

        return {
            pkid: ap.pkId,
            opData: ap.opData,
            url: ap.url,
            formId: ap.formid,
            pageId: ap.pageid,
            parentPageId: r.pageId,
            domainType: ap.domaintype,
            openStyle: ap.openStyle,
            sp: r.operationResult && r.operationResult.srvData ? r.operationResult.srvData : null
        };
    }

    //创建页面实例
    function createPageInstance(opts) {

        switch (opts.domainType) {

            case Consts.domainType.list:

                //实例化一个列表页面对象
                return new ListPage(opts);

            case Consts.domainType.bill:
            case Consts.domainType.dynamic:
            case Consts.domainType.report:

                //实例化一个（编辑，动态表单，报表页面）页面对象
                return new window[opts.formId](opts);

            default:
                return null;
        }
    }

    //加载页面 js 文件
    function loadPageJs(opts, callback) {

        yiCacheScript.g(opts.url, function () {

            callback();
        });
    }

    //获取页面 html 内容
    function getPageHtml(opts, pageObj, callback) {

        yiAjax.gf(pageObj.pageFile, null, function (r) {

            callback(r);

        }, null, true, opts.panel);
    }

    window.Showform = window.Showform || Showform;
})();