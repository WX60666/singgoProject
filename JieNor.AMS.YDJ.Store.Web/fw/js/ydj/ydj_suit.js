/// <reference path="/fw/js/basepage.js" />
//@ sourceURL=/fw/js/ydj/ydj_suit.js
; (function () {
    var ydj_suit = (function (_super) {
        var _child = function (args) {
            var that = this;
            _super.call(that, args);

            /********************************************** 各个子业务对象逻辑代码开始 **********************************************/

            //页面地址（由各个子业务对象的 js 初始化）
            that.pageFile = '/views/ydj/ydj_suit.html';

            //商品明细ID
            that.suitEntryId = 'fsuitentry';

            //初始化
            that.init = function () {

                //初始化
                that.initBill(that.opData);

                //初始化明细
                that.initSuitEntry(that.opData);
            };

            //字段值改变后
            that.onFieldValueChanged = function (param) {

            },

            //初始化商品明细
            that.initSuitEntry = function (opData) {
                //表格ID
                var gridId = that.getJqGridId(that.suitEntryId);
                //初始化明细表格
                yiGrid.init(gridId, {
                    //数据源
                    data: yiGrid.extractEntry(opData, that.suitEntryId),
                    multiselect:true,
                    //定义表格列
                    colModel: [
                        {
                            label: "商品名称", name: "fproductid_name", width: 160, editable: true, align: "left", fixed: true,
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.bdCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.bdCustomElement(that, this, val, opt, function (records) {

                                    });
                                }
                            }
                        },
                        {
                            label: "单位", name: "funitid_name", width: 70, editable: true, align: "left", fixed: true,
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.bdCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.bdCustomElement(that, this, val, opt, function (records) {

                                    });
                                }
                            }
                        },
                        {
                            label: "规格", name: "fnormsid_name", width: 70, editable: true, align: "left", fixed: true,
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.bdCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.bdCustomElement(that, this, val, opt, function (records) {

                                    });
                                }
                            }
                        },
                        {
                            label: "材质", name: "fmaterialid_name", width: 70, editable: true, align: "left", fixed: true,
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.bdCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.bdCustomElement(that, this, val, opt, function (records) {

                                    });
                                }
                            }
                        },
                        {
                            label: "颜色", name: "fcolorid_name", width: 70, editable: true, align: "left", fixed: true,
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.bdCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.bdCustomElement(that, this, val, opt, function (records) {

                                    });
                                }
                            }
                        },
                        {
                            label: "定制属性", name: "fcustomattr", width: 100, editable: true, align: "left", fixed: true,
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
                        },
                        {
                            label: "数量", name: "fqty", width: 55, editable: true, align: "right", fixed: true,
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
    window.ydj_suit = window.ydj_suit || ydj_suit;
})();