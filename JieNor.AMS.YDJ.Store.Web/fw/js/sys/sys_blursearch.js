//模拟数据
var modelArray=[
//购买','用户数','启用日期','截止日期
	{bookID: 1,'模块代码':'1111','模块名称':'订单管理','购买':'100','用户数':10,'启用日期':2012-10-10,'截止日期':2016-10-10,'模块站点':'www.baidu.com'},
	{bookID: 2,'模块代码':'2222','模块名称':'客户管理','购买':'100','用户数':10,'启用日期':2012-10-10,'截止日期':2016-10-10,'模块站点':'www.360.com'},
	{bookID: 3,'模块代码':'3333','模块名称':'店面管理','购买':'100','用户数':10,'启用日期':2012-10-10,'截止日期':2016-10-10,'模块站点':'www.google.com'},
	{bookID: 4,'模块代码':'4444','模块名称':'库存管理','购买':'100','用户数':10,'启用日期':2012-10-10,'截止日期':2016-10-10,'模块站点':'www.google.com'}
]

var Sys_Blursearch={
	init:function(){
		this.actionNav();
	},
	actionSear:function(){
		var that=this;
		$(document).on('focus','.blursearch-container input.form-control',function(){
			var val=$(this).val();
			that.blurSearch(val);
		})
	},
	blurSearch:function(val){
		
		var timer;//计时器
		$('.blursearch-container input.form-control').on('keyup',function(){
			var name=$(this).val();
			var str='http://baike.baidu.com/api/openapi/BaikeLemmaCardApi?scope=103&format=json&appid=379020&bk_key='+name+'&bk_length=600';
			/*设定延时机制，如果在短时间内继续输入，则暂停ajax请求，停止原来的延时事件，重新设定延时事件。
			 *不过下面的延时事件还有一个bug，并没有对特定的按键进行排除，因为键盘上有些键是不会有内容输出，不过这是个小问题，在功能完善的时候添加即可
			 */
			clearTimeout(timer);
			timer=setTimeout(function(){
				$.ajax({
					type:"get",  
					url:str,
					dataType:"jsonp",  
					success: function(data){ 
						
					}
				})
			},300)
		})
	},
	actionNav:function(){
		var that=this;
		//键盘导航功能设计
		//在搜索文本里聚焦的时候触发keyup事件
		var actNum=0;
		
		$(document).on('focus','input.form-control',function(){
			$(document).on('keyup',function(e){
				
				//当按上键
				if(e['keyCode']==38){
					//当焦点在第一行的时候，再按上键，就默认调到最后一行
					if(actNum==0){
						actNum=$('.search-container-content table tr').length-1;
					}else{
						actNum--;
					}
				}
				//当按下键
				else if(e['keyCode']==40){
					
					//当焦点在最后一行的时候，再按下键，就默认调到第一行
					if(actNum==$('.search-container-content table tr').length-1){
						actNum=0;
					}else{
						actNum++;
					}
					
					if(!that.acAssist()){
						actNum=0;
					}
					
				}
				$('.search-container-content table tr').removeClass('active');
				$('.search-container-content table tr').eq(actNum).addClass('active')
			})
		})
		//当搜索文本框失去焦点的时候释放该事件
		$(document).on('blur','input.form-control',function(){
			$(document).unbind('keyup');
		})
		
		$(document).on('click','.search-container-content table tr',function(){
			actNum=$(this).index();
			$('.search-container-content table tr').removeClass('active');
			$(this).addClass('active')
		})
	},
	acAssist:function(){
		var flag=false;
		$('.search-container-content table tr').each(function(){
			if($(this).hasClass('active')){
				flag=true;
			}
		})
		return flag;
	},
}

$(document).ready(function(){
	Sys_Blursearch.init();
})
