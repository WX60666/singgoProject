/// <reference path="/fw/js/basepage.js" />
//@ sourceURL=/fw/js/sec/sec_user.js
; (function () {
    var sec_user = (function (_super) {
        var _child = function (args) {
            var that = this;
            _super.call(that, args);

            /********************************************** 各个子业务对象逻辑代码开始 **********************************************/

            //页面地址（由各个子业务对象的 js 初始化）
            that.pageFile = '/views/sec/sec_user.html';

            //初始化
            that.init = function () {

                //初始化
                that.initBill(that.opData);

                //初始化明细
                that.initEntry(that.opData);

                //自身特有的明细展示
                that.setEntrys(that.opData);
            };

            //自身特有的明细展示
            that.setEntrys = function (opData) {
                if (opData && opData.billData && opData.billData.uidata) {
                    //设置明细......
                }
            };

            //自身特有的明细打包
            that.getEntrys = function (opData) {

                //明细对象（每个明细作为明细对象的一个属性存在，属性名称与后端 mdl 文件中定义的一致）
                var entry = {};

                //打包明细
                //entry.fentry1 = [{}, {}, {}];
                //entry.fentry2 = [{}, {}, {}];
                //等等......

                //返回该明细对象
                return entry;
            };

            //初始化明细
            that.initEntry = function (opData) {
                //表格ID：ftestentry1 为 mdl 文件中的 entryId
                var entryId = 'ftestentry1', gridId = that.getJqGridId(entryId);
                //初始化明细表格
                yiGrid.init(gridId, {
                    //数据源
                    data: yiGrid.extractEntry(opData, entryId),
                    //定义表格列
                    colModel: [
                        {
                            label: "基础资料", name: "froleid_name", width: 150, editable: true, align: "left", fixed: true,
                            edittype: 'custom',
                            editoptions: {
                                custom_value: yiGrid.bdCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.bdCustomElement(that, this, val, opt, function (records) {
                                        //选择基础资料的时候，将进入该回调函数
                                        //参数“records”为当前选中项信息，是一个数组（可能选择多条记录）
                                        //如果参数“records”不存在，则说明是用户手动清楚控件值，此时也将进入该回调函数，可根据此参数来做相应处理
                                        //比如：
                                        if (records) {
                                            //存在的情况下要做的事情
                                        } else {
                                            //不存在的情况下要做的事情
                                        }
                                    });
                                }
                            }
                        },
                        {
                            label: "辅助资料", name: "fenum_name", width: 80, editable: true, align: "left", fixed: true,
                            edittype: 'select',
                            editoptions: {
                                dataInit: function (ele, opt) {
                                    yiGrid.adDataInit(this, ele, opt, function (e) {
                                        //选择下拉框值的时候，将进入该回调函数，参数“e”为当前选中项信息
                                        //当前选中项的值
                                        //var v = e.val;
                                        //现在的选中项对象：包括 id 和 text
                                        //var newOpt = e.added;
                                        //之前的选择项对象：包括 id 和 text
                                        //var oldOpt = e.removed;
                                    });
                                }
                            }
                        },
                        {
                            label: "字符串", name: "ftext", width: 100, editable: true, align: "left", fixed: true,
                            editrules: { required: false },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 100,
                                custom_value: yiGrid.strCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.strCustomElement(val, opt).on('change', function (e) {
                                        //文本框值改变时，将进入该回调函数，参数“e”为当前事件对象
                                        //改变后的值
                                        //var v = $(this).val();
                                    });
                                }
                            }
                        },
                        {
                            label: "数字", name: "fdecimal", width: 120, editable: true, align: "right", fixed: true,
                            editrules: { required: false, number: true, minValue: 0 },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 34,
                                custom_value: yiGrid.numberCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.numberCustomElement(val, opt).on('change', function (e) {
                                        //文本框值改变时，将进入该回调函数，参数“e”为当前事件对象
                                        //改变后的值
                                        //var v = $(this).val();
                                    });
                                }
                            },
                            formatter: yiGrid.numberFormatter,
                            unformat: yiGrid.numberUnFormat
                        },
                        {
                            label: "整数", name: "finteger", width: 120, editable: true, align: "right", fixed: true,
                            editrules: {
                                required: false, integer: true, minValue: -2147483648, maxValue: 2147483647,
                                //自定义验证规则（可选）
                                custom: true, custom_func: function (value, colName) {
                                    if (value < 0 || value > 120) {
                                        return [false, colName + ': 请输入 0 到 120 之间的整数'];
                                    } else {
                                        return [true, ''];
                                    }
                                }
                            },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 9,
                                custom_value: yiGrid.intCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.intCustomElement(val, opt).on('change', function (e) {
                                        //文本框值改变时，将进入该回调函数，参数“e”为当前事件对象
                                        //改变后的值
                                        //var v = $(this).val();
                                    });
                                }
                            },
                            formatter: yiGrid.intFormatter,
                            unformat: yiGrid.intUnFormat
                        },
                        {
                            label: "日期", name: "fdate", width: 100, editable: true, align: "left", fixed: true,
                            editrules: { required: false, date: true },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 12,
                                custom_value: yiGrid.dateCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.dateCustomElement(val, opt).on('changeDate', function (e) {
                                        //当在日期面板选中一个日期后触发此事件，参数为“选择的日期”和“当前日期插件的实例”。 
                                        //当前选择的日期
                                        //var v = e.date;
                                    });
                                }
                            },
                            formatter: yiGrid.dateFormatter
                        },
                        {
                            label: "布尔", name: "fboolean", width: 40, editable: true, align: "center", fixed: true,
                            formatter: 'checkbox',
                            edittype: 'custom',
                            editoptions: {
                                custom_value: yiGrid.boolCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.boolCustomElement(val, opt).on('change', function (e) {
                                        //勾选复选框时，将进入该回调函数，参数“e”为当前事件对象
                                        //复选框的选中状态：true 或 false
                                        //var v = $(this).prop('checked');
                                    });
                                }
                            }
                        }
                    ]
                });

                //异步加载表格辅助资料字段数据源，参数：1页面对象，2表格控件ID，3辅助资料字段名称（可配置一次性加载多个辅助资料）
                yiGrid.setAdDataSource(that, gridId, ['fenum_name']);
            };

            //选择客户基础资料后要触发的事件（需要在 html 控件元素中配置 onSelect 属性为 当前要处理的事件名称）
            that.onAfterSelectCustomer = function (record) {

                // record 为当前选择的基础资料对象，对象中暂时只包括 fbillhead_id 主键ID 和 fname 名称）

                //alert('主键ID：' + record.fbillhead_id + '---名称：' + record.fname);
            };

            //自身特有的操作
            that.onMenuItemClick = function (menuItem) {

                ////操作类型
                //var opcode = menuItem.attr('opcode').toLowerCase();
                //if (opcode === 'new') {

                //    //此处编写该操作的逻辑代码...
                //    alert('该操作我自己处理！');

                //    //返回 true 告诉 BasePage 该操作由我自己处理
                //    return true;
                //}
            };

            //处理服务端返回的数据
            that.onProcessSrvData = function (params) {

            };

            /********************************************** 各个子业务对象逻辑代码结束 **********************************************/
        };
        __extends(_child, _super);
        return _child;
    })(BasePage);
    window.sec_user = window.sec_user || sec_user;
})();