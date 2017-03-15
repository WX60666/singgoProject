/// <reference path="/fw/js/basepage.js" />
; (function () {
    var ydj_purchasereturn = (function (_super) {
        var _child = function (args) {
            var that = this;
            _super.call(that, args);

            /********************************************** 各个子业务对象逻辑代码开始 **********************************************/

            //页面地址（由各个子业务对象的 js 初始化）
            that.pageFile = '/views/ydj/ydj_purchasereturn.html';

            //初始化
            that.init = function () {

                //初始化
                that.initBill(args.opData);

                //对于自身的一些特殊控件值的设值和取值

                //自身特有的明细展示
                that.initPurreturnEntry(that.opData);

            };

            //初始化退货单
            that.initPurreturnEntry = function (opData) {
                //表格ID
                var gridId = that.getJqGridId('fpurchasereturnentry');
                //初始化明细表格
                yiGrid.init(gridId, {
                    multiselect: true,
                    //数据源
                    data: yiGrid.extractEntry(opData, 'fpurchasereturnentry'),
                    //定义表格列
                    colModel: [
                        {
                            label: "订货单号", name: "forder_number", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "订货日期", name: "forder_date", width: 100, editable: true, align: "left", fixed: true,
                            editrules: { required: false, date: true },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 12,
                                custom_value: yiGrid.dateCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.dateCustomElement(val, opt).on('changeDate', function (e) {

                                    });
                                }
                            },
                            formatter: yiGrid.dateFormatter
                        },
                        {
                            label: "套件编码", name: "fsuitid_name", width: 100, editable: true, align: "left", fixed: true,
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
                            label: "赠品", name: "ffreegifts", width: 40, editable: true, align: "center", fixed: true,
                            formatter: 'checkbox',
                            edittype: 'custom',
                            editoptions: {
                                custom_value: yiGrid.boolCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.boolCustomElement(val, opt).on('change', function (e) {

                                    });
                                }
                            }
                        },
                        {
                            label: "采购单价", name: "fpurchaseprice", width: 80, editable: true, align: "left", fixed: true,
                            editrules: { required: false, number: true, minValue: 0 },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 34,
                                custom_value: yiGrid.numberCustomValue,
                                custom_element: function (val, opt) {
                                    var gird = this;
                                    return yiGrid.numberCustomElement(val, opt).on('change', function (e) {

                                    });
                                }
                            },
                            formatter: yiGrid.numberFormatter,
                            unformat: yiGrid.numberUnFormat
                        },
                        {
                            label: "可退数量", name: "freturnableqty", width: 80, editable: false, align: "left", fixed: true,
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
                            label: "退货数量", name: "freturnqty", width: 80, editable: false, align: "left", fixed: true,
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
                            label: "库存数量", name: "fstoredqty", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "退货金额", name: "freturnamount", width: 80, editable: true, align: "left", fixed: true,
                            editrules: { required: false, number: true, minValue: 0 },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 34,
                                custom_value: yiGrid.numberCustomValue,
                                custom_element: function (val, opt) {
                                    var gird = this;
                                    return yiGrid.numberCustomElement(val, opt).on('change', function (e) {

                                    });
                                }
                            },
                            formatter: yiGrid.numberFormatter,
                            unformat: yiGrid.numberUnFormat
                        },
                        {
                            label: "客户交期", name: "fdeliverydate", width: 80, editable: false, align: "left", fixed: true,
                            editrules: { required: false, date: true },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 12,
                                custom_value: yiGrid.dateCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.dateCustomElement(val, opt).on('changeDate', function (e) {

                                    });
                                }
                            },
                            formatter: yiGrid.dateFormatter
                        },
                        {
                            label: "到货日期", name: "farrivaldate", width: 80, editable: false, align: "left", fixed: true,
                            editrules: { required: false, date: true },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 12,
                                custom_value: yiGrid.dateCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.dateCustomElement(val, opt).on('changeDate', function (e) {

                                    });
                                }
                            },
                            formatter: yiGrid.dateFormatter
                        },
                        {
                            label: "备注", name: "fdescription", width: 80, editable: true, align: "left", fixed: true,
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
    window.ydj_purchasereturn = window.ydj_purchasereturn || ydj_purchasereturn;
})();