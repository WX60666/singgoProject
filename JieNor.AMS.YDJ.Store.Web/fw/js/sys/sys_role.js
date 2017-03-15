
var moni={

	srvData:[
		{
			id:1,name:'一级1',
			menuGroups:[
				{
					id:1.1,name:'二级',moduleId:'英文代码',
					state:{selected:true},
					menuItems:[
						{id:1.11,name:'三级1',menuGroupId:'英文代码',state:{selected:true}},
						{id:1.12,name:'三级2',menuGroupId:'英文代码',state:{selected:true}},
						{id:1.13,name:'三级3',menuGroupId:'英文代码'},
						{id:1.14,name:'三级4',menuGroupId:'英文代码'}
					]
				}
			]
		},
		{
			id:2,name:'一级2',
			state:{selected:true},
			menuGroups:[
				{
					id:2.1,name:'二级',moduleId:'英文代码',
					menuItems:[
						{
							id:2.11,name:'三级',menuGroupId:'英文代码'
						}
					]
				}
			]
		},
		{
			id:3,name:'一级3',
			state:{selected:true},
			menuGroups:[
				{
					id:3.1,name:'二级',moduleId:'英文代码',
					menuItems:[
						{
							id:3.11,name:'三级',menuGroupId:'英文代码'
						}
					]
				}
			]
		},
		{
			id:4,name:'一级4',
			state:{selected:true},
			menuGroups:[
				{
					id:4.1,name:'二级',moduleId:'英文代码',
					menuItems:[
						{
							id:4.11,name:'三级',menuGroupId:'英文代码'
						}
					]
				}
			]
		}
	],
	userGroup:['系统管理员','用户管理员','系统配置员','用户','业务管理员','财务主管','数据下载','开发部主管','董事长','开发人员','档案著录人员','内部员工'],
	userNum:['洛天佑','江天','李测试','罗架构','刘开发','赵设计','陈小芳','陈海','陈图']
}


