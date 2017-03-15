/// <reference path="/fw/js/basepage.js" />
; (function () {
    var bd_enumeditor = (function (_super) {

        var newCount = 1;
        var gridId;
        //公用方法
        var methods = {
            //结点重命名
            beforeRename: function (treeId, treeNode, newName, isCancel) {

                if (newName.length == 0) {
                    setTimeout(function () {
                        var zTree = $.fn.zTree.getZTreeObj("enumZtree");
                        zTree.cancelEditName();
                        yiDialog.a('节点名称不能为空！');
                    }, 0);
                    return false;
                }
                return true;
            },

            //增加一个模块
            addOneModule: function () {

                $('.caption.enum.add').hover(function () {
                    $('.caption.hide_show').show();
                }, function () {
                    $('.caption.hide_show').hide();
                })

                var ztree = $.fn.zTree.getZTreeObj("enumZtree");

                var i = 1;
                $(document).on('click', '.caption.enum.add', function () {
                    //给树结点添加属性
                    var Attr = { id: (100 + newCount), ids: '', order: newCount, icon: '', name: 'newnode' + newCount, pId: '0', isParent: 'true' };

                    newNodes = ztree.addNodes(null, Attr);

                    newCount++;
                })
            },

            //显示重命名按钮
            showRemameBtn: function (treeId, treeNode) {
                return treeNode;
            },

            //用于当鼠标移出节点时，隐藏用户自定义控件，显示隐藏状态同 zTree 内部的编辑、删除按钮
            removeHoverDom: function (treeId, treeNode) {
                $("#addBtn_" + treeNode.tId).unbind().remove();
            },

            //请求后台数据
            renderMenu: function (callback) {

                var ListMenuUrl = '/dynamic/bd_enum?operationno=loadcategory&format=json';

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

            //渲染三级菜单的所有数据到页面中的id名为enumZtree的div容器中
            fillDataToHtml: function (res) {

                //将一级菜单数据进行排序
                res = res.sort(yiCommon.sortby('order'));

                //一级节点渲染，即最上层功能
                var oneSave = {};//一级节点临时存储空间
                var treeNodes = [];
                var that = this;

                for (var i = 0, l = res.length; i < l; i++) {

                    //给节点添加必须属性
                    oneSave.id = i + 1;
                    oneSave.open = true;
                    oneSave.isParent = true;
                    oneSave.pId = 0;

                    //给树结点添加自定义属性（为了传数据给后台）
                    oneSave.name = res[i];

                    treeNodes.push(oneSave);

                    //一组放入数组中后，将其置空进行接收下组数据
                    oneSave = {};
                };

                methods.initTree(treeNodes);
            },

            //初始化左侧树插件
            initTree: function (treeNodes) {
                $.fn.zTree.init($("#enumZtree"), {
                    view: {
                        selectedMulti: false// 禁止多点同时选中的功能
                    },
                    edit: {
                        enable: true,
                        showRemoveBtn: methods.showRemoveBtn,
                        showRenameBtn: methods.showRenameBtn,
                    },
                    data: {
                        simpleData: {
                            enable: true
                        }
                    },
                    callback: {
                        onClick: methods.onClick,
                        beforeRename: methods.beforeRename,
                    }
                }, treeNodes);
            },
            //右边表格页面
            rightTablePage: function (opData, that) {
                //表格ID
                gridId = that.getJqGridId('fenumentry');
                //console.log(status)
                //初始化明细表格
                yiGrid.init(gridId, {
                    //数据源
                    data: yiGrid.extractEntry(opData, 'fenumentry'),
                    multiselect: true,
                    defRow:0,
                    jsonReader: { id: 'fid' },
                    //定义表格列
                    colModel: [
                        {
                            label: "行id", name: "fid", width: 80, editable: false, align: "center", fixed: true,
                            editrules: { required: false },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 80,
                                custom_value: yiGrid.strCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.strCustomElement(val, opt).on('change', function (e) {

                                    });
                                }
                            }
                        },
                    	{
                    	    label: "类别", name: "fcategory", width: 110, editable: false, align: "center", fixed: true,
                    	    editrules: { required: false },
                    	    edittype: 'custom',
                    	    editoptions: {
                    	        maxlength: 80,
                    	        custom_value: yiGrid.strCustomValue,
                    	        custom_element: function (val, opt) {
                    	            return yiGrid.strCustomElement(val, opt).on('change', function (e) {

                    	            });
                    	        }
                    	    }
                    	},
                        {
                            label: "值", name: "fenumitem", width: 110, editable: true, align: "center", fixed: true,
                            editrules: { required: false },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 80,
                                custom_value: yiGrid.strCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.strCustomElement(val, opt).on('change', function (e) {

                                    });
                                }
                            }
                        },
                        {
                            label: "显示顺序", name: "forder", width: 110, editable: true, align: "center", fixed: true,
                            editrules: { required: false },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 80,
                                custom_value: yiGrid.strCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.strCustomElement(val, opt).on('change', function (e) {

                                    });
                                }
                            }
                        },
                        {
                            label: "状态", name: "fforbidstatus", width: 110, editable: false, align: "center", fixed: true,
                            editrules: { required: false },
                            edittype: 'custom',
                            editoptions: {
                                maxlength: 80,
                                custom_value: yiGrid.strCustomValue,
                                custom_element: function (val, opt) {
                                    return yiGrid.strCustomElement(val, opt).on('change', function (e) {

                                    });
                                }
                            }
                        }
                    ]
                });
                $('#' + gridId).jqGrid().hideCol('fid');
            },

            //默认显示的数据
            defaultShow: function () {

                var treeObj = $.fn.zTree.getZTreeObj("enumZtree");

                var nodes = treeObj.getNodes()[0];//树的第一个结点

                var url = '/dynamic/bd_enum?operationno=loaddetail&category=';

                if (nodes) {

                    yiAjax.p(url + nodes.name, null,

		                function (r) {
		                    //执行回调函数
		                    var status = r.operationResult.srvData;
		                    $('#' + gridId).jqGrid('setGridParam', { data: status }).trigger('reloadGrid');

		                },
		                function (m) {
		                    //提示错误信息
		                    yiDialog.m('显示页面出错！');
		                }
		            );
                }
            },
            //点击左边的树菜单显示相应的页面
            onClick: function (event, treeId, treeNode) {

                var url = '/dynamic/bd_enum?operationno=loaddetail';

                var params = {
                    simpledata: {
                        category: treeNode.name
                    }
                }

                yiAjax.p(url, params,

                     function (r) {
                         //执行回调函数
                         var status = r.operationResult.srvData
                         
                         if (status && status.length) {
                             //由于每条数据的行数可能不一致，填充数据之前先对其进行清除
                             $('#' + gridId).jqGrid().clearGridData(true);
                             $('#' + gridId).jqGrid('setGridParam', { data: status }).trigger('reloadGrid');
                         } else {

                             status = [
                                 {fid: '', fcategory: treeNode.name, fenumitem: '', forder: '', fforbidstatus: '0' },
                                 {fid: '', fcategory: treeNode.name, fenumitem: '', forder: '', fforbidstatus: '0' },
                                 {fid: '', fcategory: treeNode.name, fenumitem: '', forder: '', fforbidstatus: '0' }
                             ]
                             //由于每条数据的行数可能不一致，填充数据之前先对其进行清除
                             $('#' + gridId).jqGrid().clearGridData(true);

                             $('#' + gridId).jqGrid('setGridParam', { data: status }).trigger('reloadGrid');
                         }


                     },
                     function (m) {
                         //提示错误信息
                         yiDialog.m('显示页面出错！');
                     }
                );
            },

            //点击按钮提交的数据
            submitData: function () {

                var url, params, forbidStatus, ids;
                var that = this;

                //点击保存则保存当前表格所有数据
                $('#enumSubmit').on('click', function () {
                    //获取所有行的ID
                    var ids = $('#' + gridId).jqGrid('getDataIDs');
                    forbidStatus = '0';
                    url = '/bill/bd_enum?operationno=save';
                    params = methods.getInfo(ids, forbidStatus);

                    methods.Submit(url, params);
                });

                //点击禁用则保存当前选中行的数据
                $('#enumForbid').on('click', function () {

                    ids = $('#' + gridId).jqGrid("getGridParam", "selarrrow");
                    
                    if (ids.length <= 0) {

                        yiDialog.a('请选择一行或多行数据！');
                    } else {

                        url = '/bill/bd_enum?operationno=forbid';
                        forbidStatus = '1';
                        params = methods.getInfo(ids, forbidStatus);

                        methods.Submit(url, params);
                    }
                });

                $('#' + gridId).on('click', '.ui-icon-trash', function (e) {
                    var fid = $(this).parent().next().html();

                    //提示用户
                    yiDialog.c('您确定要删除吗？', function () {
                        //地址
                        var url = '/bill/bd_enum?operationno=delete';

                        //传递到服务端的主键ID数组
                        params = { selectedRows: [] };

                        params.selectedRows.push({ PKValue: fid });

                        methods.Submit(url, params);
                    });
                });

                //点击新增
                $('#' + gridId).on('click', '.ui-icon-plus', function (e) {
                    var category = $(this).parents('tr').children('td').eq(4).html();
                    $(this).parents('tr').prev().children('td').eq(4).html(category);
                    $(this).parents('tr').prev().children('td').eq(-1).html('0');
                });
            },

            //传递给后台的参数
            getInfo: function (ids, forbidStatus) {

                var params, billdata = [], data = {}, rowData;
                
                for (var i = 0; i < ids.length; i++) {

                    rowData = $('#' + gridId).jqGrid('getRowData', ids[i]);
                    
                    if (rowData.fid != '') {
                        data.id = rowData.fid;
                    }
                    data.fcategory = rowData.fcategory;

                    data.fenumitem = rowData.fenumitem;

                    if (forbidStatus) {
                        data.fforbidstatus = forbidStatus;
                    } else {
                        data.fforbidstatus = rowData.fforbidstatus;
                    }
                    billdata.push(data);
                    data = {};
                };

                //将对象转为字符串的形式
                billdataStr = JSON.stringify(billdata);

                params = { billdata: billdataStr };
                
                return params;

            },
            //保存表格数据
            Submit: function (url, params) {

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
            }
        };
        var _child = function (args) {
            var that = this;

            _super.call(that, args);

            that.pageFile = '/views/bas/bd_enumeditor.html';
            //获取后台数据后,对相应函数调用并进行数据渲染
            that.init = function () {
                //调用请求后台数据函数
                methods.renderMenu(function (data) {

                    //初始化
                    that.initBill(that.opData);
                    //用变量接收后台数据
                    var res = data.operationResult.srvData;

                    //调用树菜单函数并把后台接收的数据传递过去
                    methods.fillDataToHtml(res);

                    methods.defaultShow();

                    methods.rightTablePage(that.opData, that)

                    //当树形菜单没有数据时，增加一个
                    methods.addOneModule();

                    methods.submitData();
                });
            };
        };
        __extends(_child, _super);
        return _child;
    })(BasePage);
    window.bd_enumeditor = window.bd_enumeditor || bd_enumeditor;
})();