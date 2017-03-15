/// <reference path="/fw/js/basepage.js" />
; (function () {
    var sys_menueditor = (function (_super) {
    	
		var newCount = 1;
		
		//公用方法
		var methods={
			
			//删除节点信息
	        beforeRemove:function(treeId, treeNode) {
	        	
	            //判断删除的时候是否还有子节点，如果有的话就从子节点开始删除
	            if (treeNode.children && treeNode.children.length > 0) {

	                yiDialog.a('请从子节点开始删除！');
	                return false;
	            }

	            var formId = '';
	            switch (treeNode.level) {
	                case 0:
	                    formId = 'sys_bizmodule';//第一层节点对应的页面为sys_bizmodule.htnl
	                    break;
	                case 1:
	                    formId = 'sys_menugroup';//第二层节点对应的页面为sys_menugroup.htnl
	                    break;
	                case 2:
	                    formId = 'sys_menuitem';//第三层节点对应的页面为sys_menuitem.htnl
	                    break;
	            }

	            var url = '/list/{0}?operationno=delete'.format(formId),
                    params = { selectedRows: [{ PKValue: treeNode.ids }] };

	            yiAjax.p(url, params,

		            function (r) {

		                //执行回调函数
		                if (r.operationResult.isSuccess) {

		                    //删除树控件中对应的节点
		                    var zTree = $.fn.zTree.getZTreeObj("menuZtree");
		                    zTree.removeNode(treeNode);
		                    zTree.refresh();
		                }
		            }
		        );

	            return false;
	        },
			
			//增加一个模块
			addOneModule:function(){
		    	
			    $('.caption.editor.add').hover(function () {
		    		$('.caption.hide_show').show();
		    	},function(){
		    		$('.caption.hide_show').hide();
		    	})
		    	
		    	var ztree=$.fn.zTree.getZTreeObj("menuZtree");
		    	
			  	var i=1;
		    	$(document).on('click','.caption.editor.add',function(){
		    		//给树结点添加属性
		    		var Attr={id: (100 + newCount),ids: '',order: newCount,icon:'',name:'newnode'+newCount,pId:'0',isParent:'true'};
		    		
		    		newNodes = ztree.addNodes(null, Attr);
		    		
		    		newCount++;
		    	})
		    }, 
			
		    //用于当鼠标移动到节点上时，显示用户自定义控件，显示隐藏状态同 zTree 内部的编辑、删除按钮
			addHoverDom: function (treeId, treeNode) {
				var that=this;
			    var sObj = $("#" + treeNode.tId + "_span");
			    if (treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0) return;
			    var addStr = "<span class='button add' id='addBtn_" + treeNode.tId
					+ "' title='add' onfocus='this.blur();'></span>";
			    sObj.after(addStr);
			    var btn = $("#addBtn_" + treeNode.tId);
			    if (btn) btn.bind("click", function () {

			        var zTree = $.fn.zTree.getZTreeObj("menuZtree");
			        //给树结点添加属性
			        var Attr={id:(100 + newCount),ids:'',icon:'',url:'',order:newCount,billcaption:'',billformId:'',
			        enableRAC:true,domaintype:'',helpCode:'',pId:treeNode.id,name:"newnode"+(newCount++)}
			        
			        var newNodes=zTree.addNodes(treeNode, Attr);
			        var ids=newNodes[0].getParentNode().ids
			        
			        if(!ids){
			            yiDialog.a('请保存当前结点信息！');
			        	zTree.removeNode(newNodes[0]);
			        	newCount--;
			        }
			        
			    });
			},

			//显示删除按钮
			showRemoveBtn:function(treeId, treeNode) {
				return treeNode;
			},
			
			//用于当鼠标移出节点时，隐藏用户自定义控件，显示隐藏状态同 zTree 内部的编辑、删除按钮
			removeHoverDom:function(treeId, treeNode) {
				$("#addBtn_"+treeNode.tId).unbind().remove();
			},
			
			//请求后台数据
			renderMenu:function (callback) {
		
		        var ListMenuUrl = '/dynamic/sys_mainfw?operationno=listmenu&format=json';
		
		        yiAjax.p(ListMenuUrl, null,
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
			
			//渲染三级菜单的所有数据到页面中的id名为zTree的div容器中
			fillDataToHtml:function(res){
				
				//将一级菜单数据进行排序
				res= res.sort(yiCommon.sortby('order'));
				
				//一级节点渲染，即最上层功能
				var oneSave={};//一级节点临时存储空间
				var treeNodes=[];
				var that=this;
				
				for(var i=0,l=res.length;i<l;i++){
					
					//给节点添加必须属性
					oneSave.id=i+1;
					oneSave.open=true;
					oneSave.isParent=true;
					oneSave.pId=0;
					
					//给树结点添加自定义属性（为了传数据给后台）
					oneSave.ids=res[i].id;
					
					var obj1=res[i];
					
					//将后台数据遍历并添加到当前结点上
					for(var k in obj1) {
 
					    //遍历对象，k即为key，obj1[k]为当前k对应的值
					    if(k!='id'){
					    	oneSave[k]=obj1[k]
					    }
					}
					
					treeNodes.push(oneSave);
					
					//当有二级功能的时候，就进行数据添加，没有就跳过。
					if(res[i].menuGroups.length>0){
						
						//对二级菜单数据进行排序
						res[i].menuGroups= res[i].menuGroups.sort(yiCommon.sortby('order'));
						
						//调用处理二级菜单方法,将二级菜单数组连接到整棵树的数组后面
						treeNodes=treeNodes.concat(methods.renderClass2(res[i].menuGroups,oneSave.id));
					}
					
					//一组放入数组中后，将其置空进行接收下组数据
					oneSave={};
				};
				
				methods.initTree(treeNodes);
			},
			
			//初始化左侧树插件
			initTree:function(treeNodes){
				$.fn.zTree.init($("#menuZtree"), {
					view: {
						addHoverDom: methods.addHoverDom,
						removeHoverDom:methods.removeHoverDom,
						selectedMulti: false// 禁止多点同时选中的功能
					},
					edit: {
						enable: true,
						showRemoveBtn:methods.showRemoveBtn
					},
					data: {
						simpleData: {
							enable: true
						}
					},
					callback: {
						onClick: methods.onClick,
						beforeRemove:methods.beforeRemove,
					}
				}, treeNodes);
					
			},
			
			//二级功能渲染，即上层功能相对于的子级功能
			renderClass2:function(obj,pid){
				
				var that=this,
					classTwo=obj,//二级功能
					twoArrSave=[],//二级存储空间
					twoSave={};//二级节点临时存储空间
				
				for(var i=0,l=classTwo.length;i<l;i++){
					
					//给节点添加必须属性
					twoSave.id=pid+''+(i+1);
					twoSave.isParent=true;
					twoSave.pId=pid;
					
					//给树结点添加自定义属性（为了传数据给后台）
					twoSave.ids=classTwo[i].id;
					
					var obj1=classTwo[i];
					
					//将后台数据遍历并添加到当前结点上
					for(var k in obj1) {
					    
					    if(k!='id'){  //遍历对象，k即为key，obj1[k]为当前k对应的值
					    	twoSave[k]=obj1[k]
					    }
					}
					
					twoArrSave.push(twoSave);
					
					if(classTwo[i].menuItems.length>0){
						
						//调用处理三级菜单方法,将三级菜单数组连接到二级菜单的数组后面
					    twoArrSave = twoArrSave.concat(methods.renderClass3(classTwo[i].menuItems, twoSave.id));
					}
					
					twoSave={};
				}
				
				return twoArrSave;
			},
			
		    //三级功能渲染，即次级功能相对于下级功能的
		    renderClass3:function(obj,pid){
		    	
		    	var that=this,
					classThree=obj,//三级功能
					threeArrSave=[],//三级存储空间
					threeSave={};//三级节点临时存储空间
				
				for(var i=0,l=classThree.length;i<l;i++){
					
					threeSave.id=pid+''+(i+1);
					threeSave.pId=pid;
					
					//给树结点添加自定义属性
					threeSave.ids=classThree[i].id;
					
					var obj1=classThree[i];
					
					//将后台数据遍历并添加到当前结点上
					for(var k in obj1) {
 						
					    //遍历对象，k即为key，obj1[k]为当前k对应的值
					    if(k!='id'){
					    	threeSave[k]=obj1[k];
					    }
					}
					
					threeArrSave.push(threeSave);
					
					threeSave={};
				}
				
				return threeArrSave;
		    },
			
			//默认显示的页面
			defaultShow:function(){
				
				var treeObj=$.fn.zTree.getZTreeObj("menuZtree");
		    	
		    	var valForParent=treeObj.getNodes()[0];
		    	
		    	//默认显示的页面为第一个结点对应的页面
		    	var Url='sys_bizmodule';
		    	
		    	methods.showPage(Url,valForParent);
			},
			
			//点击左边的树菜单显示相应的页面
		    onClick:function(event, treeId, treeNode){
		    	
		    	var level=treeNode.level,Url;
		    	
		    	//不同业务模块对应的页面
	    		switch (level){
    				case 0: Url='sys_bizmodule'
    					break;
    				case 1: Url='sys_menugroup'
    					break;
    				case 2: Url='sys_menuitem'
    					break;
    			}
	    		
	    		methods.showPage(Url,treeNode);	
		    },
		    
		    //初始时默认显示的页面为系统管理模块页面
		    showPage:function(Url,val){
		    	
		    	var treeObj=$.fn.zTree.getZTreeObj("menuZtree"),
		    		valForParent1=treeObj.getNodes()[0],//树的第一个结点
		    		valForParent2=treeObj.getSelectedNodes()[0],//被选中的结点
		    		valForParent,
		    		url='/views/sys/'+Url+'.html';
		    	
                //判断是默认情况还是点击树形菜单的情况
		    	if(val==valForParent1){
		    		
		    		valForParent=valForParent1;
		    		
		    	}else{
		    		
		    		valForParent=valForParent2;
		    	};
		    	
		    	yiAjax.gf(url, {},
		    	
	                function (data) {
	                	
	                	var result = $(data).find("form");
				        var result0 = result.eq(0);
				        
			            $("#form").html(result);
			            
			            //当前结点的父节点
			            var parentNode=valForParent.getParentNode();
			            
			            var len=result0.find('input').length;
			            
			            //将树结点上的自定义属性动态加载到页面input中
			            for(var i=0;i<len;i++){
			            	
			            	var Attr=result0.find('input').eq(i).attr('id');
			            		
			            	result0.find('input').eq(i).val(valForParent[Attr]);
			            };
			            
			            //groupid和moduleid为父级结点的name属性而不是当前结点对应的属性值，所以区分对待
			            if(parentNode){
			            	
				            $('#groupid').val(valForParent.getParentNode().name);
				            $('#moduleid').val(valForParent.getParentNode().name);
			            };
	            		
	            		//当页面值改变时，动态改变对应的树结点的自定义属性
	            		$('#form input').change(function(){
	            			
	            			var Attr=$(this).attr('id');
	            				
	            			valForParent[Attr]=$(this).val();
            				
            				//改变后进行对树结点刷新
            				treeObj.updateNode(valForParent);
	            		});
	            		
	            		methods.submit(result0,valForParent,Url);
	                },
	                
	                function (m) {
	                    //提示错误信息
	                    yiDialog.m('页面获取出错！');
	                    
	                }
	            );
		    },
		    
		    //提交
		    submit:function(r,val,Url){
		    	
		    	var Submit=r.find('#submit');
				var url='/bill/'+Url+'?operationno=save'
				
	            Submit.click(function(){
					
	                var billData =methods.getBizmoduleInfo(r,val);
						
					//将对象转为字符串的形式
					billdataStr=JSON.stringify(billData);
							
					params={billdata:billdataStr};
						
		            yiAjax.p(url, params,
		            	
		                function () {
		                    //执行回调函数
		                    yiDialog.m('提交成功！', 'success');
		                },
		                function (m) {
		                    //提示错误信息
		                    yiDialog.m('显示页面出错！');
		                    
		                }
		            );
				});
		    },
		    
		    //获取页面数据并进行打包
		    getBizmoduleInfo:function(r,val) {
		    	
				var billData=[],
					data={};
					
					if(val.ids!=''){
						id=val.ids;
						data.id=id;
					}
					var parentNode=val.getParentNode();
					
					var len=r.find('input').length;
			            
		            //将树结点上的自定义属性动态加载到页面input中
		            for(var i=0;i<len;i++){
		            	
		            	var Attr=r.find('input').eq(i).attr('id');
		            	
		            	if(Attr!='id'){
		            		
		            	 	Attr='f'+Attr;
		            	 	
		            		data[Attr]=$.trim(r.find('input').eq(i).val());
		            	}
		            };
		            
		            //groupid和moduleid为父级结点的ids属性而不是input中的值，所以区分对待
		            if(parentNode){
		            	
		            	data.fgroupid=val.getParentNode().ids;
		            	data.fmoduleid=val.getParentNode().ids;
		            };
	                
                billData.push(data);
                data={};
                
                return billData;
					
			},
		};
		var _child = function (args) {
	        var that = this;
	        
	        _super.call(that, args);
	        
	        that.pageFile = '/views/sys/sys_menueditor.html';
	        
			//获取后台数据后,对相应函数调用并进行数据渲染
			that.init= function () {
			    //调用请求后台数据函数
		        methods.renderMenu(function (data) {
		            
		            //用变量接收后台数据
		            var res = data.operationResult.srvData;
					
		            //调用树菜单函数并把后台接收的数据传递过去
					methods.fillDataToHtml(res);
					
					//调用默认显示页面
					methods.defaultShow();
		            
		            //当树形菜单没有数据时，增加一个
		            methods.addOneModule();
		            
		        });
		    };
		};
		__extends(_child, _super);
	    return _child;
    })(BasePage);
    window.sys_menueditor = window.sys_menueditor || sys_menueditor;
})();