//具体实现功能
var Sys_Role={
	init:function(){
		this.leftShow();
		this.self();
		//功能按键
		this.buttonFunc();
	},
	setServer:{//各个模块的设置存储空间
		//企业和产品setting设置
		leftSet:'',
		//角色setting设置
		selfSet:'',
		//模块授权setting设置
		modelThoSet:'',
		//功能授权setting设置
		funcThoSet:'',
	},
	methods:{
		addDiyDom:function(treeId, treeNode){
			var spaceWidth = 5;
			var switchObj = $("#" + treeNode.tId + "_switch"),
			icoObj = $("#" + treeNode.tId + "_ico");
			switchObj.remove();
			icoObj.before(switchObj);

			if (treeNode.level > 1) {
				var spaceStr = "<span style='display: inline-block;width:" + (spaceWidth * treeNode.level)+ "px'></span>";
				switchObj.before(spaceStr);
			}
		},
		beforeClick:function(treeId, treeNode){
			if (treeNode.level == 0 ) {
				var zTree = $.fn.zTree.getZTreeObj("leftShow");
				//
				zTree.expandNode(treeNode);
				return false;
			}
			return true;
		},
		addHoverDom:function (treeId, treeNode) {
			var newCount = 1;
			var sObj = $("#" + treeNode.tId + "_span");
			if (treeNode.editNameFlag || $("#addBtn_"+treeNode.tId).length>0) return;
			var addStr = "<span class='button add' id='addBtn_" + treeNode.tId
				+ "' title='add node' onfocus='this.blur();'></span>";
			sObj.after(addStr);
			var btn = $("#addBtn_"+treeNode.tId);
			if (btn) btn.bind("click", function(){
				var zTree = $.fn.zTree.getZTreeObj("selfOwner");
				zTree.addNodes(treeNode, {id:(100 + newCount), pId:treeNode.id, name:"new node" + (newCount++)});
				return false;
			});
		},
		removeHoverDom:function (treeId, treeNode) {
			$("#addBtn_"+treeNode.tId).unbind().remove();
		},
		showRemoveBtn:function(treeId, treeNode) {
			return !treeNode.isFirstNode;
		},
		showRenameBtn:function(treeId, treeNode) {
			return !treeNode.isLastNode;
		},
		onClick:function(e,treeId, treeNode) {
			//需要指明对象
			var zTree = $.fn.zTree.getZTreeObj(treeId),
				params='';//参数存储空间
				setting = {
					view: {
						addHoverDom: Sys_Role.methods.addHoverDom,
						removeHoverDom: Sys_Role.methods.removeHoverDom,
						selectedMulti: false
					},
					check: {
						enable: true
					},
					edit: {
						enable: true,
						editNameSelectAll: true,
						showRemoveBtn: Sys_Role.methods.showRemoveBtn,
						showRenameBtn: Sys_Role.methods.showRenameBtn
					},
					data: {
						simpleData: {
							enable: true
						}
					}
				};
			if(treeNode.children!=undefined){//有子节点
				zTree.expandNode(treeNode);
			}else{//没有子节点
				//企业和产品的数据，都是后台传过来的，而一个企业下可以有多个产品，而点击具体的产品选项，才可以对后面四个模块进行数据渲染，
				console.log(treeNode);
				params=treeNode.params;
				Sys_Role.inits(setting,params)
			}
			
		}
	},
	//各个按键功能
	buttonFunc:function(){
		$('#companyFunc').on('click','.btn-group button',function(){
			var index=$(this).index();
			if(index==0){//企业与产品模块的增加按钮
				console.log('企业与产品的增加按钮')
			}else if(index==1){//企业与产品模块的删除按钮
				
			}else if(index==2){//企业与产品模块的未知按钮
				
			}
		})
		
		$('#constsFunc').on('click','.btn-group button',function(){
			var parIndex=$(this).parents('.col-md-6').index();
			var theIndex=$(this).index();
			selfButtonFunc(parIndex,theIndex)
		})
		function selfButtonFunc(parIndex,theIndex){
			if(parIndex==0){//角色树按钮
				if(theIndex==0){//增加按钮
					
				}else if(theIndex==1){//删除按钮
					
				}else if(theIndex==2){//未知按钮
					
				}
			}else if(parIndex==1){//用户模块按钮
				if(theIndex==0){//增加按钮
					
				}else if(theIndex==1){//删除按钮
					
				}else if(theIndex==2){//未知按钮
					
				}
			}else if(parIndex==2){//模块授权按钮
				if(theIndex==0){//刷新按钮
					console.log('模块授权的刷新按钮')
				}
			}
			else if(parIndex==3){//功能授权按钮
				if(theIndex==0){//刷新按钮
					console.log('功能授权的刷新按钮')
				}
			}
		}
		$(document).on('click','#firmAll',function(){
			console.log('确定按钮')
		})
		$(document).on('click','#firmClose',function(){
			console.log('关闭按钮')
		})
	},
	//左边栏,企业和角色,outlook
	leftShow:function(){
		var curMenu = null, zTree_Menu = null,that=this,
			setting = {
				view: {
					showLine: false,
					showIcon: false,
					selectedMulti: false,
					dblClickExpand: false,
					addDiyDom: that.methods.addDiyDom
				},
				
				data: {
					simpleData: {
						enable: true
					}
				},
				callback: {
					beforeClick: that.methods.beforeClick,
					//点击一次展开或者隐藏下拉项
					onClick: that.methods.onClick
				}
			};
		
		var zNodes =[//模拟数据，由于后面几个模块大致一样，只要根据具体的数据结构改变功能设计即可。
			{ id:1, pId:0, name:"系统管理员", open:true},
			{ id:11, pId:1, name:"普通管理员"},
			{ id:12, pId:1, name:"超级管理员"},
			{ id:111, pId:11, name:"管理员1"},
			{ id:112, pId:111, name:"管理员2"},
			{ id:113, pId:112, name:"管理员3"},
			{ id:114, pId:113, name:"管理员4"},
			{ id:12, pId:1, name:"用户管理员"},
			{ id:121, pId:12, name:"个人用户"},
			{ id:122, pId:12, name:"公司用户"},
			{ id:123, pId:12, name:"团队用户"},
			{ id:3, pId:0, name:"系统配置员"},
			{ id:31, pId:3, name:"个人配置",params:'selfServer'},
			{ id:32, pId:3, name:"公司配置",params:'companyServer'},
			{ id:33, pId:3, name:"团队配置",params:'teamServer'}
		];
		
		
		
		var treeObj = $("#leftShow");
		$.fn.zTree.init(treeObj, setting, zNodes);
		zTree_Menu = $.fn.zTree.getZTreeObj("leftShow");
		curMenu = zTree_Menu.getNodes()[0].children[0].children[0];
		zTree_Menu.selectNode(curMenu);

		treeObj.hover(function () {
			if (!treeObj.hasClass("showIcon")) {
				treeObj.addClass("showIcon");
			}
		}, function() {
			treeObj.removeClass("showIcon");
		});
		
	},
	/*请求后台数据，根据功能逻辑关系，在点击企业和产品的时候，每一次都需要向后台传入参数，并且请求数据后，
     *都要对后面几个模块进行渲染，所以可以将这个步骤封装成一个部分功能函数，这样方便维护。
     * 第一个为回调函数，第二个为参数，由于暂时没有具体的后台接口，所以暂用菜单数据接口代替
     */
	//获取后台数据后对函数的调用并进行数据渲染，
	inits:function (setting,param) {
		var that=this;
        this.renderMenu(function (data) {

            var res = data.operationResult.srvData;
            //角色
            $.fn.zTree.init($("#selfOwner"), setting, that.renderClassOne(res));
            //模块授权
            $.fn.zTree.init($("#modelTho"), setting, that.renderClassOne(res));
            //功能授权
            $.fn.zTree.init($("#funcTho"), setting, that.renderClassOne(res));
        },param);
    },
	//角色树
	self:function(){
		var that=this,
		//配置
			setting = {
				view: {
					addHoverDom: that.methods.addHoverDom,
					removeHoverDom: that.methods.removeHoverDom,
					selectedMulti: false
				},
				check: {
					enable: true
				},
				
				edit: {
					enable: true,
					editNameSelectAll: true,
					showRemoveBtn: that.methods.showRemoveBtn,
					showRenameBtn: that.methods.showRenameBtn
				},
				data: {
					simpleData: {
						enable: true
					}
				}
			};
		
		//数据渲染 
		that.inits(setting);
		
	},
	
    
    //回调函数和传参
	renderMenu: function (callback,params) {
		
        var ListMenuUrl = '/dynamic/sys_mainfw?operationno=listmenu&format=json';
        //没有后台接口，所以暂时先设定好参数的接口，以便与后台联调。
		console.log('这个按键的参数：'+params);
		
		params=null;
        yiAjax.p(ListMenuUrl, params,
            function (r) {
                $.isFunction(callback) && callback(r);
            },
            function (m) {
                yiDialog.m('获取业务模块数据出错：' + yiCommon.extract(m));
            },
            undefined,
            $("body")
        )
        
    },
	renderClassOne:function(res){
		//将一级菜单数据进行排序
		res= res.sort(yiCommon.sortby('order'));
		
		var that=this,
		//一级节点渲染，即最上层功能
			oneSave={};//一级节点临时存储空间
			classArrOne=[];
		
		for(var i=0,l=res.length;i<l;i++){
			oneSave.id=i+1;
			oneSave.name=res[i].name;
			oneSave.open=false;
			oneSave.isParent=true;
			oneSave.pId=0;
			
			classArrOne.push(oneSave);
			//当有二级功能的时候，就进行数据添加，没有就跳过。
			if(res[i].menuGroups.length>0){
				
				//对二级菜单数据进行排序
				res[i].menuGroups= res[i].menuGroups.sort(yiCommon.sortby('order'));
				
				classArrOne=classArrOne.concat(that.renderClass2(res[i].menuGroups,oneSave.id))
			}
			
			oneSave={}
		}
		
		return classArrOne;
	},
	renderClass2:function(obj,j){
		//console.log(obj)
		var that=this,
			classTwo=obj,//二级功能
			twoArrSave=[],//二级存储空间
			twoSave={};//二级节点临时存储空间
		
		for(var i=0,l=classTwo.length;i<l;i++){
			
			twoSave.id=j+''+(i+1);
			twoSave.name=classTwo[i].name;
			twoSave.isParent=true;
			twoSave.pId=j;
			
			twoArrSave.push(twoSave);
			
			//console.log(twoSave)
			if(classTwo[i].menuItems.length>0){
				
				twoArrSave=twoArrSave.concat(that.renderClass3(classTwo[i].menuItems,twoSave.id))
			}
			
			twoSave={};
		}
		
		return twoArrSave;
	},
	renderClass3:function(obj,j){
		var that=this,
			classThree=obj,//三级功能
			threeArrSave=[],//三级存储空间
			threeSave={};//三级节点临时存储空间
		
		for(var i=0,l=classThree.length;i<l;i++){
			
			threeSave.id=j+''+(i+1);
			threeSave.pId=j;
			threeSave.url=classThree[i].url;
			threeSave.domainType=classThree[i].domainType;
			threeSave.name=classThree[i].name;
			
			//给三级菜单前面的字体图标添加样式
			threeSave.icon='fa fa-file icon-state-warning';
			
			threeArrSave.push(threeSave);
			
			threeSave={};
		}
		//console.log(threeArrSave)
		return threeArrSave;
	},
	//用户表格，用dxDatagrid或者自由发挥
	userForm:function(){
		
	},
	//模块授权
	modelTho:function(){
		var setting = {
			check: {
				enable: true
			},
			data: {
				simpleData: {
					enable: true
				}
			}
		};

		
	},
	//功能授权
	funcTho:function(){
		var setting = {
			check: {
				enable: true
			},
			data: {
				simpleData: {
					enable: true
				}
			}
		};
		
	}
}

$(document).ready(function(){
	Sys_Role.init();
})

