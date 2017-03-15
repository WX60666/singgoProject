/// <reference path="/fw/js/basepage.js" />
//@ sourceURL=/fw/js/ydj/ydj_order.js
; (function () {
    var ydj_order = (function (_super) {
        var _child = function (args) {
            var that = this;
            _super.call(that, args);

            /********************************************** 各个子业务对象逻辑代码开始 **********************************************/

            //页面地址（由各个子业务对象的 js 初始化）
            that.pageFile = '/views/ydj/ydj_order.html';

            //负责人明细ID
            that.dutyEntryId = 'fdutyentry';
            //增补明细ID
            that.subjoinEntryId = 'fsubjoinentry';
            var subjoinGridId = that.getJqGridId(that.subjoinEntryId);
            //费用明细ID
            that.expenseEntryId = 'fexpenseentry';
            //套件下单明细ID
            that.suitEntryId = 'fsuitentry';
            //商品明细ID
            that.productEntryId = 'fproductentry';

            //监听器
            var listen = new yiListener();

            //初始化
            that.init = function () {

                //初始化
                that.initBill(that.opData);

                //初始化事件
                that.initEvent();

                //初始化明细
                that.initDutyEntry();
                that.initSubjoinEntry();
                that.initExpenseEntry();
                that.initSuitEntry();
                that.initProductEntry();

                //自身特有的明细展示
                that.setEntrys();

                listen.getValEvent = function () {
                    var _default = { name: null, tname: null, key: null };
                    var _object = arguments[0];
                    Comm.ParameterInit(_default, _object);
                    if (String(_object.key).isNullOrEmpty()) {
                        _object.tname = null;
                    }
                    var _o = that.getFieldValue(_object.name, _object.tname, _object.key);
                    return _o ? String(_o.id).isNullOrEmpty() ? 0 : _o.id : 0;
                }
                listen.setValEvent = function () {
                    var _default = { name: null, tname: null, key: null, value: null };
                    var _object = arguments[0];
                    Comm.ParameterInit(_default, _object);
                    that.setFieldValue(_object.name, _object.value, _object.tname, _object.key);
                }

                //attrValue：表达式
                //name：表达式对应的name
                //arrName：可以是集合方式 Table集合名称
                //arrType：可以是集合方式 处理类型0是单例1是集合
                listen.Init({
                    data: that.opData.billData.uidata,
                    pageId: that.pageId,
                    differential: { pk: 'id' },
                    expression: [
                        ////负责人明细
                        ////表体金额 = 表头折后金额 * 表体比例
                        { attrValue: "{fdealamount_h}*{fratio}", name: "famount_ed", arrName: [null, that.dutyEntryId], arrType: [0, 0] },

                        //////增补明细
                        //////表体金额 = 表头面价金额 * 表体比例
                       { attrValue: "{ffaceamount}*{fratio_ezb}", name: "famount_ezb", arrName: [null, that.subjoinEntryId], arrType: [0, 0] },

                        //////费用明细
                        //////表头费用合计 = 表体金额汇总
                         { attrValue: "Sum({famount_ee})", name: "fexpense", arrName: [that.expenseEntryId], arrType: [1] },
                        //////表头未收费用 = 表头费用合计 - 表头已收费用
                         { attrValue: "{fexpense}-{frecexpense}", name: "funrecexpense", isHead: true, arrName: [null, null], arrType: [0, 0] },
                        //商品明细
                        //表体金额 = 表体非标系数 * 表体数量 * 表体单价
                       { attrValue: "{fnsc}*{fqty}*{fprice}", name: "famount", arrName: [that.productEntryId, that.productEntryId, that.productEntryId], arrType: [0, 0, 0] },
                        //表体折扣额 = 表体金额 -（表体金额 * 表体折扣率）
                        { attrValue: "{famount}-({famount}*{fdistrate_e})", name: "fdistamount_e", arrName: [that.productEntryId, that.productEntryId, that.productEntryId], arrType: [0, 0, 0] },

                        //表体优惠金额 = 表头优惠金额 * （表体金额 / 表体金额汇总 ）
                        { attrValue: "{ffavoramount_h}*{famount}/Sum({famount})", isHead: true, name: "ffavoramount_e", arrName: [null, that.productEntryId, that.productEntryId], arrType: [0, 0, 1] },
                        //表体折后单价 =（表体金额 - （表体折扣额 + 表体优惠金额））/ 表体数量
                         { attrValue: "({famount}-({fdistamount_e}+{ffavoramount_e}))/{fqty}", name: "fdealprice", arrName: [that.productEntryId, that.productEntryId, that.productEntryId, that.productEntryId], arrType: [0, 0, 0, 0] },
                        //表体折后金额 = 表体非标系数 * 表体数量 * 表体折后单价
                        { attrValue: "{fnsc}*{fqty}*{fdealprice}", name: "fdealamount_e", setDom: 'Table', arrName: [that.productEntryId, that.productEntryId, that.productEntryId], arrType: [0, 0, 0] },
                    ]
                });
            };

            //自身特有的明细展示
            that.setEntrys = function () {
                if (that.opData && that.opData.billData && that.opData.billData.uidata) {
                    //设置明细......
                }
            };

            //自身特有的明细打包
            that.getEntrys = function () {

                //明细对象（每个明细作为明细对象的一个属性存在，属性名称与后端 mdl 文件中定义的一致）
                var entry = {};

                //打包明细
                //entry.fentry1 = [{}, {}, {}];
                //entry.fentry2 = [{}, {}, {}];
                //等等......

                //返回该明细对象
                return entry;
            };

            //初始化事件
            that.initEvent = function () {

                //处理（省，市，区）联动
                //初始化省市区联动下拉框数据源（编辑的时候需要）
                var uidata = that.opData && that.opData.billData && that.opData.billData.uidata ? that.opData.billData.uidata : null;
                if (uidata) {
                    that.initCity(uidata.fprovince, uidata.fcity);
                    that.initRegion(uidata.fcity, uidata.fregion);
                    procSubjoinInfo(uidata.ftype);
                    procSubjoinEntry(uidata.fduty);
                }

                //省份下拉框的选择事件
                that.gebn('fprovince').on('change', function (e) {
                    that.initCity(e.val);
                });

                //城市下拉框的选择事件
                that.gebn('fcity').on('change', function (e) {
                    that.initRegion(e.val);
                });

                //业务类型下拉框的选择事件
                that.gebn('ftype').on('change', function (e) {
                    procSubjoinInfo(e.val);
                });

                //责任方下拉框的选择事件
                that.gebn('fduty').on('change', function (e) {
                    procSubjoinEntry(e.val);
                });

                //根据业务类型隐藏和显示相关信息
                function procSubjoinInfo(type) {
                    var $oon = that.gebs('.old-order-no'),
                        $ooni = $oon.find('input'),
                        $si = that.gebs('.subjoin-info');
                    if (type === 'order_type_02') {
                        $ooni.attr('required', 'required');
                        $oon.show();
                        $si.show();
                    } else {
                        $ooni.removeAttr('required');
                        $oon.hide();
                        $si.hide();
                    }
                }

                //根据责任方隐藏和显示相关信息
                function procSubjoinEntry(duty) {
                    var $se = that.gebs('.subjoin-entry');
                    if (duty === 'duty_03') {
                        $se.show();
                        //调整增补明细表格宽度
                        yiGrid.resizeWidth(subjoinGridId);
                    } else {
                        $se.hide();
                    }
                }
            };

            //字段值改变后
            that.onFieldValueChanged = function (param) {
                switch (param.fieldName) {
                    //选择“客户基础资料”后填充客户关联字段信息
                    case 'fcustomerid':
                        that.fillCustomerInfo(param.values);
                        break;
                }
            };

            //根据客户ID获取客户信息后填充相关字段值
            that.fillCustomerInfo = function (record) {
                var url = '/{0}/{1}?operationno=baserefquery'.format(that.domainType, that.formId),
                    params = { simpleData: { fieldKey: 'fcustomerid', id: record[0].fbillhead_id } };
                yiAjax.p(url, params,
                    function (r) {
                        var ds = r.operationResult.srvData.data, d = ds && ds.length > 0 ? ds[0] : null;
                        if (!d) { return; }
                        yiCommon.setFormValue(that.pageSelector, {
                            fprovince: $.trim(d.fprovince),
                            fconsignee: d.fname,
                            faddress: d.faddress,
                            fphone: d.fphone,
                            fbrandid: d.fbrandid,
                            fbrandid_name: d.fbrandid_fname,
                            fdeptid: d.fdeptid,
                            fdeptid_name: d.fdeptid_fname,
                            fdutyid: d.fdutyid,
                            fdutyid_name: d.fdutyid_fname,
                            fassistid: d.fassistid,
                            fassistid_name: d.fassistid_fname,
                        });
                        that.initCity(d.fprovince, d.fcity);
                        that.initRegion(d.fcity, d.fregion);
                    }
                );
            };

            //初始化负责人明细
            that.initDutyEntry = function () {
                var gridId = that.getJqGridId(that.dutyEntryId);
                yiGrid.init(gridId, {
                    rownumbers: false,
                    data: yiGrid.extractEntry(that.opData, that.dutyEntryId),
                    colModel: [
                        {
                            label: "主要负责", name: "fismain", width: 70, editable: true, align: "center",
                            formatter: 'checkbox',
                            edittype: 'custom',
                            editoptions: {
                                custom_value: yiGrid.boolCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.boolCE(val, opt, this);
                                }
                            }
                        },
                        {
                            label: "负责人", name: "fdutyid_name", width: 90, editable: true, align: "left",
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.bdCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.bdCE(that, this, val, opt, function (records) {

                                    });
                                }
                            }
                        },
                        {
                            label: "所属门店", name: "fdeptid_name", width: 100, editable: true, align: "left",
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.bdCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.bdCE(that, this, val, opt, function (records) {

                                    });
                                }
                            }
                        },
                        {
                            label: "比例", name: "fratio", width: 55, editable: true, align: "right",
                            editrules: { number: true, minValue: 0 },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 34,
                                custom_value: yiGrid.nbCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.nbCE(val, opt, this).on('change', function (e) {
                                        //表达式计算
                                        listen.Expression.Execute({
                                            name: opt.name,
                                            tname: that.dutyEntryId,
                                            key: "id",
                                            value: opt.rowId,
                                            val: $(this).val(),
                                            setVal: listen.setValEvent,
                                            getVal: listen.getValEvent
                                        });
                                    });
                                }
                            },
                            formatter: yiGrid.nbFmt,
                            unformat: yiGrid.nbUnFmt
                        },
                        {
                            label: "金额", name: "famount_ed", width: 65, editable: true, align: "right",
                            editrules: { number: true, minValue: 0 },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 34,
                                custom_value: yiGrid.nbCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.nbCE(val, opt, this);
                                }
                            },
                            formatter: yiGrid.nbFmt,
                            unformat: yiGrid.nbUnFmt
                        },
                        {
                            label: "备注", name: "fdescription_ed", width: 100, editable: true, align: "left",
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.strCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.strCE(val, opt, this);
                                }
                            }
                        }
                    ]
                });
            };

            //初始化增补明细
            that.initSubjoinEntry = function () {
                var gridId = subjoinGridId;
                yiGrid.init(gridId, {
                    data: yiGrid.extractEntry(that.opData, that.subjoinEntryId),
                    colModel: [
                        {
                            label: "负责人", name: "fdutyid_ezb_name", width: 90, editable: true, align: "left",
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.bdCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.bdCE(that, this, val, opt, function (records) {

                                    });
                                }
                            }
                        },
                        {
                            label: "岗位", name: "fpostid_ezb_name", width: 90, editable: true, align: "left",
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.bdCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.bdCE(that, this, val, opt, function (records) {

                                    });
                                }
                            }
                        },
                        {
                            label: "所属门店", name: "fdeptid_ezb_name", width: 100, editable: true, align: "left",
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.bdCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.bdCE(that, this, val, opt, function (records) {

                                    });
                                }
                            }
                        },
                        {
                            label: "比例", name: "fratio_ezb", width: 55, editable: true, align: "right",
                            editrules: { number: true, minValue: 0 },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 34,
                                custom_value: yiGrid.nbCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.nbCE(val, opt, this).on('change', function (e) {
                                        //表达式计算
                                        listen.Expression.Execute({
                                            name: opt.name,
                                            tname: that.subjoinEntryId,
                                            key: "id",
                                            value: opt.rowId,
                                            val: $(this).val(),
                                            setVal: listen.setValEvent,
                                            getVal: listen.getValEvent
                                        });
                                    });
                                }
                            },
                            formatter: yiGrid.nbFmt,
                            unformat: yiGrid.nbUnFmt
                        },
                        {
                            label: "金额", name: "famount_ezb", width: 65, editable: true, align: "right",
                            editrules: { number: true, minValue: 0 },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 34,
                                custom_value: yiGrid.nbCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.nbCE(val, opt, this);
                                }
                            },
                            formatter: yiGrid.nbFmt,
                            unformat: yiGrid.nbUnFmt
                        },
                        {
                            label: "备注", name: "fdescription_ezb", width: 100, editable: true, align: "left",
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.strCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.strCE(val, opt, this);
                                }
                            }
                        }
                    ]
                });
            };

            //初始化费用明细
            that.initExpenseEntry = function () {
                var gridId = that.getJqGridId(that.expenseEntryId);
                yiGrid.init(gridId, {
                    rownumbers: false,
                    data: yiGrid.extractEntry(that.opData, that.expenseEntryId),
                    colModel: [
                        {
                            label: "费用项目", name: "fexpenseitemid_name", width: 150, editable: true, align: "left",
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.bdCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.bdCE(that, this, val, opt, function (records) {

                                    });
                                }
                            }
                        },
                        {
                            label: "金额", name: "famount_ee", width: 70, editable: true, align: "right",
                            editrules: { number: true, minValue: 0 },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 34,
                                custom_value: yiGrid.nbCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.nbCE(val, opt, this).on('change', function (e) {
                                        //表达式计算
                                        listen.Expression.Execute({
                                            name: opt.name,
                                            tname: that.expenseEntryId,
                                            key: "id",
                                            value: opt.rowId,
                                            val: $(this).val(),
                                            setVal: listen.setValEvent,
                                            getVal: listen.getValEvent
                                        });
                                    });
                                }
                            },
                            formatter: yiGrid.nbFmt,
                            unformat: yiGrid.nbUnFmt
                        },
                        {
                            label: "备注", name: "fdescription_ee", width: 135, editable: true, align: "left",
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.strCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.strCE(val, opt, this);
                                }
                            }
                        }
                    ],
                    onAfterDeleting: function (gid, rowId) {

                    }
                });
            };

            //初始化套件下单明细
            that.initSuitEntry = function () {
                var gridId = that.getJqGridId(that.suitEntryId);
                yiGrid.init(gridId, {
                    data: yiGrid.extractEntry(that.opData, that.suitEntryId),
                    colModel: [
                        {
                            label: "套件名称", name: "fsuitid_es_name", width: 271, editable: true, align: "left", fixed: true,
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.bdCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.bdCE(that, this, val, opt, function (records) {

                                    });
                                }
                            }
                        },
                        {
                            label: "单位", name: "funitid_es_name", width: 95, editable: false, align: "left", fixed: true
                        },
                        {
                            label: "数量", name: "fqty_es", width: 80, editable: true, align: "right", fixed: true,
                            editrules: { integer: true, minValue: 0, maxValue: 2147483647 },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 9,
                                custom_value: yiGrid.intCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.intCE(val, opt, this).on('change', function (e) {
                                        //拆分套件
                                        splitSuit(gridId, opt.rowId);
                                    });
                                }
                            },
                            formatter: yiGrid.intFmt,
                            unformat: yiGrid.intUnFmt
                        }
                    ]
                });
            };

            //初始化商品明细
            that.initProductEntry = function () {
                var gridId = that.getJqGridId(that.productEntryId);
                var datas = [
                    { "id": "157093280797036544", "FSeq": 1, "flevel": 0, "fexpanded": true, "fisleaf": false, "floaded": true, "fsuitid": "148903106325909504", "fsuitid_name": "客厅沙发套装/测试", "fsuitid_number": " ", "fproductid": "149463714913980416", "fproductid_name": "椭圆桌", "fproductid_number": "123", "funitid": "149551806094118912", "funitid_name": "秒", "funitid_number": "s", "fnormsid": "148926532285501440", "fnormsid_name": "60*65", "fnormsid_number": "GG0001", "fmaterialid": "148377779979816960", "fmaterialid_name": "金丝楠木", "fmaterialid_number": "CZ0001", "fcolorid": "148926936628989952", "fcolorid_name": "褐黑色", "fcolorid_number": "YS0001", "fcustomattr": "测试", "flength": 0.0, "fwidth": 0.0, "fthick": 0.0, "fnsc": 0.0, "fareaunit": "", "fareaunit_name": "", "fareaunit_number": "", "farea": 0.0, "fisgift": false, "fqty": 0.0, "fprice": 0.0, "famount": 0.0, "fdistrate_e": 0.0, "fdistamount_e": 0.0, "ffavoramount_e": 0.0, "fdealprice": 0.0, "fdealamount_e": 0.0, "fdescription_e": "", "fparentid": null },
                    { "id": "157093280797036545", "FSeq": 2, "flevel": 1, "fexpanded": false, "fisleaf": true, "floaded": true, "fsuitid": "148903106325909504", "fsuitid_name": "客厅沙发套装/测试", "fsuitid_number": " ", "fproductid": "149463714913980416", "fproductid_name": "椭圆桌", "fproductid_number": "123", "funitid": "149551806094118912", "funitid_name": "秒", "funitid_number": "s", "fnormsid": "148926532285501440", "fnormsid_name": "60*65", "fnormsid_number": "GG0001", "fmaterialid": "148377779979816960", "fmaterialid_name": "金丝楠木", "fmaterialid_number": "CZ0001", "fcolorid": "148926936628989952", "fcolorid_name": "褐黑色", "fcolorid_number": "YS0001", "fcustomattr": "测试", "flength": 0.0, "fwidth": 0.0, "fthick": 0.0, "fnsc": 0.0, "fareaunit": "", "fareaunit_name": "", "fareaunit_number": "", "farea": 0.0, "fisgift": false, "fqty": 0.0, "fprice": 0.0, "famount": 0.0, "fdistrate_e": 0.0, "fdistamount_e": 0.0, "ffavoramount_e": 0.0, "fdealprice": 0.0, "fdealamount_e": 0.0, "fdescription_e": "", "fparentid": "157093280797036544" },
                    { "id": "157093280797036546", "FSeq": 3, "flevel": 1, "fexpanded": false, "fisleaf": true, "floaded": true, "fsuitid": "148903106325909504", "fsuitid_name": "客厅沙发套装/测试", "fsuitid_number": " ", "fproductid": "149463714913980416", "fproductid_name": "椭圆桌", "fproductid_number": "123", "funitid": "149551806094118912", "funitid_name": "秒", "funitid_number": "s", "fnormsid": "148926532285501440", "fnormsid_name": "60*65", "fnormsid_number": "GG0001", "fmaterialid": "148377779979816960", "fmaterialid_name": "金丝楠木", "fmaterialid_number": "CZ0001", "fcolorid": "148926936628989952", "fcolorid_name": "褐黑色", "fcolorid_number": "YS0001", "fcustomattr": "测试", "flength": 0.0, "fwidth": 0.0, "fthick": 0.0, "fnsc": 0.0, "fareaunit": "", "fareaunit_name": "", "fareaunit_number": "", "farea": 0.0, "fisgift": false, "fqty": 0.0, "fprice": 0.0, "famount": 0.0, "fdistrate_e": 0.0, "fdistamount_e": 0.0, "ffavoramount_e": 0.0, "fdealprice": 0.0, "fdealamount_e": 0.0, "fdescription_e": "", "fparentid": "157093280797036544" },
                    { "id": "157093280797036547", "FSeq": 4, "flevel": 1, "fexpanded": false, "fisleaf": true, "floaded": true, "fsuitid": "148903106325909504", "fsuitid_name": "客厅沙发套装/测试", "fsuitid_number": " ", "fproductid": "149463714913980416", "fproductid_name": "椭圆桌", "fproductid_number": "123", "funitid": "149551806094118912", "funitid_name": "秒", "funitid_number": "s", "fnormsid": "148926532285501440", "fnormsid_name": "60*65", "fnormsid_number": "GG0001", "fmaterialid": "148377779979816960", "fmaterialid_name": "金丝楠木", "fmaterialid_number": "CZ0001", "fcolorid": "148926936628989952", "fcolorid_name": "褐黑色", "fcolorid_number": "YS0001", "fcustomattr": "测试", "flength": 0.0, "fwidth": 0.0, "fthick": 0.0, "fnsc": 0.0, "fareaunit": "", "fareaunit_name": "", "fareaunit_number": "", "farea": 0.0, "fisgift": false, "fqty": 0.0, "fprice": 0.0, "famount": 0.0, "fdistrate_e": 0.0, "fdistamount_e": 0.0, "ffavoramount_e": 0.0, "fdealprice": 0.0, "fdealamount_e": 0.0, "fdescription_e": "", "fparentid": "157093280797036544" }
                ];
                yiGrid.init(gridId, {
                    data: yiGrid.extractEntry(that.opData, that.productEntryId),
                    colModel: [
                        {
                            label: "归属套件", name: "fsuitid_name", width: 100, editable: true, align: "left", fixed: true,
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.bdCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.bdCE(that, this, val, opt, function (records) {

                                    });
                                }
                            }
                        },
                        {
                            label: "商品名称", name: "fproductid_name", width: 120, editable: true, align: "left", fixed: true,
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.bdCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.bdCE(that, this, val, opt, function (records) {

                                    });
                                }
                            }
                        },
                        {
                            label: "单位", name: "funitid_name", width: 70, editable: true, align: "left", fixed: true,
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.bdCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.bdCE(that, this, val, opt, function (records) {

                                    });
                                }
                            }
                        },
                        {
                            label: "规格", name: "fnormsid_name", width: 70, editable: true, align: "left", fixed: true,
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.bdCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.bdCE(that, this, val, opt, function (records) {

                                    });
                                }
                            }
                        },
                        {
                            label: "材质", name: "fmaterialid_name", width: 70, editable: true, align: "left", fixed: true,
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.bdCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.bdCE(that, this, val, opt, function (records) {

                                    });
                                }
                            }
                        },
                        {
                            label: "颜色", name: "fcolorid_name", width: 70, editable: true, align: "left", fixed: true,
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.bdCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.bdCE(that, this, val, opt, function (records) {

                                    });
                                }
                            }
                        },
                        {
                            label: "定制属性", name: "fcustomattr", width: 100, editable: true, align: "left", fixed: true,
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.strCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.strCE(val, opt, this);
                                }
                            }
                        },
                        {
                            label: "长", name: "flength", width: 55, editable: true, align: "right", fixed: true,
                            editrules: { integer: true, minValue: 0, maxValue: 2147483647 },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 9,
                                custom_value: yiGrid.intCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.intCE(val, opt, this).on('change', function (e) {

                                    });
                                }
                            },
                            formatter: yiGrid.intFmt,
                            unformat: yiGrid.intUnFmt
                        },
                        {
                            label: "宽", name: "fwidth", width: 55, editable: true, align: "right", fixed: true,
                            editrules: { integer: true, minValue: 0, maxValue: 2147483647 },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 9,
                                custom_value: yiGrid.intCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.intCE(val, opt, this).on('change', function (e) {

                                    });
                                }
                            },
                            formatter: yiGrid.intFmt,
                            unformat: yiGrid.intUnFmt
                        },
                        {
                            label: "厚", name: "fthick", width: 55, editable: true, align: "right", fixed: true,
                            editrules: { integer: true, minValue: 0, maxValue: 2147483647 },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 9,
                                custom_value: yiGrid.intCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.intCE(val, opt, this).on('change', function (e) {

                                    });
                                }
                            },
                            formatter: yiGrid.intFmt,
                            unformat: yiGrid.intUnFmt
                        },
                        {
                            label: "非标系数", name: "fnsc", width: 80, editable: true, align: "right", fixed: true,
                            editrules: { integer: true, minValue: 0, maxValue: 2147483647 },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 9,
                                custom_value: yiGrid.intCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.intCE(val, opt, this).on('change', function (e) {
                                        //表达式计算
                                        listen.Expression.Execute({
                                            name: opt.name,
                                            tname: that.productEntryId,
                                            key: "id",
                                            value: opt.rowId,
                                            val: $(this).val(),
                                            setVal: listen.setValEvent,
                                            getVal: listen.getValEvent
                                        });
                                    });
                                }
                            },
                            formatter: yiGrid.intFmt,
                            unformat: yiGrid.intUnFmt
                        },
                        {
                            label: "面积单位", name: "fareaunit_name", width: 80, editable: true, align: "left", fixed: true,
                            edittype: 'select',
                            editoptions: {
                                dataInit: function (ele, opt) {
                                    yiGrid.adDataInit(this, ele, opt, function (e) {

                                    });
                                }
                            }
                        },
                        {
                            label: "面积", name: "farea", width: 55, editable: true, align: "right", fixed: true,
                            editrules: { integer: true, minValue: 0, maxValue: 2147483647 },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 9,
                                custom_value: yiGrid.intCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.intCE(val, opt, this).on('change', function (e) {

                                    });
                                }
                            },
                            formatter: yiGrid.intFmt,
                            unformat: yiGrid.intUnFmt
                        },
                        {
                            label: "赠品", name: "fisgift", width: 55, editable: true, align: "center", fixed: true,
                            formatter: 'checkbox',
                            edittype: 'custom',
                            editoptions: {
                                custom_value: yiGrid.boolCV,
                                custom_element: function (val, opt) {
                                    var gird = this;
                                    return yiGrid.boolCE(val, opt, this).on('change', function (e) {
                                        ////如果是赠品，则清空价格
                                        //var isGift = $(this).is(':checked');
                                        //if (isGift) {
                                        //    yiGrid.iptVal(gridId, opt.rowId, 'fprice', '');
                                        //    yiGrid.fdVal(gird, opt.rowId, 'fprice', '');
                                        //}
                                        ////计算财务信息（计算当前明细行相关字段）
                                        //calculatePE(gridId, opt.rowId);
                                    });
                                }
                            }
                        },
                        {
                            label: "数量", name: "fqty", width: 55, editable: true, align: "right", fixed: true,
                            editrules: { integer: true, minValue: 0, maxValue: 2147483647 },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 9,
                                custom_value: yiGrid.intCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.intCE(val, opt, this).on('change', function (e) {
                                        //表达式计算
                                        listen.Expression.Execute({
                                            name: opt.name,
                                            tname: that.productEntryId,
                                            key: "id",
                                            value: opt.rowId,
                                            val: $(this).val(),
                                            setVal: listen.setValEvent,
                                            getVal: listen.getValEvent
                                        });

                                        //计算财务信息（计算当前明细行相关字段）
                                        //calculatePE(gridId, opt.rowId);
                                    });
                                }
                            },
                            formatter: yiGrid.intFmt,
                            unformat: yiGrid.intUnFmt
                        },
                        {
                            label: "单价", name: "fprice", width: 100, editable: true, align: "right", fixed: true,
                            editrules: { number: true, minValue: 0 },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 34,
                                custom_value: yiGrid.nbCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.nbCE(val, opt, this).on('change', function (e) {
                                        //表达式计算
                                        listen.Expression.Execute({
                                            name: opt.name,
                                            tname: that.productEntryId,
                                            key: "id",
                                            value: opt.rowId,
                                            val: $(this).val(),
                                            setVal: listen.setValEvent,
                                            getVal: listen.getValEvent
                                        });

                                        //计算财务信息（计算当前明细行相关字段）
                                        //calculatePE(gridId, opt.rowId);
                                    });
                                }
                            },
                            formatter: numFmt,
                            unformat: yiGrid.nbUnFmt
                        },
                        {
                            label: "金额", name: "famount", width: 100, editable: false, align: "right", fixed: true,
                            formatter: numFmt,
                            unformat: yiGrid.nbUnFmt
                        },
                        {
                            label: "折扣率", name: "fdistrate_e", width: 80, editable: true, align: "right", fixed: true,
                            editrules: { number: true, minValue: 0 },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 34,
                                custom_value: yiGrid.nbCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.nbCE(val, opt, this).on('change', function (e) {
                                        //表达式计算
                                        listen.Expression.Execute({
                                            name: opt.name,
                                            tname: that.productEntryId,
                                            key: "id",
                                            value: opt.rowId,
                                            val: $(this).val(),
                                            setVal: listen.setValEvent,
                                            getVal: listen.getValEvent
                                        });
                                    });
                                }
                            },
                            formatter: numFmt,
                            unformat: yiGrid.nbUnFmt
                        },
                        {
                            label: "折扣额", name: "fdistamount_e", width: 100, editable: false, align: "right", fixed: true,
                            formatter: numFmt,
                            unformat: yiGrid.nbUnFmt
                        },
                        {
                            label: "优惠金额", name: "ffavoramount_e", width: 100, editable: false, align: "right", fixed: true,
                            formatter: numFmt,
                            unformat: yiGrid.nbUnFmt
                        },
                        {
                            label: "折后单价", name: "fdealprice", width: 100, editable: false, align: "right", fixed: true,
                            formatter: numFmt,
                            unformat: yiGrid.nbUnFmt
                        },
                        {
                            label: "折后金额", name: "fdealamount_e", width: 100, editable: false, align: "right", fixed: true,
                            formatter: numFmt,
                            unformat: yiGrid.nbUnFmt
                        },
                        {
                            label: "备注", name: "fdescription_e", width: 100, editable: true, align: "left", fixed: true,
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 50,
                                custom_value: yiGrid.strCV,
                                custom_element: function (val, opt) {
                                    return yiGrid.strCE(val, opt, this);
                                }
                            }
                        }
                    ],
                    onAfterDeleting: function (gid, rowId) {
                        ////计算财务信息
                        //calculatePH();
                    }
                });

                //异步加载表格辅助资料字段数据源，参数：1页面对象，2表格控件ID，3辅助资料字段名称（可配置一次性加载多个辅助资料）
                yiGrid.setAdDataSource(that, gridId, ['fareaunit_name']);
            };

            //数字字段格式化函数
            function numFmt(cv, opt, ro) {
                return cv <= 0 ? '' : yiMath.toMoneyFormat(cv, 6, 0);
            }

            //拆分套件
            function splitSuit(gid, rowId) {
                //套件ID
                var suitId = yiGrid.bdIptVal(gid, rowId, 'fsuitid_es_name');
                yiAjax.p('/bill/ydj_suit?operationno=querywhole', { selectedRows: [{ PKValue: suitId }] },
                    function (r) {
                        var or = r && r.operationResult ? r.operationResult : null,
                            srvData = or ? or.srvData : null,
                            data = srvData ? srvData.data : null,
                            billData = data ? data.billData : null,
                            uidata = billData ? billData.uidata : null;
                        if (!uidata) { return; }

                    }
                );
            }

            //计算负责人信息
            function calculateDE() {
                var gid = that.getJqGridId(that.dutyEntryId), ds = yiGrid.getData(gid),
                dealamount_h = yiMath.toNumber(that.ivbn('fdealamount_h'));
                if (!ds) { return; }
                for (var i = 0, l = ds.length; i < l; i++) {
                    var ratio = yiMath.toNumber(ds[i].fratio);
                    if (ratio <= 0) {
                        continue;
                    }
                    ds[i].famount_ed = yiMath.toDecimal(dealamount_h * ratio, 6);
                }
                //重新设置表格数据源
                $('#' + gid).jqGrid('setGridParam', { data: ds }).trigger('reloadGrid');
            }

            //计算费用信息：费用明细更改时，计算（费用合计，未收费用）字段值
            function calculateEE(gid) {
                //费用明细表格数据源
                var ds = yiGrid.getData(gid),
                recExpense = yiMath.toNumber(that.ivbn('frecexpense')),
                expense = 0;
                if (ds) {
                    for (var i = 0, l = ds.length; i < l; i++) {
                        expense += yiMath.toNumber(ds[i].famount_ee);
                    }
                }
                //费用合计 = 费用项目金额汇总
                that.ivbn('fexpense', yiMath.toDecimal(expense, 6));
                //未收费用 = 费用合计 - 已收费用
                that.ivbn('funrecexpense', yiMath.toDecimal(expense - recExpense, 6));
            }

            //计算财务信息：商品明细更改时，计算（金额，折扣额，折后单价，折后金额）字段值
            function calculatePE(gid, rowId) {
                //表格控件
                var $gird = $('#' + gid),
                //数量
                qty = yiMath.toNumber(yiGrid.iptVal(gid, rowId, 'fqty')),
                //单价
                price = yiMath.toNumber(yiGrid.iptVal(gid, rowId, 'fprice')),

                //第一步：先计算当前行的金额
                amount = qty * price;
                $gird.jqGrid('setRowData', rowId, { 'famount': yiMath.toDecimal(amount, 6) });

                //第二步：计算财务信息
                calculatePH(rowId);

                //第三步：计算当前行的（折扣额，折后单价，折后金额，折扣率）
                var faceAmount = yiMath.toNumber(that.ivbn('ffaceamount')),
                distAmount_h = yiMath.toNumber(that.ivbn('fdistamount_h')),
                //折扣额 =（折扣金额 *（金额 / 面价金额））/ 数量
                distAmount = faceAmount > 0 && qty > 0 ? (distAmount_h * (amount / faceAmount)) / qty : 0,
                //折后单价 = 单价 - 折扣额
                dealPrice = price - distAmount,
                //折后金额 = 数量 * 折后单价
                dealAmount = qty * dealPrice,
                //折扣率 = 折后单价 / 单价
                distRate = price > 0 ? dealPrice / price : 1;

                //更新计算结果
                $gird.jqGrid('setRowData', rowId, {
                    'fdistrate_e': yiMath.toDecimal(distRate, 6),
                    'fdistamount_e': yiMath.toDecimal(distAmount, 6),
                    'fdealprice': yiMath.toDecimal(dealPrice, 6),
                    'fdealamount_e': yiMath.toDecimal(dealAmount, 6)
                });
            }

            //计算财务信息：商品明细更改时
            function calculatePH() {
                //商品明细表格数据源
                var ds = yiGrid.getData(that.getJqGridId(that.productEntryId)),
                    faceAmount = 0,
                    receivable = yiMath.toNumber(that.ivbn('freceivable')),
                    refund = yiMath.toNumber(that.ivbn('frefund')),
                    saleDiscount = yiMath.toNumber(that.ivbn('fsalediscount')),
                    minusCash = yiMath.toNumber(that.ivbn('fminuscash')),
                    cashDiscount = yiMath.toNumber(that.ivbn('fcashdiscount'));
                if (ds) {
                    for (var i = 0, l = ds.length; i < l; i++) {
                        //汇总金额
                        faceAmount += yiMath.toNumber(ds[i].famount);
                    }
                }
                //如果没有输入导购折扣，则默认不打折
                saleDiscount = saleDiscount <= 0 ? 1 : saleDiscount;

                //折后金额 =（面价金额 * 导购折扣）- 满额促销.减现金 - 现金折让
                var dealAmount = (faceAmount * saleDiscount) - minusCash - cashDiscount,
                //折扣额 = 面价金额 - 折后金额
                distAmount = faceAmount - dealAmount,
                //折扣率 = 折后金额 / 面价金额
                distRate = faceAmount > 0 ? dealAmount / faceAmount : 1,
                //未收金额 = 折后金额 - 已收金额 - 退款金额
                unReceived = dealAmount - receivable - refund;

                //更新计算结果
                that.ivbn('ffaceamount', yiMath.toDecimal(faceAmount, 6));
                that.ivbn('fdistamount_h', yiMath.toDecimal(distAmount, 6));
                that.ivbn('fdealamount_h', yiMath.toDecimal(dealAmount, 6));
                that.ivbn('fdistrate_h', yiMath.toDecimal(distRate, 6));
                that.ivbn('funreceived', yiMath.toDecimal(unReceived, 6));

                //计算负责人信息：因为负责人的金额受“折后金额”影响，所以在“折后金额”变化是，应重新计算负责人金额
                calculateDE();
            }

            //计算整个商品明细：优惠信息更改时
            function calculatePES() {
                //商品明细表格数据源
                var gid = that.getJqGridId(that.productEntryId), ds = yiGrid.getData(gid),
                faceAmount = yiMath.toNumber(that.ivbn('ffaceamount')),
                distAmount_h = yiMath.toNumber(that.ivbn('fdistamount_h'));
                if (faceAmount <= 0 && !ds) { return; }
                for (var i = 0, l = ds.length; i < l; i++) {
                    //数量
                    var qty = yiMath.toNumber(ds[i].fqty),
                    //单价
                    price = yiMath.toNumber(ds[i].fprice);
                    if (qty <= 0 || price <= 0) {
                        continue;
                    }
                    //金额
                    var amount = yiMath.toNumber(ds[i].famount),
                    //折扣额 =（折扣金额 *（金额 / 面价金额））/ 数量
                    distAmount = (distAmount_h * (amount / faceAmount)) / qty,
                    //折后单价 = 单价 - 折扣额
                    dealPrice = price - distAmount,
                    //折后金额 = 数量 * 折后单价
                    dealAmount = qty * dealPrice,
                    //折扣率 = 折后单价 / 单价
                    distRate = dealPrice / price;
                    //更新计算结果
                    ds[i].fdistrate_e = yiMath.toDecimal(distRate, 6);
                    ds[i].fdistamount_e = yiMath.toDecimal(distAmount, 6);
                    ds[i].fdealprice = yiMath.toDecimal(dealPrice, 6);
                    ds[i].fdealamount_e = yiMath.toDecimal(dealAmount, 6);
                }
                //重新设置表格数据源
                $('#' + gid).jqGrid('setGridParam', { data: ds }).trigger('reloadGrid');
            }

            //自身特有的操作
            that.onMenuItemClick = function (menuItem) {

                //操作类型
                var opcode = menuItem.attr('opcode').toLowerCase();
                switch (opcode) {
                    case 'task':
                        //创建任务
                        return true;
                    case 'subjoin':
                        //增补
                        return true;
                }
            };

            //处理服务端返回的数据
            that.onProcessSrvData = function (params) {

            };

            /********************************************** 各个子业务对象逻辑代码结束 **********************************************/
        };
        __extends(_child, _super);
        return _child;
    })(BasePage);
    window.ydj_order = window.ydj_order || ydj_order;
})();

