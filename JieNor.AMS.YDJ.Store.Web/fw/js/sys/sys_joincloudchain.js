/// <reference path="/fw/js/basepage.js" />
; (function () {
    var sys_joincloudchain = (function (_super) {
        var _child = function (args) {
            var that = this;
            _super.call(that, args);
            
            /********************************************** 各个子业务对象逻辑代码开始 **********************************************/

            //页面地址（由各个子业务对象的 js 初始化）
            that.pageFile = '/views/sys/sys_joincloudchain.html';
            
            //初始化
            that.init = function () {
                //初始化
                that.initBill(args.opData);

                //对于自身的一些特殊控件值的设值和取值
                
                //获取后台数据
                that.onProcessSrvData();
                
                //取消
                that.cancel();
                
                //加入
                that.submit();
            };
			
            //处理服务端返回的数据
            that.onProcessSrvData = function (params) {
				
				var dataUrl = '/dynamic/sys_joincloudchain?operationno=load&format=json';
		
		        yiAjax.p(dataUrl, null,
		            function (r) {
		            	
		            	var res = r.operationResult.srvData;
		            	that.fillDataToHtml(res);
		            },
		            function (m) {
		                yiDialog.m('获取数据出错：' + yiCommon.extract(m));
		            },
		            undefined,
		            $("body")
		        )
            };
			
			//动态填充数据到页面input框中
			that.fillDataToHtml=function(res){
				
				var inputs=$('#'+args.pageId+' input');//云链页面中所包含的input
				var len=inputs.length;//云链页面中所包含的input的长度
				for(var i=0;i<len;i++){
					
					var Attr=inputs.eq(i).attr('name');
					//将后台获取的数据key值与input中的name值对应并进行数据填充
					inputs.eq(i).val(res[Attr])
				}
			};
			
			//数据提交
			that.submit=function(){
				
				$('#cloudSubmit').on('click',function(){
					var simpledataStr=getData();
							
					params={simpledata:simpledataStr};
						
		            yiAjax.p('/dynamic/{0}?operationno=join'.format(args.formId), params,
		            	
		                function (r) {
		                	
		                    //加入成功后就进行图片的替换和字体图标的替换
		                    if(r.operationResult.isSuccess){
		                    	$('#joincloudIcon').attr('src','/fw/images/colorCloud_icon.png')
		                    	$('i.fa.fa-exclamation').removeClass('fa-exclamation').addClass('fa-check');
		                    }
		                },
		                function (m) {
		                    //提示错误信息
		                    yiDialog.m('显示页面出错！');
		                    
		                }
		            );
				})
				
				//获取页面中数据
				function getData(){
		            var inputs=$('#'+args.pageId+' input');//云链页面中所包含的input
					var len=inputs.length;//云链页面中所包含的input的长度
					var simpleData={};//页面数据的存储空间
					for(var i=0;i<len;i++){
						
						var Attr=inputs.eq(i).attr('name');
						simpleData[Attr]=inputs.eq(i).val();
					}
					
					return simpleData;
				};
			};
			
			//取消操作
			that.cancel=function(){
                //地址
	            var url = '/dynamic/{0}?operationno=close&pageid={1}'.format(args.formId, args.pageId);
				$('#cloudCancel').on('click',function(){
					
					//请求关闭页面
		            yiAjax.p(url, {}, function (r) {
		
		                //关闭页签
		                TabMgr.getInstance().close(args.pageId);
		
		                //及时释放页面对象
		                args = null;
		
		            }, null, null, null);
				})
			};
			
            /********************************************** 各个子业务对象逻辑代码结束 **********************************************/
        };
        __extends(_child, _super);
        return _child;
    })(BasePage);
    window.sys_joincloudchain = window.sys_joincloudchain || sys_joincloudchain;
})();