
/// <reference path="/fw/js/basepage.js" />
//客流客户-客户 
; (function () {
    var ydj_customer = (function (_super) {
        var _child = function (args) {
            var that = this;
            _super.call(that, args);

            /********************************************** 各个子业务对象逻辑代码开始 **********************************************/

            //页面地址（由各个子业务对象的 js 初始化）
            that.pageFile = '/views/ydj/ydj_customer.html';
			//量尺明细ID
            that.FscaleId = 'fscaleentry';
            //执行明细ID（改明细只是用于前端显示，不参与后端数据库保存）
            that.FexecutId = 'fdesignentry';
            //合同下单明细ID
            that.FcontractId = 'Fcontract';
            //会员积分明细ID
            that.FmemberpointsId = 'Fmemberpoints';
            //历史消息明细ID
            that.FhistorymessageId = 'Fhistorymessage';
            
            //初始化
            that.init = function () {

                //初始化
                that.initBill(args.opData);
				//调整弹出框和发送短信按钮
				that.ininfunction();
                //初始化量尺表单
                that.initFscaleId(args.opData);
                //初始化执行表单  
                //that.initFexecutId(args.opData);
                //that.queryData();
				//经销商级别显示隐藏
            	that.showDealerlevel();
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
            
            
            
            //是否有经销商
            that.showDealerlevel=function(){
            	var isDealer = that.gebn('fisdealer').is(':checked');
                if (!isDealer) {
                    noDealer();
                    return;
                }else{
                	hasDealer();
                }
                
            	function noDealer() {
                    $('#fdealerlevel', that.pageSelector).hide();
                }
            	function hasDealer() {
                    $('#fdealerlevel', that.pageSelector).show();
                }
            }
            
            //调整弹出框
            that.ininfunction = function () {
            	//发短信按钮
            	$('#send-message',args.pageSelector).on('click',function(){
            		console.log('短信按钮');
            	})	
            	//指定按钮
            	$('#appoint',args.pageSelector).on('click',function(){
            		console.log('指定按钮');
            		yiAjax.gf('/views/ydj/ydj_customerpoint.html', {}, function (html) {
            			
                        yiDialog.d({
                            id: 'ydj_customerpoint',
                            type: 1,
                            resize: false,
                            content: html,
                            title: '设计师指定',
                            area: '650px',
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                            	//console.log('调整');
                            	//发送数据后，关闭邮件窗口
                                layer.close(index);
                            },
                            success: function (layero, index) {
                            	//console.log('回调函数');
                            	//因为该弹出框是新加载的,所以如果弹出框有控件的话,就要重新初始化
            					//日期控件
							    $('.date-picker', '#ydj_customerpoint').datepicker();
							
							    //查找所有 type='lookup' 的 input 元素，并将其初始化为一个基础资料控件
							    $('input[type="lookup"]', '#ydj_customerpoint').bdSelect({
							        domainType: args.domainType,
							        formId: args.formId,
							        pageId: args.pageId,
							        page: this
							    });
                            }
                        });
                    });
            	})	
            	//弹出框按钮
            	$('#adjustTab',args.pageSelector).on('click',function(){
            		yiAjax.gf('/views/ydj/ydj_customeradjust.html', {}, function (html) {
            			
                        yiDialog.d({
                            id: 'ydj_adjust',
                            type: 1,
                            resize: false,
                            content: html,
                            title: '等级调整',
                            area: '650px',
                            btn: ['调整', '取消'],
                            yes: function (index, layero) {
                            	//console.log('调整');
                            	//发送数据后，关闭邮件窗口
                                layer.close(index);
                            },
                            success: function (layero, index) {
                            	//console.log('回调函数');
                            	var $result = $('#test').val('测试内容填充。');
            					console.log($result);
                            }
                        });
                    });
            	})
            	//查询过往记录
            	$(document).on('click','#ydj_adjust #searchResort',function(){
            		
            		yiAjax.gf('/views/ydj/ydj_cumsearch.html', {}, function (html) {
//          			var $result = $(html).find('table#show-test').empty();
//          			console.log($result);
                        yiDialog.d({
                            id: 'ydj_search',
                            type: 1,
                            resize: false,
                            content: html,
                            title: '调整记录',
                            area: '650px',
                            btn: [ '取消'],
                            yes: function (index, layero) {
                            	//发送数据后，关闭邮件窗口
                                layer.close(index);
                            },
                            success: function (layero, index) {
                            	console.log('回调函数');
                            	
                            }
                        });
                    });
                    
            	})
            }
			//初始化量尺表单
            that.initFscaleId = function (opData) {
            	
				//表格ID
                var gridId = that.getJqGridId(that.FscaleId);
                //初始化明细表格
                yiGrid.init(gridId, {
                    //caption: '其他费用',
                    //数据源
                    data: yiGrid.extractEntry(opData, that.expenseEntryId),
                    //定义表格列
                    colModel: [
                        {
                            label: "执行人", name: "fexecutor_es", width: 150, editable: true, align: "left", fixed: true,
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
                            label: "创建时间", name: "fcreatedate_es", width: 140, editable: true, align: "left", fixed: true,
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
                            label: "截止时间", name: "fexpiredate_es", width: 140, editable: true, align: "left", fixed: true,
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
                            label: "内容", name: "fcontent_es", width: 250, editable: true, align: "left", fixed: true,
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
                            label: "状态", name: "fstatus_es", width: 128, editable: true, align: "center", fixed: true,
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
                        }
                    ]
                    
                });
                yiGrid.setAdDataSource(that, gridId, ['fstatus_es']);
            };
            
            //初始化执行表单
            that.initFexecutId = function (opData) {
				//表格ID
                var gridId = that.getJqGridId(that.FexecutId);
                //初始化明细表格
                yiGrid.init(gridId, {
                    //caption: '其他费用',
                    //数据源
                    data: yiGrid.extractEntry(opData, that.expenseEntryId),
                    //定义表格列
                    colModel: [
                        {
                            label: "执行人", name: "fexecutor", width: 150, editable: true, align: "left", fixed: true,
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
                            label: "创建时间", name: "fcreationtime", width: 140, editable: true, align: "left", fixed: true,
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
                            label: "截止时间", name: "fcutofftime", width: 140, editable: true, align: "left", fixed: true,
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
                            label: "内容", name: "fcontent", width: 250, editable: true, align: "left", fixed: true,
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
                            label: "状态", name: "fstatus_e2", width: 128, editable: true, align: "center", fixed: true,
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
                        }
                    ]
                    
                });
                //yiGrid.setAdDataSource(that, gridId, ['fstatus_e2']);
            };
            
            that.queryData = function () {
                var url = '/dynamic/ydj_customer?operationno=save';
				
                yiAjax.p(url, null,
					
		            function (r) {
		                //执行回调函数
		                var res = r.operationResult.srvData;

		                console.log(res)
		            },
		            function (m) {
		                //提示错误信息
		                yiDialog.m('显示页面出错！');
		            }
		        );

            };

            /********************************************** 各个子业务对象逻辑代码结束 **********************************************/
        };
        __extends(_child, _super);
        return _child;
    })(BasePage);
    window.ydj_customer = window.ydj_customer || ydj_customer;
})();