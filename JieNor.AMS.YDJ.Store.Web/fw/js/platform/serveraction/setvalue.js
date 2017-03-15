//处理服务端返回的指令，要求根据：pageid,id,row,value页面的指定元素的赋值行为
//{
    //"actionid":"setvalue",
    //"actionparams":[
    //    {
    //        "id": "fnumber",
    //        "row": "-1",
    //        "value":"tt344566"
    //    },
    //    {
    //            "id": "fname",
    //            "row": "-1",
    //            "value":"名称"
    //    }
    //]
//}

/// <reference path="/fw/js/consts.js" />
/// <reference path="/fw/js/tabmgr.js" />
; (function () {
    var Setvalue = (function () {

        //参数：response, actionParam
        return function (r, ap) {

            //如果 actionParam 不存在，则无需处理
            if (!ap || ap.length <= 0) { return; }

            //获取页签管理实例
            var pageSelector = Index.getPageSelector(ap.pageid),

            //需要赋值字段的键值对
            packet = {};

            for (var i = 0; i < ap.length; i++) {
            	
                packet[ap[i].id] = ap[i].value;
            }

            //设置表单控件值
            yiCommon.setFormValue(pageSelector, packet);
        };
    })();
    window.Setvalue = window.Setvalue || Setvalue;
})();