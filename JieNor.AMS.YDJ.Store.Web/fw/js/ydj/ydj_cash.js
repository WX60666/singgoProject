
/// <reference path="/fw/js/basepage.js" />
; (function () {
    var ydj_cash = (function (_super) {
        var _child = function (args) {
            var that = this;
            _super.call(that, args);

            /********************************************** 各个子业务对象逻辑代码开始 **********************************************/

            //页面地址（由各个子业务对象的 js 初始化）
            that.pageFile = '/views/ydj/ydj_cash.html';

            //初始化
            that.init = function () {

                //初始化
                that.initBill(args.opData);

                //对于自身的一些特殊控件值的设值和取值
                
                //开关按钮的样式调整
                $('#'+args.pageId+' #fnorms-switch').parent('.col-md-2').css('padding-left','0px');
                
				that.showHide();
				that.changePaymethod();
				that.sum();
				that.selectPaymethod();
				that.showCzzf();
				that.showJfsy();
				that.addVal();
				that.changeType();
            };
            
			//储值支付和积分使用的显示隐藏
            that.showHide=function(){
            	
            	var val=$("#usage option:selected").text();
            	
            	$('#usage').on('click',function(){
            		
            		val=$("#usage option:selected").text();
            		
            		if(val=='储值/定金'){
            			$('#czzf').hide();
		        		$('#kyye').hide();
		        		$('#jfsy').hide();
		        		$('#kyjf').hide();
		        		that.changeType();
		        	}else{
		        		$('#czzf').show();
		        		$('#kyye').show();
		        		$('#jfsy').show();
		        		$('#kyjf').show();
		        		that.changeType();
		        	}
            	})
            };
            
            //切换类型方法
            that.changeType=function(){
            	$('.pay-method div').removeClass('pay-check');
            	$('.pay-method').children('div').children('span').css({'color':'#000'});
            		$('#money').val('');
            		$("input[name='Fbanknum']").val('');
            		$('#banknum_box').hide();
            		if(parseInt($('.switch-type1').children('span').css('margin-left'))==16){
            			$('.switch-type1').children('span').animate({'margin-left':'2px'},50);
            			$('.switch-type1').css('background-color','#E5E5E5');
            			$('#Fstored,#Fintegration').find('input').attr('value','');
            			$('#Fstored,#Fintegration').hide();
            		}
            		that.addVal();
            }
            
            //收支类型切换
            that.changePaymethod=function(){
            	$('#fcollect,#fpayment').on('click',function(){
            		that.changeType();
            	});
            }
            
            
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
            			$("input[name='Fbanknum']").focus();
            		}else{
            			$('#banknum_box').hide();
            		}
            	});
            }
            
            
            //储值支付功能
            that.showCzzf= function(){
            	$('#fczzf-switch').on('click',function(){
            		var switchWidth = parseInt($(this).children('span').css('margin-left'));
            		if(switchWidth == 16){
            			$(this).children('span').animate({'margin-left':'1px'},50);
            			$(this).css('background-color','#eff3f8');
            			$('#Fstored').find('input').attr('value','');
            			$('#Fstored').hide();
            			that.addVal();

            		}else{
            			$(this).children('span').animate({'margin-left':'16px'},50);
            			$(this).css('background-color','#428bca');
            			$('#Fstored').show();
            			$('#Fstored').find('input').focus();
            		}
            	});
            }
            
            //积分使用功能
            that.showJfsy= function(){
            	$('#fjfsy-switch').on('click',function(){
            		var switchWidth = parseInt($(this).children('span').css('margin-left'));
            		if(switchWidth == 16){
            			$(this).children('span').animate({'margin-left':'1px'},50);
            			$(this).css('background-color','#eff3f8');
            			$('#Fintegration').find('input').attr('value','');
            			$('#Fintegration').hide();
            			that.addVal();
            		}else{
            			$(this).children('span').animate({'margin-left':'16px'},50);
            			$(this).css('background-color','#428bca');
            			$('#Fintegration').show();
            			$('#Fintegration').find('input').focus();
            		}
            	});
            }
            
            
            
            //总额的获得
            that.sum=function(){
            	
            	var $money;
            	var $Fstored;
            	var $Fintegration;
            	
            	$('#money,#FstoredVal,#FintegrationVal,#fczzf-switch,#fjfsy-switch').on('input',function(){
            		$money=Number($('#money').val());
            		$Fstored=Number($('#FstoredVal').val());
            		$Fintegration=Number($('#FintegrationVal').val());
            		$('#fsum').val(($money+$Fstored+$Fintegration));
            	});
            };
			
			//总额相加
			that.addVal=function(){
				var $money=Number($('#money').val());
        		var $Fstored=Number($('#FstoredVal').val());
        		var $Fintegration=Number($('#FintegrationVal').val());
				$('#fsum').val(($money+$Fstored+$Fintegration));
			}
            /********************************************** 各个子业务对象逻辑代码结束 **********************************************/
        };
        __extends(_child, _super);
        return _child;
    })(BasePage);
    window.ydj_cash = window.ydj_cash || ydj_cash;
})();