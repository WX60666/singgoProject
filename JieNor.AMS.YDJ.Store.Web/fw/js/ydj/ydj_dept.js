//@ sourceURL=bd_dept.js
;
(function () {
    var ydj_dept = (function (_super) {
        var _child = function (args) {
            var that = this;
            _super.call(that, args);

            //页面地址（由各个子业务对象的 js 初始化）
            that.pageFile = '/views/ydj/ydj_dept.html';

            that.init = function () {

                //初始化
                that.initBill(args.opData);

                //对于自身的一些特殊控件值的设值和取值

            };
            /********************************************** 各个子业务对象逻辑代码开始 **********************************************/

            /********************************************** 各个子业务对象逻辑代码结束 **********************************************/
        };
        __extends(_child, _super);
        return _child;
    })(BasePage);
    window.ydj_dept = window.ydj_dept || ydj_dept;
})();