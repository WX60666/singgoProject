
/// <reference path="/fw/js/basepage.js" />
//价格体系-尺寸定价
; (function () {
    var ydj_sizeprice = (function (_super) {
        var _child = function (args) {
            var that = this;
            _super.call(that, args);

            /********************************************** 各个子业务对象逻辑代码开始 **********************************************/

            //页面地址（由各个子业务对象的 js 初始化）
            that.pageFile = '/views/ydj/ydj_sizeprice.html';

            //初始化
            that.init = function () {

                //初始化
                that.initBill(args.opData);

                //对于自身的一些特殊控件值的设值和取值
				
				//自身特有的明细展示
                that.initSizesecEntry(that.opData);
            };

            //初始化尺寸区间明细
            that.initSizesecEntry = function (opData) {
                //表格ID
                var gridId = that.getJqGridId('fentity');
                //初始化明细表格
                yiGrid.init(gridId, {
                    multiselect: true,
                    //数据源
                    data: yiGrid.extractEntry(opData, 'fentity'),
                    //定义表格列
                    colModel: [
                        {
                            label: "长 (单位/mm) 上限", name: "flongmax", width: 130, editable: true, align: "left", fixed: true,
                            editrules: {
                                required: false, integer: true, minValue: -2147483648, maxValue: 2147483647
                            },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 9,
                                custom_value: yiGrid.intCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.intCustomElement(val, opt).on('change', function (e) {

                                    });
                                }
                            },
                            formatter: yiGrid.intFormatter,
                            unformat: yiGrid.intUnFormat
                        },
                        {
                            label: "长 (单位/mm) 下限", name: "flongmin", width: 130, editable: true, align: "left", fixed: true,
                            editrules: {
                                required: false, integer: true, minValue: -2147483648, maxValue: 2147483647
                            },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 9,
                                custom_value: yiGrid.intCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.intCustomElement(val, opt).on('change', function (e) {

                                    });
                                }
                            },
                            formatter: yiGrid.intFormatter,
                            unformat: yiGrid.intUnFormat
                        },
                        {
                            label: "宽 (单位/mm) 上限", name: "fwidthmax", width: 130, editable: true, align: "left", fixed: true,
                            editrules: {
                                required: false, integer: true, minValue: -2147483648, maxValue: 2147483647
                            },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 9,
                                custom_value: yiGrid.intCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.intCustomElement(val, opt).on('change', function (e) {

                                    });
                                }
                            },
                            formatter: yiGrid.intFormatter,
                            unformat: yiGrid.intUnFormat
                        },
                        {
                            label: "宽 (单位/mm) 下限", name: "fwidthmin", width: 130, editable: true, align: "left", fixed: true,
                            editrules: {
                                required: false, integer: true, minValue: -2147483648, maxValue: 2147483647
                            },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 9,
                                custom_value: yiGrid.intCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.intCustomElement(val, opt).on('change', function (e) {

                                    });
                                }
                            },
                            formatter: yiGrid.intFormatter,
                            unformat: yiGrid.intUnFormat
                        },
                        {
                            label: "厚 (单位/mm) 上限", name: "fthickmax", width: 130, editable: true, align: "left", fixed: true,
                            editrules: {
                                required: false, integer: true, minValue: -2147483648, maxValue: 2147483647
                            },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 9,
                                custom_value: yiGrid.intCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.intCustomElement(val, opt).on('change', function (e) {

                                    });
                                }
                            },
                            formatter: yiGrid.intFormatter,
                            unformat: yiGrid.intUnFormat
                        },
                        {
                            label: "厚 (单位/mm) 下限", name: "fthickmin", width: 130, editable: true, align: "left", fixed: true,
                            editrules: {
                                required: false, integer: true, minValue: -2147483648, maxValue: 2147483647
                            },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 9,
                                custom_value: yiGrid.intCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.intCustomElement(val, opt).on('change', function (e) {

                                    });
                                }
                            },
                            formatter: yiGrid.intFormatter,
                            unformat: yiGrid.intUnFormat
                        },
                        {
                            label: "采购价", name: "fpurcharseprice", width: 80, editable: true, align: "left", fixed: true,
                            editrules: {
                                required: false, integer: true, minValue: -2147483648, maxValue: 2147483647
                            },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 9,
                                custom_value: yiGrid.intCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.intCustomElement(val, opt).on('change', function (e) {

                                    });
                                }
                            },
                            formatter: yiGrid.intFormatter,
                            unformat: yiGrid.intUnFormat
                        },
                        {
                            label: "售价", name: "fprice", width: 80, editable: true, align: "left", fixed: true,
                            editrules: {
                                required: false, integer: true, minValue: -2147483648, maxValue: 2147483647
                            },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 9,
                                custom_value: yiGrid.intCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.intCustomElement(val, opt).on('change', function (e) {

                                    });
                                }
                            },
                            formatter: yiGrid.intFormatter,
                            unformat: yiGrid.intUnFormat
                        },
                        {
                            label: "经销价", name: "fsellprice", width: 80, editable: true, align: "left", fixed: true,
                            editrules: {
                                required: false, integer: true, minValue: -2147483648, maxValue: 2147483647
                            },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 9,
                                custom_value: yiGrid.intCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.intCustomElement(val, opt).on('change', function (e) {

                                    });
                                }
                            },
                            formatter: yiGrid.intFormatter,
                            unformat: yiGrid.intUnFormat
                        }
                    ]
                });
            };

            /********************************************** 各个子业务对象逻辑代码结束 **********************************************/
        };
        __extends(_child, _super);
        return _child;
    })(BasePage);
    window.ydj_sizeprice = window.ydj_sizeprice || ydj_sizeprice;
})();