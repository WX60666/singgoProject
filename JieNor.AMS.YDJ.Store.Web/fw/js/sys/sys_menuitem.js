
var Sys_Menuitem={
	//正则表达式验证
	checkUrl:function(urlString){ //url正则验证
		var $alert=$(".webUrl"); //获取提示框
		var reg=/^((https|http):\/\/)?([a-zA-Z]{0,61}(:[0-9]{1,4}))|(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+\/?)$/
		if(urlString.val()==''){
			$alert.hide();
		}
		else if (!reg.test(urlString.val())) {
			$alert.show().html('url格式不正确!');
			return false; 
		} else {  //否则隐藏提示框
			$alert.hide();
			return true; 
		} 

	},
	
	Blurs:function(){  /*鼠标离开事件时判断是否满足验证要求*/
		var that=this;
		$(document).on('change','#webUrl',function(){ //  网址
				that.checkUrl($(this));
		});
	},
	
	Submits:function(){   /*点击提交按钮时是否满足验证要求*/
		var that = this;
		var flag=true;
		$(document).on("click","#submit",function(){
			
			var params=getMenuitemInfo();
			//将对象转为字符串的形式
			params=JSON.stringify(params);
				
            yiAjax.p('', params,

                function () {
                    //执行回调函数
                    yiDialog.m('提交成功！', 'success');
                },
                function (m) {
                    //提示错误信息
                    yiDialog.m('菜单明细出错！');
                }
            );
			
			function getMenuitemInfo() {
				
			    return {
	                billData: {
	                    fname: $.trim($("#name").val()),
	                    ficon: $.trim($("#icon").val()),
	                    furl: $.trim($("#webUrl").val()),
	                    fgroupid: $.trim($("#group").val()),
	                    fhelpcode: $.trim($("#helpcode").val()),
	                    forder: $.trim($("#order").val()),
	                    fdomaintype: $.trim($("#domaintype").val()),
	                    fbillformid: $.trim($("#billformid").val()),
	                    fbillcaption: $.trim($("#billcaption").val()),
	                    fenablerac: $.trim($("#enablerac").prop('checked')),
	                }
	            }
			}
			
		});
	},
	
	init:function(){
		this.Blurs();
		this.Submits();
		}
	}
	
Sys_Menuitem.init();