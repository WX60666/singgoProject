/// <reference path="/fw/js/basepage.js" />
; (function () {
    var ydj_storehouse = (function (_super) {
        var _child = function (args) {
            var that = this;
            _super.call(that, args);

            /********************************************** 各个子业务对象逻辑代码开始 **********************************************/

            //页面地址（由各个子业务对象的 js 初始化）
            that.pageFile = '/views/ydj/ydj_storehouse.html';

            //初始化
            that.init = function () {

                //初始化
                that.initBill(args.opData);

                //对于自身的一些特殊控件值的设值和取值

                //自身特有的明细展示
                that.initOrderEntry(that.opData);

            };

            //初始化其他费用明细
            that.initOrderEntry = function (opData) {
                //表格ID
                var gridId = that.getJqGridId('fhouseentry');
                //初始化明细表格
                yiGrid.init(gridId, {
                    multiselect: true,
                    //数据源
                    data: yiGrid.extractEntry(opData, 'fhouseentry'),
                    //定义表格列
                    colModel: [
                        {
                            label: "仓位名称", name: "fstoreposition_name", width: 150, editable: true, align: "left", fixed: true,
                            editrules: { required: false },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.strCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.strCustomElement(val, opt).on('change', function (e) {

                                    });
                                }
                            }
                        }
                    ]
                });
            };

            /********************************************** 各个子业务对象逻辑代码结束 **********************************************/
        };
        __extends(_child, _super);
        return _child;
    })(BasePage);
    window.ydj_storehouse = window.ydj_storehouse || ydj_storehouse;
})();