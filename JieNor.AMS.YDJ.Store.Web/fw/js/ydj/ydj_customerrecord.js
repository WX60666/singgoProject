
/// <reference path="/fw/js/basepage.js" />
//客流客户-客流记录
; (function () {
    var ydj_customerrecord = (function (_super) {
        var _child = function (args) {
            var that = this;
            _super.call(that, args);
            /********************************************** 各个子业务对象逻辑代码开始 **********************************************/

            //页面地址（由各个子业务对象的 js 初始化）
            that.pageFile = '/views/ydj/ydj_customerrecord.html';

            //初始化
            that.init = function () {

                //初始化
                that.initBill(args.opData);

                //对于自身的一些特殊控件值的设值和取值

                //初始化数据
                that.getData(args.opData);
                
                //初始化事件
                that.initEvent();
            };
			
			
			//初始化事件
            that.initEvent = function () {
                
                //处理（省，市，区）联动
                //初始化省市区联动下拉框数据源（编辑的时候需要）
                var uidata = that.opData && that.opData.billData && that.opData.billData.uidata ? that.opData.billData.uidata : null;
                if (uidata) {
                    that.initCity(uidata.fprovince, uidata.fcity);
                    that.initRegion(uidata.fcity, uidata.fregion);
                }

                //省份下拉框的选择事件
                that.gebn('fprovince').on('change', function (e) {
                    that.initCity(e.val);
                });

                //城市下拉框的选择事件
                that.gebn('fcity').on('change', function (e) {
                    that.initRegion(e.val);
                });

            };
			
			
            //初始化表体单据
            that.getData = function (opData) {

                //自身特有的操作（菜单操作）
                that.onMenuItemClick = function (menuItem) {
                    //操作类型
                    var opcode = menuItem.attr('opcode').toLowerCase();
                    if (opcode === 'generatecustomer') {
                        var packet = { billData: [{}] };
                        //表头字段数据统一打包
                        var billHead = yiCommon.getFormValue(args.pageSelector);
                        //表体字段数据统一打包
                        var billEntry = yiCommon.getFormEntrys(args.pageSelector);
                        //合并表单字段（表头，表体，特殊表体）
                        $.extend(packet.billData[0], billHead, billEntry);
                        //将 billData 转换为 json 字符串
                        packet.billData = JSON.stringify(packet.billData);
                        yiAjax.p('/dynamic/ydj_customerrecord?operationno=ydj_generatecustomer', packet);
                        return true;//返回 true 告诉 BasePage 该操作由我自己处理
                    }
                };
            };
            

            /********************************************** 各个子业务对象逻辑代码结束 **********************************************/
        };
        __extends(_child, _super);
        return _child;
    })(BasePage);
    window.ydj_customerrecord = window.ydj_customerrecord || ydj_customerrecord;
})();