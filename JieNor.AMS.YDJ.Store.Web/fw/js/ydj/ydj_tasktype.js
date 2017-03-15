
/// <reference path="/fw/js/basepage.js" />
//基础资料-单位
; (function () {
    var ydj_tasktype = (function (_super) {
        var _child = function (args) {
            var that = this;
            _super.call(that, args);

            /********************************************** 各个子业务对象逻辑代码开始 **********************************************/

            //页面地址（由各个子业务对象的 js 初始化）
            that.pageFile = '/views/ydj/ydj_tasktype.html';

            //初始化
            that.init = function () {

                //初始化
                that.initBill(args.opData);
				that.showDoc();
                //对于自身的一些特殊控件值的设值和取值

            };
		
            that.showDoc= function(){
            	$('.switch-type1').on('click',function(){
            		var switchWidth = parseInt($(this).children('span').css('margin-left'));
            		if(switchWidth == 16){
            			$(this).children('span').animate({'margin-left':'1px'},50);
            			$(this).css('background-color','#eff3f8');
            			$(this).parent().parent('.form-group').next().stop().hide();
            			$('#fdocobj').val('');
            		}else{
            			$(this).children('span').animate({'margin-left':'16px'},50);
            			$(this).css('background-color','#428bca');
            			$(this).parent().parent('.form-group').next().stop().show();
            			$('#fdocobj').focus();
            		}
            	});
            }

            /********************************************** 各个子业务对象逻辑代码结束 **********************************************/
        };
        __extends(_child, _super);
        return _child;
    })(BasePage);
    window.ydj_tasktype = window.ydj_tasktype || ydj_tasktype;
})();