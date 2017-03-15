/// <reference path="/fw/js/basepage.js" />
; (function () {
    var ydj_payment = (function (_super) {
        var _child = function (args) {
            var that = this;
            _super.call(that, args);

            /********************************************** 各个子业务对象逻辑代码开始 **********************************************/

            //页面地址（由各个子业务对象的 js 初始化）
            that.pageFile = '/views/ydj/ydj_payment.html';

            //初始化
            that.init = function () {

                //初始化
                that.initBill(args.opData);

                //对于自身的一些特殊控件值的设值和取值
                that.selectPaymethod();
				//自身特有的明细展示
                that.initOrderEntry();
            };
			
			//支付方式选择按钮
            that.selectPaymethod = function(){
            	$('.pay-method div').on('click',function(){
            		$("input[name='Fbanknum']").val('');
            		$('.pay-method div').removeClass('pay-check');
            		$('.pay-method').children('div').children('span').css({'color':'#000'});
            		$(this).children('span').css({'color':'#fff'});
            		$(this).addClass('pay-check');
            		if($('#bank').hasClass('pay-check')){
            			$('#banknum_box').show();
            		}else{
            			$('#banknum_box').hide();
            		}
            	});
            }
			
			
			//初始化源单信息
            that.initOrderEntry = function (opData) {
                //表格ID
                var gridId = that.getJqGridId('fsourceorderentry');
                //初始化明细表格
                yiGrid.init(gridId, {
                    multiselect: true,
                    //数据源
                    data: yiGrid.extractEntry(opData, 'fsourceorderentry'),
                    //定义表格列
                    colModel: [
                        {
                            label: "源单", name: "forder_number", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "应付金额", name: "fpayable", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "实付金额", name: "frealpaid", width: 80, editable: true, align: "left", fixed: true,
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
                            label: "已付金额", name: "fpaid", width: 80, editable: true, align: "left", fixed: true,
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
                        }
                    ]
                });
            };
            /********************************************** 各个子业务对象逻辑代码结束 **********************************************/
        };
        __extends(_child, _super);
        return _child;
    })(BasePage);
    window.ydj_payment = window.ydj_payment || ydj_payment;
})();