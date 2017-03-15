/// <reference path="/fw/js/basepage.js" />
; (function () {
    var sec_admin = (function (_super) {
        var _child = function (args) {
            var that = this;
            _super.call(that, args);

            /********************************************** 各个子业务对象逻辑代码开始 **********************************************/

            //页面地址（由各个子业务对象的 js 初始化）
            that.pageFile = '/views/sec/sec_admin.html';

            //初始化
            that.init = function () {

                //初始化
                that.initBill(args.opData);

                //对于自身的一些特殊控件值的设值和取值

            };

            //自身特有的操作
            that.onMenuItemClick = function (menuItem) {

            };

            //处理服务端返回的数据
            that.onProcessSrvData = function (params) {

            };

            /********************************************** 各个子业务对象逻辑代码结束 **********************************************/
        };
        __extends(_child, _super);
        return _child;
    })(BasePage);
    window.sec_admin = window.sec_admin || sec_admin;
})();