var booksArray = [
    { bookID: 1, '超级管理员':false,'普通管理员':false,'用户名称': '测试1', '手机号': "The Hitchhiker's Guide to the Galaxy", '邮箱': 1979, '初始密码': 'Comedy, sci-fi'},
    { bookID: 2, '超级管理员':false,'普通管理员':false,'用户名称': '测试2', '手机号': "Cat's Cradle", '邮箱': 1963, '初始密码': 'Satire, sci-fi'},
    { bookID: 3, '超级管理员':false,'普通管理员':false,'用户名称': 'M. Mitchell', '手机号': "Gone with the Wind", '邮箱': 1936, '初始密码': 'Historical fiction'},
    { bookID: 4, '超级管理员':false,'普通管理员':false,'用户名称': 'H. Lee', '手机号': "To Kill a Mockingbird", '邮箱': 1960, '初始密码': 'Novel'},
    { bookID: 5, '超级管理员':false,'普通管理员':false,'用户名称': 'G. Orwell', '手机号': "Nineteen Eighty-Four", '邮箱': 1949, '初始密码': 'Dystopian novel, political fiction'},
    { bookID: 6, '超级管理员':false,'普通管理员':false,'用户名称': 'R. Bradbury', '手机号': "The Martian Chronicles", '邮箱': 1950, '初始密码': 'Sci-fi'},
    { bookID: 7, '超级管理员':false,'普通管理员':false,'用户名称': 'K. Vonnegut', '手机号': "God Bless You, Mr. Rosewater, or Pearls Before Swine", '邮箱': 1965},
    { bookID: 8, '超级管理员':false,'普通管理员':false,'用户名称': 'J. D. Salinger', '手机号': 'The Catcher in the Rye', '邮箱': 1951, '初始密码': 'Bildungsroman'},
    { bookID: 9, '超级管理员':false,'普通管理员':false,'用户名称': 'C. Dickens', '手机号': "Great Expectations", '邮箱': 1861, '初始密码': 'Realistic fiction'},
    { bookID: 10,'超级管理员':false,'普通管理员':false,'用户名称': 'J. Austen', '手机号': "Pride and Prejudice", '邮箱': 1813, '初始密码': 'Novel of manners'}
];
var modelArray=[
//购买','用户数','启用日期','截止日期
	{bookID: 1,'模块代码':'1111','模块名称':'订单管理','购买':'100','用户数':10,'启用日期':2012-10-10,'截止日期':2016-10-10,'模块站点':'www.baidu.com'},
	{bookID: 2,'模块代码':'2222','模块名称':'客户管理','购买':'100','用户数':10,'启用日期':2012-10-10,'截止日期':2016-10-10,'模块站点':'www.360.com'},
	{bookID: 3,'模块代码':'3333','模块名称':'店面管理','购买':'100','用户数':10,'启用日期':2012-10-10,'截止日期':2016-10-10,'模块站点':'www.google.com'},
	{bookID: 4,'模块代码':'4444','模块名称':'库存管理','购买':'100','用户数':10,'启用日期':2012-10-10,'截止日期':2016-10-10,'模块站点':'www.google.com'}
]
//具体功能
;var Sys_FirmMessage={
	init:function(){
		this.func1();
		this.nextButton();
		this.checkIn();
	},
	
	consts:{
		//判定流程到了第几步,默认是第一步
		index:0
	},
	
	//有些表单的公共功能，如数据源的获取，数据列的获取，以及列表的基本数据格式（如功能getDataSource）
	getSelection: function () {
        return {
            //选择模式：设置为多选
            mode: 'multiple',

            //复选框显示模式：总是显示
            showCheckBoxesMode: 'always',

            //允许选择所有行
            allowSelectAll: true
        };
    },
    getDataSource: function (result) {
        return {
            store: {
                data: result,
                type: 'array',
                key: 'bookID'
            }
        };
    },
    //检测公司注册号
    checkCompany:function($fcompanyno){
    	var $input=$fcompanyno.find('input'),
    		$span=$fcompanyno.find('span.help-block');
    		val=$.trim($input.val());//去掉左右空格
    	if(val.length<=0){
    		$span.attr('class','help-block error');
    	}else{
    		var reg=/\d{15}/;
    		if(reg.test(val)==true){
    			$span.attr('class','help-block success');
    		}else{
    			$span.attr('class','help-block error');
    		}
    	}
    },
    //检测公司名称
    checkCompanyName:function($fcompanyname){
    	var $input=$fcompanyname.find('input'),
    		$span=$fcompanyname.find('span.help-block');
    		val=$.trim($input.val());//去掉左右空格
    	if(val.length<=0){
    		$span.attr('class','help-block error');
    	}else{
    		$span.attr('class','help-block success');
    	}	
    },
    //检测营业执照
    checkLicence:function($fbuslicence){
    	var $input=$fbuslicence.find('input[type=file]'),
    		$span=$fbuslicence.find('span.help-block'),
    		str='';
    	str=$input.val();//图片在电脑上的地址
    	
    	$span.attr('class','help-block success');
    	
    	var arr=str.split('\\');//注split可以用字符或字符串分割
		var my=arr[arr.length-1];//这就是要取得的图片名称
		
    },
    //检测法人名称
    checkLegalName:function($flegalname){
    	var $input=$flegalname.find('input'),
    		$span=$flegalname.find('span.help-block');
    		val=$.trim($input.val());//去掉左右空格
    	if(val.length<=0){
    		$span.attr('class','help-block error');
    	}else{
    		$span.attr('class','help-block success');
    	}	
    },
    //检测负责人联系方式
    checkContact:function($flegalcontact){
    	var $input=$flegalcontact.find('input'),
    		$span=$flegalcontact.find('span.help-block');
    		val=$.trim($input.val());//去掉左右空格
    	if(val.length<=0){
    		$span.attr('class','help-block error');
    	}else{
    		var reg=/^[1][0-9]{10}$/;//暂时设定为电话号码
    		if(reg.test(val)==true){
    			$span.attr('class','help-block success');
    		}else{
    			$span.attr('class','help-block error');
    		}
    	}	
    },
    //组织类型，不需要检测。
    checkType:function(){
    	var $fcompanytype=$('#fcompanytype'),
    		$select=$fcompanytype.find('select');
    	//获得企业类型
    	var sel=$select.find("option:selected").text();
    	
    	return sel;
    },
    
    //核算币别
    checkCurrency:function($fcurrency){
    	var $input=$fcurrency.find('input'),
    		$span=$fcurrency.find('span.help-block');
    		val=$.trim($input.val());//去掉左右空格
    	//币别暂时的判定条件（是否为空）;
    	if(val.length<=0){
    		$span.attr('class','help-block error');
    	}else{
    		$span.attr('class','help-block success');
    	}	
    },
    
    //税率
    checkTaxRate:function(){
    	var $ftaxrate=$('#ftaxrate');
    	var $input=$ftaxrate.find('input'),
    		$select=$ftaxrate.find('select');
    	//获得税率
    	var rate=$select.find("option:selected").text();
    	
    	return rate;
    	
    },
    
    //检测第一步的所有的输入条件
    checkAll:function(){
    	var flag=true;
    	$('#tab1 .col-md-4 span').each(function(){
    		var status=$(this).hasClass('success');
    		if(status==false){
    			flag=false;
    			$(this).attr('class','help-block error');
    		}
    	})
    	return flag;
    },
    
    //获得第一步的全部的参数
    checkParams:function(){
    	var billData={},
    	//公司注册号
    		companyNo= $.trim($('#fcompanyno').find('input').val()) ,
    	//公司名称
    		companyName= $.trim($('#fcompanyname').find('input').val()),
    	//营业执照
    		companyLicence= $.trim($('#fbuslicence').find('input').val()),
    	//法人名称
    		legalname= $.trim($('#flegalname').find('input').val()),
    	//负责人联系方式
    		contact= $.trim($('#flegalcontact').find('input').val()),
    	//企业组织类型
    		type=Sys_FirmMessage.checkType(),
    	//核算币别
    		fCurency=$.trim($('#fcurrency').find('input').val()),
    	//默认税率
    		rate=Sys_FirmMessage.checkTaxRate();
    	
    	billData={
    		fcompanyno:companyNo,
    		fcompanyname:companyName,
    		fbuslicence:companyLicence,
    		flegalname:legalname,
    		flegalcontact:contact,
    		fcompanytype:type,
    		fcurrency:fCurency,
    		ftaxrate:rate
    	};
    	return billData;
    },
    
    checkIn:function(){
    	Sys_FirmMessage.checkAll();
    	//公司注册号
    	$(document).on('blur','#fcompanyno',function(){ 
    		Sys_FirmMessage.checkCompany($(this));
    	});
    	//公司名称
    	$(document).on('blur','#fcompanyname',function(){ 
    		Sys_FirmMessage.checkCompanyName($(this));
    	});
    	//营业执照
    	$(document).on('change','#fbuslicence',function(){ 
    		Sys_FirmMessage.checkLicence($(this));
    	});
    	//法人名称
    	$(document).on('blur','#flegalname',function(){ 
    		Sys_FirmMessage.checkLegalName($(this));
    	});
    	//负责人联系方式
    	$(document).on('blur','#flegalcontact',function(){ 
    		Sys_FirmMessage.checkContact($(this));
    	});
    	//组织类型,由于组织类型是选择框，所以无需确认
    	
    	//核算币别
    	$(document).on('blur','#fcurrency',function(){ 
    		Sys_FirmMessage.checkCurrency($(this));
    	});
    	//税率也是是选择框，无需确认
    	
    },
    
    //下一步按钮点击事件
	nextButton:function(){
		var that=this;
		$(document).on('click','#firm-next',function(){
			
			if(Sys_FirmMessage.consts.index<3){
				Sys_FirmMessage.consts.index++;
				if(Sys_FirmMessage.consts.index==1){//第二步
					//第一步各个文本框是否满足条件,满足条件true，则执行语句，否则不跳转。
					if(Sys_FirmMessage.checkAll()==true){
						//在所有文本符合条件的情况下，所得到的参数。
						var params=Sys_FirmMessage.checkParams();
						
						that.func2();
					}else{
						Sys_FirmMessage.consts.index--;
						alert('信息未填完整');
						return false;
					}
				}
				if(Sys_FirmMessage.consts.index==2){//第三步
					that.func3();
				}
				//只有第一步没有上一步按钮
				$('#firm-prev').show();
				//满足条件后进入下一步
				Sys_FirmMessage.nextPrev(Sys_FirmMessage.consts.index);
				
			}else{//第四步的下一步按钮事件
				alert('最后一步')
			}
			
		});
		$(document).on('click','#firm-prev',function(){
			Sys_FirmMessage.consts.index--;
			if(Sys_FirmMessage.consts.index==0){
				$('#firm-prev').hide();
			}
			if(Sys_FirmMessage.consts.index>=0){
				Sys_FirmMessage.nextPrev(Sys_FirmMessage.consts.index);
			}
			
		});
	},
    
	//该页面加载的时候的初始化
	func1:function(){
		
		//在第一步的时候，就将上一步按钮隐藏
		$('#firm-prev').hide();
		$('#firm-form ul.nav>li').eq(Sys_FirmMessage.consts.index).addClass('active');
		$('#bar>div').css('width',25*(Sys_FirmMessage.consts.index+1)+'%');
		//为了测试，上传前需删除
		$('#firm-content .tab-pane').removeClass('active');
		$('#firm-content .tab-pane').eq(Sys_FirmMessage.consts.index).addClass('active');
	},
	//涉及字段：包含一个列表，支持从excel复制粘贴过来，还有增加，删除，清空等列表功能
	func2:function(){
		
		//devexpress自带的功能
		$('#tab2 .firm-user-message').dxDataGrid({
		     columns: [
		     //,showEditorAlways: false
		    	{ dataField: '超级管理员',alignment:'center' },
		    	{ dataField: '普通管理员',alignment:'center'},
		     	'用户名称','手机号','邮箱','初始密码'
	        ],
		    dataSource:Sys_FirmMessage.getDataSource(booksArray),
		    //允许所有列调整宽度
		    allowColumnResizing: true,
		    //允许所有列重新排序
		    allowColumnReordering: true,
		    //所有列自动调整宽度
		    columnAutoWidth: true,
		    //是否显示边框
            showBorders: true,
            //是否显示内容行边框
            showRowLines: true,
            selection:Sys_FirmMessage.getSelection(),
		});
		var dataGrid = $('#tab2 .firm-user-message').dxDataGrid('instance');
		//让列中出现复选框的方法
        dataGrid.columnOption('普通管理员', 'showEditorAlways', true);
        
        var t = $('#tab2 .firm-user-message').dxDataGrid('instance');
        //对超级管理员和普通管理员的操作
		$(document).on('click','#tab2 .firm-user-message td',function(){
			var dataSource=t.option('dataSource');
			var aria=$(this).attr('aria-label');
			var index=$(this).parent().index();
			
			//超级管理员只能有一个
			if(aria.indexOf('超级管理员')>0){
				var flag=false;
				//超级管理员和普通管理员互斥
				if(!dataSource.store.data[index]['普通管理员']){
					//因为超级管理员只能有一个，所以必须在点击超级管理员那一列按钮的时候，先将所有的按钮设置为false
					for(var i=0;i<dataSource.store.data.length;i++){
						if(i!=index){
							dataSource.store.data[i]['超级管理员']=false;
						}
					}
					
					if(dataSource.store.data[index]['超级管理员']){//当已经被选中,
						flag=false;
					}else{
						flag=true;//当没有被选中
					}
					dataSource.store.data[index]['超级管理员']=flag;
				}
			}
			//普通管理员可以有多个
			else if(aria.indexOf('普通管理员')>0){
				var flag=false;
				//超级管理员和普通管理员互斥
				if(!dataSource.store.data[index]['超级管理员']){
					if(dataSource.store.data[index]['普通管理员']){//当已经被选中,
						flag=false;
					}else{
						flag=true;//当没有被选中
					}
					dataSource.store.data[index]['普通管理员']=flag;
				}
			}
			//在修改数据后重新渲染。
			t.option('dataSource',dataSource);
		})
		
		
		//对数据源处理进行重渲染，实现删除
		$(document).on('click','#deleteRow',function(){
			
			var dataSource=t.option('dataSource');
			dataSource.store.data.push({'用户名称':'1','手机号':'1','邮箱':'1','初始密码':'1'});
			var arr=[1,0];
			for(var i=0;i<2;i++){
				dataSource.store.data.splice(arr[i],1)
			}
			t.option('dataSource',dataSource);
		});
		//对数据源处理进行重渲染，实现清空
		$(document).on('click','#clearAll',function(){
			
		});
		//增加一行,下面三个功能组合成新增一行的功能。
		$("#insertRowButton").dxButton({
	        text: '新增',
	        onClick: function (info) {
	            var dataGrid = $('#tab2 .firm-user-message').dxDataGrid('instance');
	            dataGrid.addRow();
	        }
   		});
   		
   		$("#saveRowButton").dxButton({
	        text: '保存',
	        onClick: function (info) {
	            var dataGrid = $('#tab2 .firm-user-message').dxDataGrid('instance');
	            dataGrid.saveEditData();
	        }
	    });
	 
	    $("#cancelRow").dxButton({
	        text: '取消操作',
	        onClick: function (info) {
	            var dataGrid = $('#tab2 .firm-user-message').dxDataGrid('instance');
	            dataGrid.cancelEditData();
	        }
	    });
	    
	
	},
	//第三个模块,业务模块,在列表模块，关于列和行
	func3:function(){
		$('#tab3 .firm-model').dxDataGrid({
			//'模块代码', '模块名称', '模块站点（http://{站点代码}.{模块代码}.{hostname}:{port}/'
			noDataText: '没有任何数据！',
		    columns: [
		    //'模块名称','购买','用户数','启用日期','截止日期','模块站点'
		    	{ dataField: '模块代码',alignment:'center' },
		    	{ dataField: '购买',alignment:'center' },
		    	{ dataField: '用户数',alignment:'center' },
		    	{ dataField: '启用日期',alignment:'center' },
		    	{ dataField: '截止日期',alignment:'center' },
		    	{ dataField: '模块站点',alignment:'left' }
		    ],
		    dataSource:Sys_FirmMessage.getDataSource(modelArray),
		    //允许所有列重新排序
		    allowColumnReordering: true,
		    showBorders:true,
            //所有列自动调整宽度
		    columnAutoWidth: true,
		    selection:Sys_FirmMessage.getSelection(),
		});
		
	},
	
	nextPrev:function(index){
		$('#firm-form ul.nav>li').removeClass('active');
		$('#firm-form ul.nav>li').eq(index).addClass('active');
		$('#bar>div').css('width',25*(index+1)+'%');
		
		$('#firm-content .tab-pane').removeClass('active');
		$('#firm-content .tab-pane').eq(index).addClass('active');
	}
}
$(document).ready(function(){
	Sys_FirmMessage.init();
})
