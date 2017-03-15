/// <reference path="/fw/js/basepage.js" />
//@ sourceURL=/fw/js/ydj/ydj_salesslip.js
; (function () {
    var ydj_salesslip = (function (_super) {
        var _child = function (args) {
            var that = this;
            _super.call(that, args);

            /********************************************** 各个子业务对象逻辑代码开始 **********************************************/

            //页面地址（由各个子业务对象的 js 初始化）
            that.pageFile = '/views/ydj/ydj_salesslip.html';

            //出库商品明细ID
            that.outEntryId = 'foutentry';

            //初始化
            that.init = function () {

                //初始化
                that.initBill(that.opData);

                //初始化事件
                that.initEvent();

                //初始化出库商品明细
                that.initOutEntry();
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

            //初始化出库商品明细
            that.initOutEntry = function () {
                var gridId = that.getJqGridId(that.outEntryId);
                yiGrid.init(gridId, {
                    data: yiGrid.extractEntry(that.opData, that.outEntryId),
                    colModel: [
                        {
                            label: "订货单号", name: "forderno", width: 100, editable: false, align: "center", fixed: true
                        },
                        {
                            label: "订货日期", name: "forderdate", width: 90, editable: false, align: "center", fixed: true,
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
                            label: "商品图片", name: "fpimage", width: 100, editable: false, align: "center", fixed: true
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
                            label: "应出数量", name: "fqty", width: 75, editable: true, align: "right", fixed: true,
                            editrules: {
                                required: false, integer: true, minValue: -2147483648, maxValue: 2147483647
                            },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 9,
                                custom_value: yiGrid.intCustomValue,
                                custom_element: function (val, opt) {
                                    var gird = this;
                                    return yiGrid.intCustomElement(val, opt).on('change', function (e) {

                                    });
                                }
                            },
                            formatter: yiGrid.intFormatter,
                            unformat: yiGrid.intUnFormat
                        },
                        {
                            label: "赠品", name: "fisgift", width: 55, editable: true, align: "center", fixed: true,
                            formatter: 'checkbox',
                            edittype: 'custom',
                            editoptions: {
                                custom_value: yiGrid.boolCustomValue,
                                custom_element: function (val, opt) {
                                    var gird = this;
                                    return yiGrid.boolCustomElement(val, opt).on('change', function (e) {

                                    });
                                }
                            }
                        },
                        {
                            label: "销售单价", name: "fprice", width: 80, editable: true, align: "right", fixed: true,
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
                            formatter: numFmt,
                            unformat: yiGrid.numberUnFormat
                        },
                        {
                            label: "出库数量", name: "foutqty", width: 75, editable: false, align: "right", fixed: true,
                            formatter: yiGrid.intFormatter,
                            unformat: yiGrid.intUnFormat
                        },
                        {
                            label: "库存数量", name: "fstockqty", width: 75, editable: false, align: "right", fixed: true,
                            formatter: yiGrid.intFormatter,
                            unformat: yiGrid.intUnFormat
                        },
                        {
                            label: "出库金额", name: "foutamount", width: 80, editable: false, align: "right", fixed: true,
                            formatter: yiGrid.intFormatter,
                            unformat: yiGrid.intUnFormat
                        },
                        {
                            label: "客户交期", name: "fdeliverydate", width: 90, editable: false, align: "center", fixed: true,
                            formatter: yiGrid.dateFormatter
                        },
                        {
                            label: "到货日期", name: "farrivaldate", width: 90, editable: false, align: "center", fixed: true,
                            formatter: yiGrid.dateFormatter
                        },
                        {
                            label: "备注", name: "fdescription_e", width: 100, editable: true, align: "left", fixed: true,
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
                            label: "安装数量", name: "finstallqty", width: 65, editable: false, align: "right", fixed: true,
                            formatter: yiGrid.intFormatter,
                            unformat: yiGrid.intUnFormat
                        },
                    ],
                    onAfterDeleting: function (gid, rowId) {

                    }
                });
            };

            //数字字段格式化函数
            function numFmt(cv, opt, ro) {
                return cv <= 0 ? '' : yiMath.toMoneyFormat(cv, 6, 0);
            }

            /********************************************** 各个子业务对象逻辑代码结束 **********************************************/
        };
        __extends(_child, _super);
        return _child;
    })(BasePage);
    window.ydj_salesslip = window.ydj_salesslip || ydj_salesslip;
})();