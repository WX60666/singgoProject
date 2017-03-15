/// <reference path="/fw/js/basepage.js" />
; (function () {
    var ydj_inventorysheet = (function (_super) {
        var _child = function (args) {
            var that = this;
            _super.call(that, args);

            /********************************************** 各个子业务对象逻辑代码开始 **********************************************/

            //页面地址（由各个子业务对象的 js 初始化）
            that.pageFile = '/views/ydj/ydj_inventorysheet.html';

            //初始化
            that.init = function () {

                //初始化
                that.initBill(args.opData);

                //对于自身的一些特殊控件值的设值和取值

                //自身特有的明细展示
                that.initselproductEntry(that.opData);

                that.initinventoryEntry(that.opData);

            };

            //初始化选择商品明细
            that.initselproductEntry = function (opData) {
                //表格ID
                var gridId = that.getJqGridId('fselproductentry');
                //初始化明细表格
                yiGrid.init(gridId, {
                    multiselect: true,
                    //数据源
                    data: yiGrid.extractEntry(opData, 'fselproductentry'),
                    //定义表格列
                    colModel: [
                        {
                            label: "商品图片", name: "fmaterial_img", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "商品编码", name: "fmaterial_number", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "商品名称", name: "fproductid_name", width: 120, editable: true, align: "left", fixed: true,
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
                            label: "规格", name: "fnorms", width: 80, editable: true, align: "left", fixed: true,
                            edittype: 'select',
                            editoptions: {
                                dataInit: function (ele, opt) {
                                    yiGrid.adDataInit(this, ele, opt, function (e) {

                                    });
                                }
                            }
                        },
                        {
                            label: "材质", name: "fmaterial", width: 80, editable: true, align: "left", fixed: true,
                            edittype: 'select',
                            editoptions: {
                                dataInit: function (ele, opt) {
                                    yiGrid.adDataInit(this, ele, opt, function (e) {

                                    });
                                }
                            }
                        },
                        {
                            label: "颜色", name: "fcolor", width: 80, editable: true, align: "left", fixed: true,
                            edittype: 'select',
                            editoptions: {
                                dataInit: function (ele, opt) {
                                    yiGrid.adDataInit(this, ele, opt, function (e) {

                                    });
                                }
                            }
                        },
                        {
                            label: "所属仓库", name: "fstorehouse_belong", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "库存数量", name: "fstoredamount", width: 80, editable: true, align: "left", fixed: true,
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
                    ]
                });
            };

            //初始化调拨明细
            that.initinventoryEntry = function (opData) {
                //表格ID
                var gridId = that.getJqGridId('finventoryentry');
                //初始化明细表格
                yiGrid.init(gridId, {
                    multiselect: true,
                    //数据源
                    data: yiGrid.extractEntry(opData, 'finventoryentry'),
                    //定义表格列
                    colModel: [
                        {
                            label: "商品图片", name: "fmaterial_img", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "商品编码", name: "fmaterial_number", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "商品名称", name: "fmaterial_name", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "规格", name: "fnorms", width: 80, editable: true, align: "left", fixed: true,
                            edittype: 'select',
                            editoptions: {
                                dataInit: function (ele, opt) {
                                    yiGrid.adDataInit(this, ele, opt, function (e) {

                                    });
                                }
                            }
                        },
                        {
                            label: "材质", name: "fmaterial", width: 80, editable: true, align: "left", fixed: true,
                            edittype: 'select',
                            editoptions: {
                                dataInit: function (ele, opt) {
                                    yiGrid.adDataInit(this, ele, opt, function (e) {

                                    });
                                }
                            }
                        },
                        {
                            label: "颜色", name: "fcolor", width: 80, editable: true, align: "left", fixed: true,
                            edittype: 'select',
                            editoptions: {
                                dataInit: function (ele, opt) {
                                    yiGrid.adDataInit(this, ele, opt, function (e) {

                                    });
                                }
                            }
                        },
                        {
                            label: "调出仓库", name: "foutstore", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "库存数量", name: "fstoredamount", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "调入仓库", name: "finstore", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "调拨数量", name: "finventoryamount", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "备注", name: "frecord", width: 80, editable: true, align: "left", fixed: true,
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
    window.ydj_inventorysheet = window.ydj_inventorysheet || ydj_inventorysheet;
})();