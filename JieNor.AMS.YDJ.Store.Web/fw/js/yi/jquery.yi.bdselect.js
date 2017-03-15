/*
    1.插件用途：用于基础资料控件快速选择数据
    
    2.使用方法：$(selector).bdSelect();
*/
//@ sourceURL=/fw/js/yi/jquery.yi.bdselect.js
; (function ($, window, document, undefined) {

    //默认参数
    var defaults = { domainType: '', formId: '', pageId: '', onBdSelect: null, onFieldValueChanged: null, isBillHeader: true };
	var page=1;
    //插件代码
    $.fn.bdSelect = function (options) {

        //遍历当前所选择的 Dom 元素，并提供链式操作
        return this.each(function () {

            //合并默认参数，但是不影响默认参数（保护好默认参数）
            var settings = $.extend({}, defaults, options);

            //当前文本框控件（后续所有操作都是围绕这个文本框控件展开的）
            var $txt = $(this),

                //获取控件的 name 属性值  fieldKey 就是这个控件的 name 属性值 
                name = $txt.attr('name'),

                //选择时要触发的事件名称
                onBdSelect = $txt.attr('onBdSelect'),

                //下拉表格上下键导航索引号，默认为 -1
                rowIndex = -1;

            //如果存在触发的 onBdSelect 事件，则将事件合并到 settings 中
            if (settings.page && onBdSelect) {
                settings.onBdSelect = settings.page[onBdSelect];
            }
            if (settings.page && settings.page.onFieldValueChanged) {
                settings.onFieldValueChanged = settings.page.onFieldValueChanged;
            }

            //在文本框上面显示一个“放大镜”操作（用于弹窗选择基础资料）
            var $btn;
            if (settings.isBillHeader) {
                $btn = $('<span class="input-group-addon"><i class="fa fa-search"></i></span>');
            } else {
                $btn = $('<span class="bd-select-icon"><i class="fa fa-search"></i></span>');
            }
            $txt.after($btn);

            //文本框下面的“下拉表格”
            var $drop = $('<div class="table-scrollable bd-select-table"></div>');
            $drop.appendTo('body');

            //点击列表行时，将获取当前点击行的 pkid 和 name 绑定到 input 元素上
            $drop.on('click', 'table tbody tr', function () {
                rowIndex = $(this).index();
                $(this).addClass('ui-state-highlight').siblings().removeClass('ui-state-highlight');

                //在点击表格后，表格自动消失
                $drop.hide();
				page=1;
                //给控件设置值
                setValue($(this), $txt, settings);
            })

            //选择匹配规则 和 记录数时
            $drop.on('change', 'div select', function () {
                getDatas($txt, $drop, settings);
                page=1;
            });
			
			//请求的是下一页，返回的数据要追加到这个表格里 的。
            $drop.on('click', 'div a', function () {
                getDatas($txt, $drop, settings,'more');
            });
            
            //处理放大镜按钮
            procSelectBtn($btn, $txt, name, settings);

            //延时事件
            var timer;

            //在文本框中按下键盘时
            $txt.off('keydown').on('keydown', function (e) {
				page=1;
                //如果按键不是“回车键”和“上下键”，则不处理
                if (e.which !== 13 && e.which !== 38 && e.which !== 40) {
                    return;
                }

                //如果按键不是“下键”且 下拉表格不可见，则不处理
                if (e.which !== 40 && !$drop.is(':visible')) {
                    return;
                }

                //下拉表格的总行数
                var rows = $('table tbody .jqgrow', $drop);

                //当前按下的键
                switch (e.which) {
                    //上键
                    case 38:
                        rowIndex = rowIndex <= 0 ? rows.length - 1 : rowIndex - 1;
                        break;
                        //下键
                    case 40:
                        //下拉表格不可见
                        if (!$drop.is(':visible')) {
                            //重置下拉表格上下键导航索引号
                            rowIndex = -1;
                            //移除下拉表格选中行颜色
                            rows.removeClass('ui-state-highlight');
                            //显示下拉表格
                            $drop.show();
                            return;
                        }
                        rowIndex = rowIndex === rows.length - 1 ? 0 : rowIndex + 1;
                        break;
                        //Enter键
                    case 13:
                        rows.each(function () {
                            //按下回车键，将该条单据的信息绑定在input元素中
                            if ($(this).hasClass('ui-state-highlight')) {
                                //给控件设置值
                                setValue($(this), $txt, settings);
                            }
                            //隐藏下拉表格
                            $drop.hide();
                            
                        });
                        return;
                }

                //设置下拉表格行样式
                if (rowIndex >= 0) {
                    rows.each(function (index, element) {
                        if (index === rowIndex) {
                            $(this).addClass('ui-state-highlight');
                            //给控件设置值
                            setValue($(this), $txt, settings);
                        } else {
                            $(this).removeClass(' ui-state-highlight');
                        }
                    });
                }

            }).off('keyup').on('keyup', function (e) {

                //如果当前按下的不是“Tab键，Enter键，上下左右”键，则需要异步查询数据
                if (e.which !== 9 && e.which !== 13 && e.which !== 37 && e.which !== 38 && e.which !== 39 && e.which !== 40) {

                    //重置下拉表格上下键导航索引号
                    rowIndex = -1;

                    //清除该控件的 keyId 属性值，以免控件值不同步的情况
                    $(this).attr('keyId', '');

                    //只在最后一个字符输入后进行数据请求
                    clearTimeout(timer);

                    //当在文本框内输入内容时，延时一定的毫秒数后再发送请求查询数据
                    timer = setTimeout(function () {

                        //如果文本框可见，才去后端请求数据（为了防止在表格编辑中频繁操作而导致的无用请求）
                        if ($txt.is(':visible')) {

                            getDatas($txt, $drop, settings);
                        }
                    }, 300);
                }
            });

            //浏览器缩放时调整下拉表格的位置
            $(window).resize(function () {
                setDropPostion($txt, $drop, settings);
            });
        });
    };

    //处理放大镜按钮
    function procSelectBtn($btn, $txt, name, sets) {
        //如果文本框可用
        if (!$btn) { return; }
        if (!$txt.is(':enabled')) {
            $btn.css('cursor', 'not-allowed');
            return;
        }
        //则给对应的“选择”按钮绑定点击事件
        $btn.click(function () {

            var args = {
                domainType: sets.domainType,
                formId: sets.formId,
                pageId: sets.pageId,
                fieldKey: name,
                extra: {
                    callback: function (datas) {
                        //如果没有选择数据，则终止后续操作
                        if (!datas || datas.length <= 0) {
                            return;
                        }
                        //设置基础资料控件的 名称（value）和 值（keyId）
                        $txt.val(datas[0].fname).focus().blur().attr('keyId', datas[0].fbillhead_id);

                        //如果是单据头，则默认返回选中中的第一条记录
                        if (sets.isBillHeader) {

                            //触发 onBdSelect 事件
                            $.isFunction(sets.onBdSelect) && sets.onBdSelect(datas);

                            $.isFunction(sets.onFieldValueChanged) && sets.onFieldValueChanged({ fieldName: name, values: datas });

                        } else {

                            //单据体，则返回所有选中记录（以便实现多选）

                            //触发 onBdSelect 事件
                            $.isFunction(sets.onBdSelect) && sets.onBdSelect(datas);

                            $.isFunction(sets.onFieldValueChanged) && sets.onFieldValueChanged({ fieldName: name, values: datas });
                        }
                    }
                }
            }

            //点击“选择”按钮时弹窗  new QuerySelector(args)
            yiCacheScript.g('/fw/js/platform/formop/queryselector.js', function () {
                new QuerySelector(args);
            });

        }).css('cursor', 'pointer');
    }

    //设置控件值
    function setValue($tr, $txt, sets) {

        var tableId = $tr.closest('table').attr('id'),
            rowId = $tr.attr('id'),
            row = $('#' + tableId).jqGrid('getRowData', rowId);

        $txt.attr({ keyId: row.fbillhead_id, keyNumber: row.fnumber }).val(row.fname);

        //触发 onBdSelect 事件
        $.isFunction(sets.onBdSelect) && sets.onBdSelect([row]);

        //触发 onFieldValueChanged 事件
        $.isFunction(sets.onFieldValueChanged) && sets.onFieldValueChanged({ fieldName: $txt.attr('name'), values: [row] });
    }

    //获取数据
    function getDatas($txt, $drop, sets,type) {
        //地址
        var url = '/{0}/{1}?operationno=fuzzyquery'.format(sets.domainType, sets.formId);
        //如果点击更多按钮的时候，page增加一，请求下一页数据
        if(type=='more'){
        	page+=1;
        }
        //参数
        var params = getParams($txt, $drop);
        yiAjax.p(url, params,
            function (r) {
            	//请求的返回结果pageindex把page替换
        		if(r.operationResult.srvData.setting.pageIndex!=undefined){
        			page=r.operationResult.srvData.setting.pageIndex;
        		}
                //如果文本框可见，才需要构建下拉表格（为了防止在表格编辑中频繁操作而导致的下拉表格位置错误）
                if ($txt.is(':visible')) {
                	//如果不是更多按钮，则生成表格
                	if(type != 'more'){
                		
                		//生成表格
                    	buildDrop($txt, $drop, sets, r);
                	}
                	//如果是更多按钮，则请求下一页数据并填充到表格中。
                	else{
                		//获取查询表格的id
                		var name=$drop.find('table').eq(1).attr('id'),
	                    //获取当前数据源
	                    	source=yiGrid.getDataSource(name),
	                    	//进行数据的拼接
	                    	allSource=source.concat(r.operationResult.srvData.data);
	                    //数据的渲染
	                    $('#'+name).jqGrid('clearGridData');  //清空表格
						$('#'+name).jqGrid('setGridParam',{  // 重新加载数据
						      datatype:'local',
						      data : allSource,   //  allSource 是符合格式要求的需要重新加载的数据 
						}).trigger("reloadGrid");
                	}
                    
                }
            }, null, null, null
        );
    }
    
    //获取查询参数
    function getParams($txt, $drop) {
        return {
            simpledata: {
            	//分页
				pageindex:page,
                //基础资料字段名称
                fieldkey: $txt.attr('name'),

                //文本框输入的关键字
                searchkey: $.trim($txt.val()),

                //匹配规则
                matchrule: $drop.find('div select').eq(0).val(),

                //匹配的记录数
                fetchcount: $drop.find('div select').eq(1).val()
            }
        };
    };

    //设置下拉表格的位置
    function setDropPostion($txt, $drop, sets) {
        //如果是可见的
        if ($drop.is(':visible')) {
            var txtt = $txt.offset().top,
                txtl = $txt.offset().left,
                txtw = $txt.outerWidth(),
                txth = $txt.outerHeight(),
                dropw = $drop.outerWidth(),
                droph = $drop.outerHeight(),
                top = txtt + txth + droph,
                left = txtl,
                bw = $('body').outerWidth(),
                bh = $('body').outerHeight();
            //如果下方放不下，则放置在上方
            top = top >= bh ? txtt - droph : txtt + txth;
            //如果右边放不下，则放置在左边
            if (txtl + dropw > bw) {
                left = left - dropw + txtw;
                //如果单据头，则加上放大镜按钮的宽度
                if (sets.isBillHeader) {
                    left += $txt.siblings('.input-group-addon').outerWidth() - 1;
                } else {
                    left++;
                }
            }
            //重新设置下拉表格的位置
            $drop.css({ top: top - 10 + 'px', left: left + 'px' });
        }
    }

    //获取列数组
    function getColModel(lm) {

        //列数组
        var columns = [];

        //默认添加主键ID列，但该列是隐藏的，主要用于列表选择数据
        columns.push({ label: '主键ID', name: 'fbillhead_id', hidedlg: true, hidden: true });

        //遍历列表结构信息
        for (var i = 0, l = lm.length; i < l; i++) {
            //如果不可见
            if (!lm[i].visible) {
                //则不需要创建列
                continue;
            }
            //根据列表结构信息创建列对象
            columns.push({
                classes: 'ui-ellipsis', //设置列的 css 单元格内容多余时显示“...”
                label: lm[i].caption, //标题
                name: lm[i].id, //名称
                index: lm[i].id, //排序字段名称（暂时默认与字段名称相同）
                align: lm[i].align, //对齐方式
                width: lm[i].width, //宽度
                sortable: lm[i].allowSort, //是否允许排序
                fixed: true //列宽度是否要固定不可变
            });
        }

        //返回列数组
        return columns;
    }

    //构建下拉表格
    function buildDrop($txt, $drop, sets, r) {

        //下拉表格Id
        var dropTabId = $txt.attr('name') + '_' + yiCommon.uuid(),
            sd = r.operationResult.srvData;
        $drop.html('<table id="' + dropTabId + '"></table>')
            .append(buildFooter(sd.setting)).show();
        //计算所有列的总宽度
        var colWidth = 0, lm = sd.columns;
        for (var i = 0, l = lm.length; i < l; i++) {
            if (lm[i].visible) {
                colWidth += lm[i].width;
            }
        }

        //初始化下拉表格
        $("#" + dropTabId).jqGrid({
            width: '100%',
            height: colWidth > $drop.width() ? 187 : 170,
            datatype: "local",
            autowidth: true,
            rowNum: 1000,
            sortable: true,
            data: sd.data,
            colModel: getColModel(lm)
        });

        //设置下拉表格位置
        setDropPostion($txt, $drop, sets);
    }

    //构建表尾
    function buildFooter(setting) {

        var $tfooter = $(
        '<div class="clearfix">\
		    <div class="pull-left">\
                <select class="form-control">\
                    <option value="llike">左匹配</option>\
                    <option value="rlike">右匹配</option>\
                    <option value="like">全模糊查询</option>\
                </select>\
            </div>\
            <div class="pull-right">\
                <div class="form-control">\
                	<a href="javascript:;" class="btn btn-xs btn-primary">更多</a>\
                </div>\
            </div>\
		    <div class="pull-right">\
                <select class="form-control">\
                    <option value="5">5</option>\
                    <option value="10">10</option>\
                    <option value="15">15</option>\
                    <option value="20">20</option>\
                    <option value="25">25</option>\
                </select>\
            </div>\
		</div>');

        //如果匹配规则没有，则默认为左匹配
        $tfooter.find('select').eq(0).val(setting.matchRule ? setting.matchRule : 'llike');

        //如果记录数没有，则默认为显示5条
        $tfooter.find('select').eq(1).val(setting.fetchCount ? setting.fetchCount : 5);

        return $tfooter;
    }

    //页面加载时
    $(document).ready(function () {

        //整个 document 的点击事件
        $(document).on("click", function (e) {
            //如果点击的不是“下拉表格本身”的话
            if ($(e.target).closest('.bd-select-table').length === 0) {
                //则隐藏下拉表格
                $('.bd-select-table').hide();
            }
        });
    });

})(jQuery, window, document);