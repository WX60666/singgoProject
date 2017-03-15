
/// <reference path="/fw/js/basepage.js" />
//基础资料-单位
; (function () {
    var ydj_supplement = (function (_super) {
        var _child = function (args) {
            var that = this;
            _super.call(that, args);

            /********************************************** 各个子业务对象逻辑代码开始 **********************************************/

            //页面地址（由各个子业务对象的 js 初始化）
            that.pageFile = '/views/ydj/ydj_supplement.html';

            //初始化
            that.init = function () {

                //初始化
                that.initBill(args.opData);
				
				//初始化
                that.initdata();
                
                //对于自身的一些特殊控件值的设值和取值

            };
			that.initdata = function () {

                var itemdataGrid = $('div[entryid="fproductentity"]', that.pageSelector).dxDataGrid({
                    columns: [
                    {
                        dataField: "fseq",
                        caption: "序号",
                        dataType: "number",
                        allowEditing: false,
                        width: 50
                    },
                    {
                        dataField: "fproductname",
                        caption: "产品名称",
                        width: 100
                    },
                    {
                        dataField: "funitid",
                        caption: "单位",
                        width: 100
                    },
                    {
                        dataField: "fqty",
                        caption: "数量",
                        dataType: "number",
                        width: 100
                    },
                    {
                        dataField: "farea",
                        caption: "面积",
                        dataType: "number",
                        width: 100
                    },
                    {
                        dataField: "fgift",
                        caption: "赠品",
                        dataType: "checkbox",
                        width: 100
                    },
                    {
                        dataField: "fprice",
                        caption: "单价",
                        dataType: "number",
                        width: 100
                    },
                    {
                        dataField: "famount",
                        caption: "金额",
                        dataType: "number",
                        width: 100
                    },
                    {
                        dataField: "fitemnote",
                        caption: "备注",
                        width: 100
                    }]

                }).dxDataGrid("instance");

                

            }
            

            /********************************************** 各个子业务对象逻辑代码结束 **********************************************/
        };
        __extends(_child, _super);
        return _child;
    })(BasePage);
    window.ydj_supplement = window.ydj_supplement || ydj_supplement;
})();