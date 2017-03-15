//首页框架相关
var Index = {

    //常量
    consts: {

        //首页 pageId
        pageId: 'a45a9361-3cb0-4a25-a63e-06375ffc0610',
    },

    //当前框架中所有的页面实例（页签页面，对话框页面，特定容器页面）
    pages: [],

    //销毁一个页面实例
    disposePage: function (pageId) {
        for (var i = 0; i < Index.pages.length; i++) {
            if (Index.pages[i].pageId === pageId) {
                Index.pages[i] = null;
                Index.pages.splice(i, 1);
                break;
            }
        }
    },

    //记录一个页面实例
    addPage: function (page) {
        Index.pages.push(page);
    },
    
    //获取一个页面实例
    getPage: function (pageId) {
        for (var i = 0; i < Index.pages.length; i++) {
            if (Index.pages[i].pageId === pageId) {
                return Index.pages[i];
            }
        }
        return null;
    },

    //获取一个页面选择器
    getPageSelector: function (pageId) {
        return '#' + pageId;
    },

    //暂时留着，以后删除，现在统一采用 openForm 方法
    openTab: function (args) {
        Index.openForm(args);
    },

    //打开一个表单页面
    openForm: function (args) {

        //处理 pageId，如果没有传递 pageId 则默认为首页的 pageId
        args.pageId = args.pageId || Index.consts.pageId

        //统一转小写
        args.formId = args.formId.toLowerCase();
        args.domainType = args.domainType.toLowerCase();

        //客户端参数
        args = $.extend({}, { sp: null }, args);

        //js 类名
        var jsClassName = '';

        //根据领域类型来操作不同的 js 文件
        switch (args.domainType) {
            case Consts.domainType.list:
                jsClassName = 'Query';
                break;
            case Consts.domainType.bill:
            case Consts.domainType.dynamic:
                jsClassName = 'New';
                break;
            default:
                break;
        }
        if (!jsClassName) {
            yiDialog.m({ msg: "领域类型错误！" });
        }

        //转交给对应的 js 处理
        var opfile = '/fw/js/platform/formop/{0}.js'.format(jsClassName);
        yiCacheScript.g(opfile, function () {
            new window[jsClassName](args);
        });
    },

    procIndexAction:function()
    {
        //http://localhost:5000/views/index.html?actiondata=xxxxxxYYYksKIudKKsiidi
        //要求actiondata必须满足服务端HtmlViewAction的对象定义形式
        var tokenId = $.query.get("tokenid");
        var actionData = $.query.get("actiondata");

        if (actionData) {
            yiAjax.px('/dynamic/sys_mainfw?operationno=procIndexAction'
                , { SimpleData: { actionParam: actionData } }
                , function() {
                    history.pushState({}, document.title, document.location.pathname);
                }
                , function () { }
                , undefined
                , undefined
                , function (request) {
                    if(tokenId)
                        request.setRequestHeader("Authorize", "Bearer " + tokenId);
                });
        }
    },
    
    //初始化
    init: function () {

        //初始化 metronic 核心组件
        Metronic.init();

        //初始化当前布局
        Layout.init();

        //首页初始化时先释放所有的 pageId
        yiAjax.p('/dynamic?operationno=closeall', {}, null, function () { });

        //当用户离开首页时
        $(window).bind('beforeunload', function () {

            //如果有打开页签，则提示信息（以免页签数据丢失）
            if ($('#tabs li[role="presentation"]').length > 1) {

                return '请确保所有数据已保存，是否确认离开页面？';
            }
        });

        $('#auser').click(function () {
            //打开页签
            Index.openForm({
                formId: 'sec_user',
                domainType: 'list',
                containerId: 'divTestId'
            });
        });


        //针对首页action的处理        
        Index.procIndexAction();

        //// DevExtreme DataGrid 控件按组件加载 begin ********************************************************************
        //// require 全局配置
        //require.config({
        //    paths: {
        //        // 配置 DevExtreme 模块所在的路径。
        //        "devextreme": "/fw/include/devextreme"
        //    }
        //});
        //// 加载 dataGrid 控件相关资源模块
        //require(["devextreme/client_exporter/excel_creator", "devextreme/ui/data_grid"]);
        //// DevExtreme DataGrid 控件按组件加载 end **********************************************************************
    }
};
$(document).ready(function () {
    Index.init();
});