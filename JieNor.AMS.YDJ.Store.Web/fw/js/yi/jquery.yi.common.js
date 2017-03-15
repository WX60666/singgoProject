/*
    1.用途：
        包含一些前端公用的方法
*/

; (function () {

    //第一层闭包
    var yiCommon = (function () {

        //第二层闭包
        return function () {

            var that = this;

            //提取错误信息
            that.extract = function (m) {

                //响应的内容
                var rt = m.responseText ? $.parseJSON(m.responseText) : null;

                //如果存在错误信息
                if (rt && rt.responseStatus && rt.responseStatus.message) {

                    return rt.responseStatus.message;
                }

                return '状态码：{0}，错误信息：{1}'.format(m.status, m.statusText);
            };

            //显示错误信息
            that.showError = function (msg, statusCode, container) {
                var success = 'alert-success',
                    danger = 'alert-danger',
                    alert = container ? $('.alert', container) : $('.alert');
                if (statusCode) {
                    alert.removeClass(danger).addClass(success);
                } else {
                    alert.removeClass(success).addClass(danger);
                }
                $('span', alert).html(msg);
                if (!alert.is(':visible')) {
                    alert.show();
                }
            };

            //对数组进行排序：根据指定的排序依据
            that.sortby = function (prop) {
                return function (a, b) {
                    a = a[prop];
                    b = b[prop];
                    return (a === b ? 0 : a > b ? 1 : -1) * 1;
                }
            };

            //获取文本框光标位置
            that.getCursorPosition = function (t) {
                if (t.type === 'checkbox' || t.type === 'radio') {
                    return 0;
                }
                try {
                    if (document.selection) {
                        t.focus();
                        var ds = document.selection;
                        var range = ds.createRange();
                        var stored_range = range.duplicate();
                        stored_range.moveToElementText(t);
                        stored_range.setEndPoint("EndToEnd", range);
                        t.selectionStart = stored_range.text.length - range.text.length;
                        t.selectionEnd = t.selectionStart + range.text.length;
                        return t.selectionStart;
                    } else {
                        return t.selectionStart;
                    }
                } catch (e) {
                    return 0;
                }
            };

            //设置文本框光标位置 
            that.setCursorPosition = function (t, p) {
                if (t.type === 'checkbox' || t.type === 'radio') {
                    return;
                }
                try {
                    if (t.setSelectionRange) {
                        t.focus();
                        t.setSelectionRange(p, p);
                    } else if (t.createTextRange) {
                        var range = t.createTextRange();
                        range.collapse(true);
                        range.moveEnd('character', p);
                        range.moveStart('character', p);
                        range.select();
                    }
                } catch (e) { }
            };

            //获取一个UUID
            that.uuid = function (len, radix) {

                //默认长度为 8 位
                len = len ? len : 8;

                //默认基数为 16 进制
                radix = radix ? radix : 16;

                var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
                var uuid = [], i;
                radix = radix || chars.length;

                if (len) {

                    // Compact form
                    for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];

                } else {

                    // rfc4122, version 4 form
                    var r;

                    // rfc4122 requires these characters
                    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
                    uuid[14] = '4';

                    // Fill in random data.  At i==19 set the high bits of clock sequence as
                    // per rfc4122, sec. 4.1.5
                    for (i = 0; i < 36; i++) {
                        if (!uuid[i]) {
                            r = 0 | Math.random() * 16;
                            uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                        }
                    }
                }
                return uuid.join('');
            };

            //解析复选框和单选按钮
            that.parserCheckboxRadio = function (selector) {

                if (!$().uniform) { return; }
                var checks = $('input[type=checkbox]:not(.toggle, .md-check, .md-radiobtn, .make-switch, .icheck), input[type=radio]:not(.toggle, .md-check, .md-radiobtn, .star, .make-switch, .icheck)', selector);
                if (checks.size() > 0) {
                    checks.each(function () {
                        if ($(this).parents('.checker').size() === 0) {
                            $(this).show().uniform();
                        }
                    });
                }
            };

            //获取页面上所有字段的值（不包括明细列表）
            that.getFormValue = function (pageSelector) {

                //字段对象
                var bill = {};

                //获取 pageSelector 下面包含 name 属性，且未禁用 的表单控件
                $('[name]', pageSelector).each(function () {

                    //控件值是否已改变
                    var isChanged = true;//$(this).attr('isChanged'),

                    //控件的 name 属性值
                    name = $(this).attr('name'),

                    //控件的 type 属性值
                    type = $(this).attr('type');

                    //如果控件值已改变，才需要打包
                    if (isChanged) {

                        //检查特殊控件
                        if ($(this).hasClass('select2me')) {

                            //第三方控件：select2 下拉框控件
                            bill[name] = $.trim($(this).select2('val'));

                        } else if (type === 'lookup') {

                            //我们自己定义的控件：基础资料控件
                            var keyId = $(this).attr('keyId');
                            bill[name] = typeof (keyId) === 'undefined' ? '' : keyId;

                        } else {

                            //普通控件（text, password, select, textarea, hidden, checkbox, radio）

                            if (type === 'checkbox') {

                                //复选框
                                bill[name] = $(this).is(':checked');

                            } else if (type === 'radio') {

                                //单选按钮
                                if (!bill[name]) {

                                    bill[name] = $.trim($('input[name="' + name + '"]:checked', pageSelector).val());
                                }

                            } else if (type === 'file') {

                                //因为文件上传里面的input元素是动态加载的，所以字段标识放在了设置按钮的元素上
                                var $zi = $(this).parent().parent();
                                //找到外层容器,因为我设置的文件上传，在上传成功后，后台返回的fileId我是绑定在div.placeholder中
                                var $par = $zi.parent();
                                bill[$zi.attr('name')] = $par.attr('fileId');

                            } else {

                                //除了 checkbox, radio 之外的其他控件（text, password, select, textarea, hidden）
                                bill[name] = $.trim($(this).val());
                            }
                        }
                    }
                });

                //字段对象
                return bill;
            };

            //设置页面上所有字段的值，以及监听所有字段值变化（不包括明细列表）
            that.setFormValue = function (pageSelector, packet) {

                //获取 pageSelector 下面包含 name 属性，且未禁用 的表单控件
                $('[name]', pageSelector).each(function () {

                    //控件的 name 属性值
                    var name = $(this).attr('name'),

                    //控件的 type 属性值
                    type = $(this).attr('type');

                    //如果数据包存在，才需要为各个字段控件赋值
                    if (packet) {

                        //字段值是否存在：简单值（string，number，bool，date） 和 复杂值（object）
                        var value = packet[name];
                        if (value) {

                            //检查特殊控件
                            if ($(this).hasClass('select2me')) {

                                //标注当前字段是一个下拉框的动态数据源
                                if ($(this).hasClass('dynamic')) {
                                    $(this).attr('renid', value);
                                }
                                //第三方控件：select2 下拉框控件
                                //如果当前字段是一个“下拉框”，那么将字段对应的 id 属性值作为控件的值
                                //我们自己定义的控件：基础资料控件
                                $(this).select2('val', value);

                            } else if (type === 'lookup') {

                                //我们自己定义的控件：基础资料控件
                                //如果当前字段是一个“基础资料”，那么将字段对应的 id 属性值作为控件的 keyId 属性值，name 属性作为控件的 value 值
                                $(this).val(packet[name + '_name']).attr('keyId', value);

                            } else if ($(this).parent().hasClass('date-picker')) {

                                //日期控件赋值处理，因为后端返回日期格式是：yyyy-MM-dd HH:mm:ss
                                $(this).val($.trim(value).replace('T', ' ').split(' ')[0]);

                            } else {

                                //普通控件（text, password, select, textarea, hidden, checkbox, radio）

                                value = $.trim(value);

                                if (type === 'checkbox') {

                                    //复选框
                                    $(this).prop('checked', value).parent().addClass('checked');

                                } else if (type === 'radio') {

                                    //单选按钮
                                    $('input:radio[name="' + name + '"][value="' + value + '"]', pageSelector).prop('checked', true);

                                } else {

                                    //除了 checkbox, radio 之外的其他控件（text, password, select, textarea, hidden）
                                    $(this).val(value);
                                }
                            }
                        }
                    }

                    //监听控件的 change 事件
                    $(this).on('change', function () {
                        /*
                            标记该控件值已改变，目前只是根据有无触发控件的 change 事件来判定控件值是否已改变，
                            严格来说应该要比较原始值的来判定控件值是否已改变。
                        */
                        $(this).attr('isChanged', true);

                    }).on('focus', function () {

                        //文本框获得焦点时选中当前文本框的内容
                        $(this).select();
                    });
                });
            };

            //获取页面上所有的明细表格数据源
            that.getFormEntrys = function (pageSelector) {

                //明细对象
                var entry = {};

                //获取 pageSelector 下面包含 entryid 属性的列表控件
                $('table[entryid]', pageSelector).each(function () {

                    //控件的 entryid 属性值
                    var entryid = $(this).attr('entryid'),
                        girdid = $(this).attr('id')

                    //根据 jqGridId 获取 jqGrid 数据源
                    entry[entryid] = yiGrid.getDataSource(girdid);
                });

                //返回明细对象
                return entry;
            };

            //设置页面上所有的明细表格数据源
            that.setFormEntrys = function (pageSelector, packet) {

                //获取 pageSelector 下面包含 entryid 属性的列表控件
                $('div[entryid]', pageSelector).each(function () {

                    //控件的 entryid 属性值
                    var $entry = $(this),
                        entryid = $entry.attr('entryid'),
                        allowAdding = $entry.attr('allowAdding') === 'true',
                        allowDeleting = $entry.attr('allowDeleting') === 'true',
                        allowClearAll = $entry.attr('allowClearAll') === 'true',
                        editing = null,
                        selection = null,
                        toolbar = null;

                    if (allowAdding || allowDeleting) {
                        editing = {
                            texts: {
                                validationCancelChanges: '撤销更改',
                                confirmDeleteMessage: '' //为了删除行时不提示确认对话框，故而将其设置为空
                            },
                            mode: 'cell',
                            allowUpdating: true
                        };
                        selection = {
                            mode: 'multiple',
                            showCheckBoxesMode: 'always',
                            allowSelectAll: true
                        };
                        toolbar = $('<div></div>');
                    }


                    if (allowAdding) {
                        var btnNew = $('<div></div>');
                        toolbar.append(btnNew);
                        btnNew.dxButton({
                            text: "新增行",
                            onClick: function () {
                                dataGrid.addRow();
                            }
                        });
                    }

                    var $btnDelete;
                    if (allowDeleting) {
                        var btnDelete = $('<div></div>');
                        toolbar.append(btnDelete);
                        $btnDelete = btnDelete.dxButton({
                            text: "删除选中行",
                            disabled: true,
                            onClick: function () {
                                //删除成功后的行的索引号数组
                                var indexs = [];
                                //当前列表控件中现有的数据
                                var ds = dataGrid.option('dataSource');
                                //根据主键ID获取索引号
                                var keys = dataGrid.getSelectedRowKeys();
                                for (var k = 0; k < keys.length; k++) {
                                    indexs.push(dataGrid.getRowIndexByKey(keys[k]));
                                }
                                //索引号排序（从大到小降序排列）
                                indexs = indexs.sort(function (a, b) {
                                    return b - a;
                                });
                                //根据索引号删除数据
                                for (var j = 0; j < indexs.length; j++) {
                                    ds._array.splice(indexs[j], 1);
                                }
                                //将删除后的数据源填充到列表控件中
                                dataGrid.option('dataSource', ds);
                            }
                        }).dxButton("instance");
                    }

                    if (allowClearAll) {
                        var btnClear = $('<div></div>');
                        toolbar.append(btnClear);
                        btnClear.dxButton({
                            text: "清空所有行",
                            onClick: function () {
                                dataGrid.option('dataSource', new DevExpress.data.ArrayStore([]));
                            }
                        });
                    }

                    //工具条
                    if (toolbar) {
                        toolbar.css('margin-bottom', '5px').find('.dx-button').css('margin-right', '5px');
                        $entry.before(toolbar);
                    }

                    //默认几行空行
                    var datas = [];
                    if (packet && packet[entryid]) {
                        datas = packet[entryid];
                    }
                    //else {
                    //    for (var i = 1; i <= 5; i++) {
                    //        datas.push({ FSeq: i });
                    //    }
                    //}

                    //数据源
                    var dataSource = new DevExpress.data.ArrayStore(datas);

                    //初始化列表控件，并且设置列表控件的数据源
                    var dataGrid = $entry.dxDataGrid({
                        width: '100%',
                        height: 'auto',
                        noDataText: '',
                        allowColumnResizing: true,
                        hoverStateEnabled: true,
                        rowAlternationEnabled: true,
                        allowColumnReordering: true,
                        columnAutoWidth: true,
                        showBorders: true,
                        showRowLines: true,
                        dataSource: dataSource,
                        sorting: {
                            mode: 'multiple',
                            ascendingText: '升序',
                            descendingText: '降序',
                            clearText: '不排序'
                        },
                        paging: {
                            enabled: false
                        },
                        pager: {
                            visible: false
                        },
                        editing: editing,
                        selection: selection,
                        onSelectionChanged: function (data) {
                            if ($btnDelete) {
                                $btnDelete.option("disabled", !data.selectedRowsData.length);
                            }
                        },
                        //以下代码是实现列宽拖动的时候，不影响其他列宽的解决方案 begin
                        onContentReady: function (e) {
                            var visibleColumns = e.component.getController('columns').getVisibleColumns();
                            e.component._columnWidths = [];
                            $.each(visibleColumns, function () {
                                e.component._columnWidths.push(this.width || this.visibleWidth);
                            });
                        },
                        onColumnsChanging: function (e) {
                            var component = e.component,
                              oldColumnWidths = component._columnWidths,
                              columnIndexes = [],
                              visibleColumns;

                            if (component.option('controlColumnResizing') && component.option('columnAutoWidth') && e.optionNames.width) {
                                visibleColumns = component.getController('columns').getVisibleColumns();
                                $.each(visibleColumns, function (index, column) {
                                    if (column.width > 0 && column.width !== oldColumnWidths[index]) {
                                        columnIndexes.push(index);
                                    }
                                });

                                if (columnIndexes.length === 2) {
                                    oldColumnWidths[columnIndexes[0]] = visibleColumns[columnIndexes[0]].width;

                                    component.getController('columnsResizer')._resizingInfo.nextColumnWidth = 1000;
                                    component.columnOption(visibleColumns[columnIndexes[1]].index, 'width', oldColumnWidths[columnIndexes[1]]);
                                }
                            }
                        },
                        controlColumnResizing: true
                        //以下代码是实现列宽拖动的时候，不影响其他列宽的解决方案 end
                    }).dxDataGrid("instance");
                });
            };

            //获取明细主键ID列对象
            that.getEntryPkidColumn = function () {
                return { dataField: 'id', dataType: 'string', visible: false };
            };

            //获取明细序号列对象
            that.getEntrySeqColumn = function () {
                return { allowEditing: false, allowResizing: true, caption: '序号', dataField: 'FSeq', dataType: 'number', alignment: 'center', width: 50 };
            };
        };

    })();

    //扩展到 window 上面
    window.yiCommon = window.yiCommon || new yiCommon();

})();