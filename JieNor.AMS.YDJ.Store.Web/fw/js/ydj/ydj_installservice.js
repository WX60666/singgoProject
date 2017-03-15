/// <reference path="/fw/js/basepage.js" />
; (function () {
    var ydj_installservice = (function (_super) {
        var _child = function (args) {
            var that = this;
            _super.call(that, args);

            /********************************************** 各个子业务对象逻辑代码开始 **********************************************/

            //页面地址（由各个子业务对象的 js 初始化）
            that.pageFile = '/views/ydj/ydj_installservice.html';

            //初始化
            that.init = function () {

                //初始化
                that.initBill(args.opData);

                //对于自身的一些特殊控件值的设值和取值

                //自身特有的明细展示
                that.initInstallserviceEntry(that.opData);
				
				
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
			
			
            //初始安装
            that.initInstallserviceEntry = function (opData) {
                //表格ID
                var gridId = that.getJqGridId('finstallentry');
                //初始化明细表格
                yiGrid.init(gridId, {
                    multiselect: true,
                    //数据源
                    data: yiGrid.extractEntry(opData, 'finstallentry'),
                    //定义表格列
                    colModel: [
                        {
                            label: "订货单号", name: "fordernumber", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "订货日期", name: "forderdate", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "套件编码", name: "fsuitnumber", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "商品图片", name: "fmaterialimage", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "商品编码", name: "fmaterialnum", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "商品名称", name: "fproductid", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "规格", name: "fnormsid", width: 80, editable: true, align: "left", fixed: true,
                            edittype: 'select',
                            editoptions: {
                                dataInit: function (ele, opt) {
                                    yiGrid.adDataInit(this, ele, opt, function (e) {

                                    });
                                }
                            }
                        },
                        {
                            label: "材质", name: "fmaterialid", width: 80, editable: true, align: "left", fixed: true,
                            edittype: 'select',
                            editoptions: {
                                dataInit: function (ele, opt) {
                                    yiGrid.adDataInit(this, ele, opt, function (e) {

                                    });
                                }
                            }
                        },
                        {
                            label: "颜色", name: "fcolorid", width: 80, editable: true, align: "left", fixed: true,
                            edittype: 'select',
                            editoptions: {
                                dataInit: function (ele, opt) {
                                    yiGrid.adDataInit(this, ele, opt, function (e) {

                                    });
                                }
                            }
                        },
                        {
                            label: "可安装数量", name: "fcaninstallqty", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "安装数量", name: "finstallqty", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "客户交期", name: "fdeliverydate", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "备注", name: "fdescription_ed", width: 100, editable: true, align: "left", fixed: true,
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
    window.ydj_installservice = window.ydj_installservice || ydj_installservice;
})();