/// <reference path="/fw/js/basepage.js" />
//基础资料-商品
; (function () {
    var ydj_product = (function (_super) {
        var _child = function (args) {
            var that = this;
            _super.call(that, args);

            //页面地址（由各个子业务对象的 js 初始化）
            that.pageFile = '/views/ydj/ydj_product.html';

            //初始化
            that.init = function () {

                //初始化
                that.initBill(args.opData);

                //对于自身的一些特殊控件值的设值和取值
				that.showNorms();
				that.showBtn();
				that.addBtn();
				that.delBtn();
				that.changeType();
				that.materialChecked();
            };
			//显示或隐藏添加选项
            that.showNorms= function(){
            	$('.switch-type1').on('click',function(){
            		var switchWidth = parseInt($(this).children('span').css('margin-left'));
            		if(switchWidth == 16){
            			$(this).children('span').animate({'margin-left':'1px'},50);
            			$(this).css('background-color','#eff3f8');
            			$(this).parent().next().children('#norms-box').stop().slideToggle(100);
            		}else{
            			$(this).children('span').animate({'margin-left':'16px'},50);
            			$(this).css('background-color','#428bca');
            			$(this).parent().next().children('#norms-box').stop().slideToggle(100);
            		}
            	});
            }
			
			//显示或隐藏可添加选项
			that.showBtn=function(){
				$('.add-button').on('click',function(){
					var btnDis = $(this).next('.attribute_button').css('display');
					if(btnDis == 'none'){
						$(this).parent().find('.attribute_button_box').stop(true,false).slideToggle(100);
					}else{
						$(this).parent().find('.attribute_button_box').stop(true,false).slideToggle(100);
					}
				});
			}
			
			//添加所选内容
			that.addBtn=function(){
				$('.attribute_button').live('click',function(){
					var boxDis = $(this).nextAll('.attribute_button_box').css('display');
					$(this).insertAfter($(this).parent().prev()).addClass('attribute_button_check').attr('id','addOver');
				});
			}
			
			//删除所选内容
			that.delBtn=function(){
				$('#addOver').live('click',function(){
					$(this).appendTo($(this).parent().children('.attribute_button_box')).removeClass('attribute_button_check').removeAttr('id');
				});
			}
			
			//切换商品属性类别
			that.changeType=function(){
				var retail = $("input[name='fretail']"),
					purcharse = $("input[name='fpurcharse']"),
					sale = $("input[name='fsale']"),
					arearetail = $("input[name='farearetail']"),
					areapurcharse = $("input[name='fareapurcharse']"),
					areasale = $("input[name='fareasale']");
				 
				//点击标准件类别
            	$('#fstandard').on('click',function(){
            		$('#fsale-inputbox,#fpurcharse-inputbox,#fretail-inputbox').show();
            		$('#fsize_box').stop().slideUp(150);
            		$('#fdimension_box').stop().slideUp(150);
            		arearetail.val('');
            		areapurcharse.val('');
            		areasale.val('');
            	});
            	//点击尺寸属性类别
            	$('#fsize').on('click',function(){
            		$('#fsale-inputbox,#fpurcharse-inputbox,#fretail-inputbox').hide();
            		$('#fsize_box').stop().slideDown(150);
            		$('#fdimension_box').stop().slideUp(150);
            		retail.val('');
            		purcharse.val('');
            		sale.val('');
            	});
            	//点击多维度属性
            	$('#fdimension').on('click',function(){
            		$('#fsale-inputbox,#fpurcharse-inputbox,#fretail-inputbox').hide();
            		$('#fdimension_box').stop().slideDown(150);
            		$('#fsize_box').stop().slideUp(150);
            		retail.val('');
            		purcharse.val('');
            		sale.val('');
            		arearetail.val('');
            		areapurcharse.val('');
            		areasale.val('');
            	});
            	//
            	$("input[name='fareaprice']").on('click',function(){
            		$('#fareaunit_box,#farearetail_box,#fareapurcharse_box,#fareasale_box').toggle();
            		$("input[name='fareaunit']").parent('span').removeAttr('checked');
            		arearetail.val('');
            		areapurcharse.val('');
            		areasale.val('');
            	});
			}

			that.materialChecked = function () {
			    var $materialtype = $('#' + args.pageId + ' .radio span'),
			        formId;
			    $('.sizepricing').on('click', function () {
			        if ($materialtype.eq(1).attr('class')) {
			            formId = 'ydj_sizeprice';
			            that.dataSubmit(formId);
			        } else if ($materialtype.eq(2).attr('class')) {
			            formId = 'ydj_pricelist';
			            that.dataSubmit(formId);
			        }
			    })
			};

			that.dataSubmit = function () {
			    var formId = 'ydj_sizeprice';

			    yiAjax.p('/dynamic/ydj_product?operationno=ydj_goodstopricing', {
			        simpleData: {
			            formId: formId,
			            fmaterialid: args.pkid
			        }
			    },
                    function (r) {
                        if (r.isSuccess = true) {
                            var res = r.operationResult.srvData;
                            if (res != null && res.result == true) {                                
                                //打开编辑页面
                                var pkid = res.id;
                                yiCacheScript.g('/fw/js/platform/formop/modify.js', function () {
                                    new Modify({
                                        formId: formId,
                                        pageId: that.pageId,
                                        domainType: that.domainType.bill,
                                        openStyle: that.openStyle,
                                        pageSelector: that.pageSelector,
                                        pkids: [pkid]
                                    });
                                });
                            } else if (res != null && res.result == false) {
                                yiDialog.a(res.error);
                            } else {
                                Index.openForm({
                                    formId: formId,
                                    domainType: Consts.domainType.bill,
                                    containerId: 'divTestId'
                                    
                                });
                            }
                        }
                    },
                    function (m) {
                        //提示错误信息
                        yiDialog.m('页面获取出错！');
                    }
                );
			}
			
        };
        __extends(_child, _super);
        return _child;
    })(BasePage);
    window.ydj_product = window.ydj_product || ydj_product;
})();