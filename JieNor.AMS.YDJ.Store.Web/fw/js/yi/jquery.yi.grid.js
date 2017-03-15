/*
    对 jqGrid 表格控件的二次包装
*/
var yiGrid = {

    //初始化表格
    init: function (gid, options) {

        //默认参数
        var defaults = {
            //宽度
            width: '100%',
            //高度
            height: '100%',
            //从服务器端返回的数据类型，此处设置为本地数组
            datatype: "local",
            //如果为ture则数据只从服务器端抓取一次，之后所有操作都是在客户端执行，翻页功能会被禁用
            loadonce: true,
            //定义是否自动宽度（仅初始化表格时有效，后续浏览器大小缩放时需额外处理）
            autowidth: true,
            //分页时每页显示的记录数，明细不需要分页，所以设置为一个尽可能大的数，以便显示所有数据
            rowNum: 1000,
            //定义是否显示序号
            rownumbers: true,
            //序号列宽度
            rownumWidth: 30,
            //定义是否可以排序
            sortable: true,
            //添加行后要执行的回调函数
            onAfterAdding: null,
            //删除行后要执行的回调函数
            onAfterDeleting: null,
            /*
                当用户点击当前行在未选择此行时触发。rowid：此行id；e：事件对象。返回值为ture或者false。
                如果返回true则选择完成，如果返回false则不会选择此行也不会触发其他事件
            */
            beforeSelectRow: function (rowId, e) {
                //这里返回 false 禁止选中行
                //return false;
            },
            //单元格选择时触发的事件
            onCellSelect: function (rowId, cellIndex, cellContent, e) {

                var gidt = this.id, gst = '#' + gidt,
                    doptst = yiGrid.getOptions(gidt);

                //如果不允许新增 并且 也不允许编辑，则终止后续操作
                if (!doptst.allowAdd && !doptst.allowEdit) { return; }

                //如果点击的是序号列或操作列，则先保存正在编辑的行后终止后续操作
                var colName = this.p.colModel[cellIndex].name, editRowId = $(this).attr('editRowId');
                if (colName === 'rn' || colName === 'cb' || colName === 'operate') {
                    if (editRowId) {
                        //保存当前编辑行
                        yiGrid.saveRow(gst, editRowId);
                    }
                    return false;
                }

                //当前点击行如果不是正在编辑的行，则先保存正在编辑的行，再将当前点击行启用编辑
                if (editRowId && editRowId !== rowId) {
                    var saveOk = $(gst).jqGrid('saveRow', editRowId, true, 'clientArray');
                    if (!saveOk) {
                        return false;
                    }
                    $('#' + editRowId, gst).removeClass('ui-state-hover').find('td').css('padding', '');
                }
                $(gst).attr('editRowId', rowId).jqGrid('editRow', rowId, false);

                //点击某行的第一个单元格，目的是将其设置为编辑状态
                function clickRowCell(rowId, e, ci) {
                    $('#' + rowId, gst).find('td:visible')
                        .not('[aria-describedby="' + gidt + '_rn"]')
                        .not('[aria-describedby="' + gidt + '_cb"]')
                        .not('[aria-describedby="' + gidt + '_operate"]').eq(ci).click();
                    //阻止默认行为（主要是为了阻止按Tab键时焦点定位问题）
                    e.preventDefault();
                }

                //当前点击的单元格
                var $td = $(e.target),
                //当前编辑行中所有可见的 input 元素
                inputs = $td.closest('tr').find('input:visible:enabled');

                //自动选中当前点击的单元格对应的文本框内容，如果单元格不可编辑，则选中后面可编辑的文本框中的第一个文本框的内容
                var $tdInput = $td.find('input');
                if ($tdInput.length > 0) {
                    $tdInput.focus().select();
                } else {
                    $td.nextAll().find('input:visible:enabled').eq(0).select();
                }

                //编辑行的文本框获得焦点时自动选中文本框内容
                inputs.on('focus', function (e) {
                    $(this).select();
                }).on('keydown', function (e) {
                    //当前编辑控件的索引号
                    var currIndex = inputs.index(this), nextRowId, cursor_p;
                    switch (e.which) {
                        case 9: //Tab键
                        case 13: //回车键
                            //如果已经是最后一个编辑控件
                            if (currIndex === inputs.length - 1) {
                                //下一行ID
                                nextRowId = $(this).closest('tr').next().attr('id');
                                //如果能取到下一行的ID，说明还不是最后一行，否则自动新增一行
                                if (nextRowId) {
                                    //滚动到最左边
                                    $(gst).closest('.ui-jqgrid-bdiv').scrollLeft(0);
                                    //保存当前行
                                    yiGrid.saveRow(gst, rowId);
                                    //自动点击下一行的第一个单元格，将其设置为编辑状态
                                    clickRowCell(nextRowId, e, 0);
                                } else {
                                    //如果允许新增
                                    if (doptst.allowAdd) {
                                        //滚动到最左边
                                        $(gst).closest('.ui-jqgrid-bdiv').scrollLeft(0);
                                        //在当前编辑行后面新增一行
                                        nextRowId = yiGrid.addRow(gidt, rowId, 'after', sets.onAfterAdding);
                                        //自动点击新增行的第一个单元格，将其设置为编辑状态
                                        clickRowCell(nextRowId, e, 0);
                                    } else {
                                        //保存当前行，并结束表格编辑状态
                                        yiGrid.saveRow(gst, rowId);
                                    }
                                }
                            } else {
                                //如果当前不是最后一个编辑控件，并且是回车键
                                if (e.which === 13) {
                                    //则将焦点移到下一个编辑控件中
                                    inputs.eq(currIndex + 1).focus();
                                }
                            }
                            break;
                        case 27: //Esc键
                            //保存当前行，并结束表格编辑状态
                            yiGrid.saveRow(gst, rowId);
                            break;
                            //左键
                        case 37:
                            //如果是 alt + 左键
                            if (e.altKey) {
                                inputs.eq(currIndex - 1).focus().select();
                                //阻止浏览器的默认行为，因为 alt + left 也是浏览器的快捷键
                                e.preventDefault();
                            } else {
                                cursor_p = yiCommon.getCursorPosition(this);
                                //如果光标的位置等于0，说明光标已经到了文本框最后面
                                if (cursor_p == 0) {
                                    ////则将焦点移到上一个编辑控件中
                                    //var $pipt = inputs.eq(currIndex - 1);
                                    ////将光标定位到编辑控件的内容的最后面
                                    //yiCommon.setCursorPosition($pipt[0], $pipt.val().length);
                                    setTimeout(function () {
                                        inputs.eq(currIndex - 1).focus().select();
                                    }, 0);
                                }
                            }
                            break;
                            //上键
                        case 38:
                            //上一行ID
                            var $tr = $(this).closest('tr'),
                                prevRowId = $tr.prev().attr('id');
                            //保存当前行
                            yiGrid.saveRow(gst, rowId);
                            //如果不能取到上一行的ID，说明已经到第一行了
                            if (!prevRowId) {
                                //获取最后一行的ID
                                prevRowId = $tr.siblings().last().attr('id');
                            }
                            //自动点击指定行的指定单元格，将其设置为编辑状态
                            clickRowCell(prevRowId, e, currIndex);
                            break;
                            //右键
                        case 39:
                            //控件索引+1
                            currIndex++;
                            //则将焦点移到下一个编辑控件中
                            if (inputs.length === currIndex) {
                                currIndex = 0;
                            }
                            //如果是 alt + 右键
                            if (e.altKey) {
                                inputs.eq(currIndex).focus().select();
                                //阻止浏览器的默认行为，因为 alt + right 也是浏览器的快捷键
                                e.preventDefault();
                            } else {
                                cursor_p = yiCommon.getCursorPosition(this);
                                var vl = this.value.length;
                                //复选框 和 单选按钮 特殊处理
                                if (this.type === 'checkbox' || this.type === 'radio') {
                                    vl = 0;
                                }
                                //如果光标的位置等于文本框内容长度，说明光标已经到了文本框最后面
                                if (cursor_p == vl) {
                                    ////则将焦点移到下一个编辑控件中
                                    //var $nipt = inputs.eq(currIndex);
                                    ////将光标定位到编辑控件的内容的最前面
                                    //yiCommon.setCursorPosition($nipt[0], 0);
                                    setTimeout(function () {
                                        inputs.eq(currIndex).focus().select();
                                    }, 0);
                                }
                            }
                            break;
                            //下键
                        case 40:
                            //（当前下键和下拉表格下键存在冲突）如果是存在基础资料下拉表格，这时候听谁的？？？基础资料优先吧！
                            var name_t = $(this).closest('div[name]').attr('name');
                            if (name_t && name_t.lastIndexOf('_name') > -1) {
                                var $bdDropTb = $('.bd-select-table:visible').eq(0);
                                if ($bdDropTb && $bdDropTb.html()) {
                                    return;
                                }
                            }
                            //下一行ID
                            nextRowId = $(this).closest('tr').next().attr('id');
                            //保存当前行
                            yiGrid.saveRow(gst, rowId);
                            //如果能取到下一行的ID，说明还不是最后一行，否则自动新增一行
                            if (nextRowId) {
                                //自动点击指定行的指定单元格，将其设置为编辑状态
                                clickRowCell(nextRowId, e, currIndex);
                            } else {
                                //如果允许新增
                                if (doptst.allowAdd) {
                                    //在当前编辑行后面新增一行
                                    nextRowId = yiGrid.addRow(gidt, rowId, 'after', sets.onAfterAdding);
                                    //自动点击指定行的指定单元格，将其设置为编辑状态
                                    clickRowCell(nextRowId, e, currIndex);
                                } else {
                                    //保存当前行，并结束表格编辑状态
                                    yiGrid.saveRow(gst, rowId);
                                }
                            }
                            break;
                    }
                });
            }
        },

        //合并默认参数，但是不影响默认参数（保护好默认参数）
        sets = $.extend({}, defaults, options),

        //表格选择器
        gs = '#' + gid,

        //表格元素
        $gs = $('#' + gid),

        //选项
        dopts = yiGrid.getOptions(gid),

        //给原始表格父元素设置一个ID，用于后续表格宽度自适应调整
        gpc = $(gs).parent(),
        gpcid = gpc.attr('id');
        if (!gpcid) {
            gpcid = gid + '_pc';
            gpc.attr('id', gpcid);
        }

        //操作列
        if (dopts.allowAdd || dopts.allowDel) {
            sets.colModel.unshift(yiGrid.getOperateCol(dopts));
        }

        //默认明细行
        if (sets.data.length <= 0) {
            var def_row = 3;
            if (sets.defRow !== undefined) {
                def_row = parseInt(sets.defRow);
                def_row = isNaN(def_row) ? 0 : def_row;
            }
            for (var i = 0; i < def_row; i++) {
                sets.data.push({ id: yiCommon.uuid() });
            }
        } else {
            sets.data = sets.data.sort(yiCommon.sortby('FSeq'));
        }

        //初始化表格
        $(gs).jqGrid(sets);

        //绑定（新增，删除）事件
        $(gs).on('click', '.ui-icon-plus', function (e) {
            var rowId = $(this).attr('rowId');
            yiGrid.addRow(gid, rowId, null, sets.onAfterAdding);
        });
        $(gs).on('click', '.ui-icon-trash', function (e) {
            var rowId = $(this).attr('rowId');
            yiGrid.delRow(gid, rowId, sets.onAfterDeleting);
        });

        //列表宽度自适应
        $(window).on('resize.jqGrid', function () {
            if ($(gs).is(':visible')) {
                $(gs).setGridWidth($('#' + gpcid).width() - 2);
            }
        });

        //点击整个文档的时候
        $(document).on('click', function (e) {
            //如果点击的不是（当前表格，选择对话框，下拉表格，下拉日期）
            var $tg = $(e.target);
            if (
                //表格插件本身
                $tg.closest(gs).length === 0 &&
                //其他
                !$tg.hasClass('close') &&
                //对话框插件
                $tg.closest('.layui-layer-shade').length === 0 &&
                $tg.closest('.layui-layer').length === 0 &&
                //下拉表格插件
                $tg.closest('.bd-select-table').length === 0 &&
                //日期插件
                $tg.closest('.datepicker').length === 0 &&
                $tg.closest('.day').length === 0 &&
                $tg.closest('.month').length === 0 &&
                $tg.closest('.year').length === 0
                ) {
                //结束表格编辑状态
                yiGrid.endEdit(gid);
            }
        });

        $(document).on('keydown', function (e) {
            switch (e.which) {
                case 27: //Esc键
                    //结束表格编辑状态
                    yiGrid.endEdit(gid);
                    break;
            }
        });
    },

    //获取表格选项
    getOptions: function (gid) {
        //默认的选项
        var defs = {
            allowAdd: false,
            allowDel: false,
            allowEdit: false,
            retainLastRow: true,
        };
        //表格设置的选项
        var opts = $('#' + gid).attr('data-options');
        if (opts) {
            opts = eval('({' + opts + '})');
        }
        return $.extend({}, defs, opts || {});
    },

    //根据明细ID从数据包中提取出明细数据
    extractEntry: function (opData, entryId) {
        //数据包
        var uidata = opData && opData.billData && opData.billData.uidata ? opData.billData.uidata : null;
        //明细数据
        return uidata && entryId && uidata[entryId] ? uidata[entryId] : [];
    },

    //获取表格数据源
    getDataSource: function (gid) {
        //结束编辑状态
        yiGrid.endEdit(gid);
        //
        var data = $('#' + gid).jqGrid('getGridParam', 'data');
        //生成序号
        var ids = $('#' + gid).jqGrid('getDataIDs');
        $.each(ids, function (i) {
            $.each(data, function (j) {
                if (ids[i] === data[j].id) {
                    data[j]['FSeq'] = i + 1;
                }
            });
        });
        return data;
    },

    //获取表格数据源
    getData: function (gid) {
        return $('#' + gid).jqGrid('getGridParam', 'data');
    },

    //获取选中行的完整数据（包括选中的多行）
    getSelRows: function (gid) {
        var ids = $('#' + gid).jqGrid('getGridParam', 'selarrrow'),
            srds = [];
        if (ids && ids.length > 0) {
            var data = $('#' + gid).jqGrid('getGridParam', 'data');
            for (var i = 0, l = ids.length; i < l; i++) {
                var rd = match(data, ids[i]);
                if (rd) {
                    srds.push(rd);
                }
            }
            return srds;
        }
        return null;

        //根据 rowId 匹配 rowData
        function match(data, rowId) {
            for (var j = 0, k = data.length; j < k; j++) {
                if (data[j].id === rowId) {
                    return data[j];
                }
            }
            return null;
        }
    },

    //获取指定行的完整数据（包括基础资料ID等等...）
    getRow: function (gid, rowId) {
        var data = $('#' + gid).jqGrid('getGridParam', 'data');
        if (data) {
            for (var i = 0, l = data.length; i < l; i++) {
                if (data[i].id === rowId) {
                    return data[i];
                }
            }
        }
        return null;
    },

    //基础资料文本框：取值 或 设值
    bdIptVal: function (gid, rowId, colName, val) {
        var $input = $('#{0}_{1}'.format(rowId, colName), '#' + gid).find('input');
        if (val === undefined) {
            return $.trim($input.attr('keyId'));
        } else {
            $input.attr($.trim(val));
        }
    },

    //普通文本框：取值 或 设值
    iptVal: function (gid, rowId, colName, val) {
        var $input = $('#{0}_{1}'.format(rowId, colName), '#' + gid);
        if (val === undefined) {
            return $.trim($input.val());
        } else {
            $input.val($.trim(val));
        }
    },

    //复选框：取值 或 设值，注意：操作的是复选框的选中状态
    ckbVal: function (gid, rowId, colName, val) {
        var $ckb = $('#{0}_{1}'.format(rowId, colName), '#' + gid);
        if (val === undefined) {
            return $ckb.prop('checked');
        } else {
            $ckb.prop('checked', val);
        }
    },

    //字段：取值 或 设值
    fdVal: function (gird, rowId, colName, val) {
        var index = gird.p._index[$.jgrid.stripPref(gird.p.idPrefix, rowId)];
        if (index !== undefined) {
            if (val === undefined) {
                return gird.p.data[index][colName];
            } else {
                gird.p.data[index][colName] = val;
            }
        }
    },

    //结束表格编辑状态
    endEdit: function (gid) {
        //表格选择器
        var gst = '#' + gid,
        //如果当前存在编辑行ID
        editRowId = $(gst).attr('editRowId');
        if (editRowId) {
            yiGrid.saveRow(gst, editRowId);
        }
    },

    //获取表格操作列
    getOperateCol: function (dopts) {
        return {
            label: '&nbsp;', name: 'operate', width: dopts.allowAdd && dopts.allowDel ? 45 : 27, align: 'center', resizable: false, fixed: true, sortable: false, frozen: true,
            formatter: function (cv, opt, ro) {
                var html = '';
                if (dopts.allowAdd) {
                    html += '<span rowId="{0}" title="新增行" class="ui-icon ui-icon-plus jqgrid-operate"></span>';
                }
                if (dopts.allowDel) {
                    html += '<span rowId="{0}" title="删除行" class="ui-icon ui-icon-trash jqgrid-operate"></span>';
                }
                return html.format(opt.rowId);
            }
        };
    },

    //保存行
    saveRow: function (gst, rowId) {
        var saveOk = $(gst).jqGrid('saveRow', rowId, true, 'clientArray');
        if (saveOk) {
            $(gst).attr('editRowId', '');
            $('#' + rowId, gst).removeClass('ui-state-hover').find('td').css('padding', '');
        }
    },

    //新增行
    addRow: function (gid, rowId, position, onAfterAdding) {
        //新行ID
        var newRowId = yiCommon.uuid(),
        //新行数据
        newRowData = { id: newRowId };
        //在表格指定行的前面添加一个新行
        var addOk = $('#' + gid).jqGrid('addRowData', newRowId, newRowData, position || 'before', rowId);
        if (addOk) {
            $.isFunction(onAfterAdding) && onAfterAdding(gid, rowId, newRowId);
        }
        //返回新行ID
        return newRowId;
    },

    //删除行
    delRow: function (gid, rowId, onAfterDeleting) {
        var gs = '#' + gid,
            dopts = yiGrid.getOptions(gid);
        if (dopts.retainLastRow) {
            //获取表格所有的ID
            var ids = $(gs).jqGrid('getDataIDs');
            if (ids.length <= 1) {
                layer.msg('至少保留一条分录！');
                return;
            }
        }
        //如果当前存在编辑行ID，且不等于当前删除行ID
        var editRowId = $(gs).attr('editRowId');
        if (editRowId && editRowId !== rowId) {
            //则先保存当前编辑行
            var saveOk = $(gs).jqGrid('saveRow', editRowId, true, 'clientArray');
            if (!saveOk) {
                return false;
            }
            $('#' + editRowId, gs).removeClass('ui-state-hover').find('td').css('padding', '');
        }

        //当前要删除的行数据
        var del_row = $(gs).jqGrid('getRowData', rowId);

        //清空当前编辑行ID，并删除指定的行
        var delOk = $(gs).attr('editRowId', '').jqGrid('delRowData', rowId);
        if (delOk) {
            $.isFunction(onAfterDeleting) && onAfterDeleting(gid, rowId, del_row);
        }
    },

    //基础资料控件初始化函数
    bdCustomElement: function (page, grid, val, opt, callback) {

        //基础资料主键ID：取值 或 设值
        function pkIdValue(k, v) {
            if (k === undefined) { return; }
            var index = grid.p._index[$.jgrid.stripPref(grid.p.idPrefix, opt.rowId)];
            if (index !== undefined) {
                if (v === undefined) {
                    return grid.p.data[index][k];
                } else {
                    grid.p.data[index][k] = v;
                }
            }
        }

        //基础资料控件的父元素
        var $elwrap = $('<div style="position: relative;"></div>'),
            name = opt.name.split('_')[0],

        //创建一个 input 元素
        $el = $('<input type="lookup" value="{0}" name="{1}" keyId="{2}" autocomplete="off" />'.format(val, name, pkIdValue(name)))
            .addClass('editable inline-edit-cell ui-widget-content ui-corner-all')
            .css({ 'width': '100%' });

        //将基础资料控件追加到父元素中
        $el.appendTo($elwrap);

        //并将其初始化为一个基础资料控件
        $el.bdSelect({
            domainType: page.domainType,
            formId: page.formId,
            pageId: page.pageId,
            isBillHeader: false,
            onBdSelect: function (records) {

                //更新基础资料（主键ID，编码）
                pkIdValue(name, records[0].fbillhead_id);
                pkIdValue(name + '_name', records[0].fname || '');
                pkIdValue(name + '_number', records[0].fnumber || '');

                //执行回调函数
                $.isFunction(callback) && callback(records);
            }
        }).on('change', function (e) {

            //如果没有输入内容，则清除基础资料主键ID
            var nv = $.trim($(this).val());
            if (!nv) {

                //更新基础资料主键ID值
                pkIdValue(name, '');
                pkIdValue(name + '_name', '');
                pkIdValue(name + '_number', '');

                $(this).attr('keyId', '');

                //执行回调函数，无需传递任何参数，因为此时并不是选择基础资料所触发的回调
                //所以可在回调函数中判断是否有传递参数来处理相关逻辑
                $.isFunction(callback) && callback();
            }
        });

        //jqgrid 要求返回自定义创建的 input 元素
        return $elwrap;
    },

    //基础资料控件设值取值函数
    bdCustomValue: function (el, oper, val) {
        if (oper === 'get') {
            return $(el).find('input').val();
        } else if (oper === 'set') {
            $(el).find('input').val(val);
        }
    },

    //辅助资料下拉框初始化
    adDataInit: function (grid, ele, opt, callback) {
        $(ele).select2()
            .on('change', function (e) {
                //更新辅助资料主键ID值
                var index = grid.p._index[$.jgrid.stripPref(grid.p.idPrefix, opt.rowId)];
                if (index !== undefined) {
                    grid.p.data[index][opt.name.replace('_name', '')] = e.val;
                }
                //执行回调函数
                $.isFunction(callback) && callback(e);
            })
            .one('select2-focus', yiGrid.select2Focus).on("select2-blur", function () {
                $(this).one('select2-focus', yiGrid.select2Focus);
            })
            .parent('td').css({ 'padding': '0px' });
        $(ele).prev('.select2-container').addClass('select2-wrap').find('.select2-choice').addClass('select2-hdbd');
    },

    //辅助资料下拉框获得焦点时做相应的处理
    select2Focus: function () {
        var select2 = $(this).data('select2');
        setTimeout(function () {
            if (!select2.opened()) {
                select2.open();
            }
        }, 0);
    },

    //设置辅助资料数据源
    setAdDataSource: function (page, gid, ads) {
        for (var i = 0; i < ads.length; i++) {
            (function (colName) {
                yiGrid.getAssistData({
                    domainType: page.domainType,
                    formId: page.formId,
                    fieldKey: colName.split('_')[0],
                    callback: function (ad) {
                        $('#' + gid).setColProp(colName, { editoptions: { value: ad } });
                    }
                });
            })(ads[i]);
        }
    },

    //获取辅助资料
    getAssistData: function (opts) {
        var url = '/{0}/{1}?operationno=querycombo'.format(opts.domainType, opts.formId),
            params = { simpleData: { fieldKey: opts.fieldKey } };
        yiAjax.p(url, params,
            function (r) {
                var ds = r.operationResult.srvData.data, ad = {};
                for (var i = 0; i < ds.length; i++) {
                    ad[ds[i].id] = ds[i].name;
                }
                ad[''] = '&nbsp;';
                opts.callback(ad);
            }
        );
    },

    //普通文本框控件初始化函数
    strCustomElement: function (val, opt) {
        return $('<input type="text" value="{0}" autocomplete="off" />'.format(val))
        .addClass('editable inline-edit-cell ui-widget-content ui-corner-all')
        .css({ 'width': '100%' });
    },

    //普通文本框控件设值取值函数
    strCustomValue: function (el, oper, val) {
        if (oper === 'get') {
            return $(el).val();
        } else if (oper === 'set') {
            $(el).val(val);
        }
    },

    //数字文本框控件初始化函数
    numberCustomElement: function (val, opt) {
        return $('<input type="text" value="{0}" autocomplete="off" />'.format(val.replace(/,/g, '')))
        .addClass('editable inline-edit-cell ui-widget-content ui-corner-all')
        .css({ 'width': '100%' });
    },

    //数字文本框控件设值取值函数
    numberCustomValue: function (el, oper, val) {
        if (oper === 'get') {
            return $(el).val();
        } else if (oper === 'set') {
            $(el).val(val);
        }
    },

    //数字文本框控件值格式化函数
    numberFormatter: function (cv, opt, ro) {
        return cv <= 0 ? '' : yiMath.toMoneyFormat(cv, 2, 0);
    },

    //数字文本框控件值反格式化函数
    numberUnFormat: function (cv, opt, ro) {
        return cv.replace(/,/g, '');
    },

    //整数文本框控件初始化函数
    intCustomElement: function (val, opt) {
        return $('<input type="text" value="{0}" autocomplete="off" />'.format(val.replace(/,/g, '')))
        .addClass('editable inline-edit-cell ui-widget-content ui-corner-all')
        .css({ 'width': '100%' });
    },

    //整数文本框控件设值取值函数
    intCustomValue: function (el, oper, val) {
        if (oper === 'get') {
            return $(el).val();
        } else if (oper === 'set') {
            $(el).val(val);
        }
    },

    //整数文本框控件值格式化函数
    intFormatter: function (cv, opt, ro) {
        return cv <= 0 ? '' : yiMath.toMoneyFormat(cv, 0, 0);
    },

    //整数文本框控件值反格式化函数
    intUnFormat: function (cv, opt, ro) {
        return cv.replace(/,/g, '');
    },

    //日期控件初始化函数
    dateCustomElement: function (val, opt) {
        return $('<input type="text" value="{0}" autocomplete="off" />'.format(val))
        .addClass('editable inline-edit-cell ui-widget-content ui-corner-all')
        .css({ 'width': '100%' })
        .datepicker();
    },

    //日期控件设值取值函数
    dateCustomValue: function (el, oper, val) {
        if (oper === 'get') {
            return $(el).val();
        } else if (oper === 'set') {
            $(el).val(val);
        }
    },

    //日期控件值格式化函数
    dateFormatter: function (cv, opt, ro) {
        return cv ? cv.split('T')[0] : '';
    },

    //日期控件值反格式化函数
    dateUnFormat: function (cv, opt, ro) {
        return cv;
    },

    //复选框控件初始化函数
    boolCustomElement: function (val, opt) {
        return $('<input type="checkbox" />').prop('checked', $(val).prop('checked'));
    },

    //复选框控件设值取值函数
    boolCustomValue: function (el, oper, val) {
        if (oper === 'get') {
            return $(el).prop('checked');
        }
    }
};
