var SalePact_Edit = {
    init: function () {
        this.initOperate();
        this.parserControl();
        this.loadEntryList();
        this.loadJQGrid();
    },
    initOperate: function () {
        //基本信息
        $('#btnBaseSave').click(function () {
            var packet = SalePact_Edit.getFormValue('#scm_salepact', 'scm_salepact');
            packet.OperationNo = 'Save';

            yiAjax.p('/bill/scm_salepact', packet,
                function (r) {
                    alert('保存成功！');
                },
                function (m) {
                    alert(m.ResponseStatus.Message);
                }
            );
        });
        $('#btnBaseCancel').click(function () {

        });
        //客户信息
        $('#btnCustomerSave').click(function () {

        });
        $('#btnCustomerCancel').click(function () {

        });
        //业绩与价格控制
        $('#btnDeedSave').click(function () {

        });
        $('#btnDeedCancel').click(function () {

        });
    },
    loadJQGrid: function () {
        // Set data
        var mydata = [
            { id: "1", invdate: "2010-05-24", name: "test", note: "note", tax: "10.00", total: "2111.00" },
            { id: "2", invdate: "2010-05-25", name: "test2", note: "note2", tax: "20.00", total: "320.00" },
            { id: "3", invdate: "2007-09-01", name: "test3", note: "note3", tax: "30.00", total: "430.00" },
            { id: "4", invdate: "2007-10-04", name: "test", note: "note", tax: "10.00", total: "210.00" },
            { id: "5", invdate: "2007-10-05", name: "test2", note: "note2", tax: "20.00", total: "320.00" },
            { id: "6", invdate: "2007-09-06", name: "test3", note: "note3", tax: "30.00", total: "430.00" },
            { id: "7", invdate: "2007-10-04", name: "test", note: "note", tax: "10.00", total: "210.00" },
            { id: "8", invdate: "2007-10-03", name: "test2", note: "note2", amount: "300.00", tax: "21.00", total: "320.00" },
            { id: "9", invdate: "2007-09-01", name: "test3", note: "note3", amount: "400.00", tax: "30.00", total: "430.00" },
            { id: "11", invdate: "2007-10-01", name: "test", note: "note", amount: "200.00", tax: "10.00", total: "210.00" },
            { id: "12", invdate: "2007-10-02", name: "test2", note: "note2", amount: "300.00", tax: "20.00", total: "320.00" },
            { id: "13", invdate: "2007-09-01", name: "test3", note: "note3", amount: "400.00", tax: "30.00", total: "430.00" },
            { id: "14", invdate: "2007-10-04", name: "test", note: "note", amount: "200.00", tax: "10.00", total: "210.00" },
            { id: "15", invdate: "2007-10-05", name: "test2", note: "note2", amount: "300.00", tax: "20.00", total: "320.00" },
            { id: "16", invdate: "2007-09-06", name: "test3", note: "note3", amount: "400.00", tax: "30.00", total: "430.00" },
            { id: "17", invdate: "2007-10-04", name: "test", note: "note", amount: "200.00", tax: "10.00", total: "210.00" },
            { id: "18", invdate: "2007-10-03", name: "test2", note: "note2", amount: "300.00", tax: "20.00", total: "320.00" },
            { id: "19", invdate: "2007-09-01", name: "test3", note: "note3", amount: "400.00", tax: "30.00", total: "430.00" },
            { id: "21", invdate: "2007-10-01", name: "test", note: "note", amount: "200.00", tax: "10.00", total: "210.00" },
            { id: "22", invdate: "2007-10-02", name: "test2", note: "note2", amount: "300.00", tax: "20.00", total: "320.00" },
            { id: "23", invdate: "2007-09-01", name: "test3", note: "note3", amount: "400.00", tax: "30.00", total: "430.00" },
            { id: "24", invdate: "2007-10-04", name: "test", note: "note", amount: "200.00", tax: "10.00", total: "210.00" },
            { id: "25", invdate: "2007-10-05", name: "test2", note: "note2", amount: "300.00", tax: "20.00", total: "320.00" },
            { id: "26", invdate: "2007-09-06", name: "test3", note: "note3", amount: "400.00", tax: "30.00", total: "430.00" },
            { id: "27", invdate: "2007-10-04", name: "test", note: "note", amount: "200.00", tax: "10.00", total: "210.00" },
            { id: "28", invdate: "2007-10-03", name: "test2", note: "note2", amount: "300.00", tax: "20.00", total: "320.00" },
            { id: "29", invdate: "2007-09-01", name: "test3", note: "note3", amount: "400.00", tax: "30.00", total: "430.00" }
        ];

        // Auto height step 1: Set .content height = window heigth - 250px
        $(".content").height($(window).height() - 250);
        var lastsel;
        // Setup grid
        jQuery("#entryTabel").jqGrid({
            data: mydata,
            datatype: "local",
            height: "100%",
            width: 'auto',
            hidegrid: false,
            autowidth: true,
            rowNum: 10,
            rowList: [10, 20, 30],
            colNames: ['Inv No', 'Date', 'Client', 'Amount', 'Tax', 'Total', 'Notes'],
            colModel: [
                { name: 'id', index: 'id', editable: true, width: 60, sorttype: "int", search: true },
                { name: 'invdate', index: 'invdate', editable: true, width: 90, sorttype: "date", formatter: "date" },
                { name: 'name', index: 'name', editable: true, width: 100 },
                { name: 'amount', index: 'amount', editable: true, width: 80, align: "right", sorttype: "float", formatter: "number" },
                { name: 'tax', index: 'tax', editable: true, width: 80, align: "right", sorttype: "float" },
                {
                    name: 'total', index: 'total', editable: true, width: 80, align: "right", sorttype: "float", edittype: 'select',
                    editoptions: {
                        value: 'aaa',
                        dataInit: function (element) {
                            $(element).select2();
                        }
                    }
                },
                { name: 'note', index: 'note', editable: true, width: 100, sortable: false }
            ],
            onSelectRow: function (id) {
                if (id && id !== lastsel) {
                    jQuery('#entryTabel').jqGrid('restoreRow', lastsel);
                    jQuery('#entryTabel').jqGrid('editRow', id, true);
                    lastsel = id;
                }
            }

        });
    },
    //设置默认的空明细
    setDefaultEmptyEntry: function (entryDataSource, addDefaultRow, defaultRow) {
        if (!defaultRow) {
            defaultRow = 5;
        }
        if (!entryDataSource) {
            entryDataSource = new Array();
        }
        var rowIndex = 0;
        for (var i = 0; i < entryDataSource.length; i++) {
            entryDataSource[i].RowIndex = rowIndex;
            rowIndex += 1;
        }
        if (addDefaultRow === undefined || addDefaultRow === true) {
            var dataLength = entryDataSource.length;
            var emptyRow = 1;
            if (dataLength < defaultRow) {
                emptyRow = defaultRow - 1 - dataLength + emptyRow;
            }
            for (var i = 0; i < emptyRow; i++) {
                var obj = SalePact_Edit.getEmptyEntry();
                obj.RowIndex = rowIndex;
                entryDataSource.push(obj);
                rowIndex += 1;
            }
        }
    },
    //获取空模型
    getEmptyEntry: function () {
        var model = {};
        model.FMaterialId = '';
        model.FLength = '';
        model.FWidth = '';
        model.FWidth = '';
        model.FColorId = '';
        model.FUnitId = '';
        model.FQty = '';
        model.FPrice = '';
        model.FDiscount = '';
        model.FAmount = '';
        model.FRemark = '';
        return model;
    },
    //加载明细列表
    rowIndex: -1,
    loadEntryList: function () {
        var data = [];
        SalePact_Edit.setDefaultEmptyEntry(data, true, 10);
        $('#entryList').datagrid({
            rownumbers: true,
            resizable: true,
            auto: true,
            width: '100%',
            height: 'auto',
            data: data,
            toolbar: [
                {
                    text: '新增行',
                    iconCls: 'icon-add',
                    handler: function () { alert('新增行') }
                },
                {
                    text: '插入行',
                    iconCls: 'icon-cut',
                    handler: function () { alert('插入行') }
                },
                {
                    text: '编辑行',
                    iconCls: 'icon-edit',
                    handler: function () { alert('编辑行') }
                },
                {
                    text: '删除行',
                    iconCls: 'icon-remove',
                    handler: function () { alert('删除行') }
                },
            ],
            columns: [[
                {
                    title: '物料', field: 'FMaterialId', width: 160, halign: 'center', align: 'left', sortable: false, formatter: function (value, rowData, rowIndex) {
                        return value;
                    },
                    editor: { type: 'combobox' }
                },
                {
                    title: '长', field: 'FLength', width: 60, halign: 'center', align: 'right', sortable: false, formatter: function (value, rowData, rowIndex) {
                        return value;
                    },
                    editor: { type: 'numberbox' }
                },
                {
                    title: '宽', field: 'FWidth', width: 60, halign: 'center', align: 'right', sortable: false, formatter: function (value, rowData, rowIndex) {
                        return value;
                    },
                    editor: { type: 'numberbox' }
                },
                {
                    title: '高', field: 'FHeight', width: 60, halign: 'center', align: 'right', sortable: false, formatter: function (value, rowData, rowIndex) {
                        return value;
                    },
                    editor: { type: 'numberbox' }
                },
                {
                    title: '颜色', field: 'FColorId', width: 80, halign: 'center', align: 'left', sortable: false, formatter: function (value, rowData, rowIndex) {
                        return value;
                    },
                    editor: { type: 'combobox' }
                },
                {
                    title: '单位', field: 'FUnitId', width: 60, halign: 'center', align: 'left', sortable: false, formatter: function (value, rowData, rowIndex) {
                        return value;
                    },
                    editor: { type: 'combobox' }
                },
                {
                    title: '数量', field: 'FQty', width: 60, halign: 'center', align: 'right', sortable: false, formatter: function (value, rowData, rowIndex) {
                        return value;
                    },
                    editor: { type: 'numberbox' }
                },
                {
                    title: '单价', field: 'FPrice', width: 60, halign: 'center', align: 'right', sortable: false, formatter: function (value, rowData, rowIndex) {
                        return value;
                    },
                    editor: { type: 'numberbox' }
                },
                {
                    title: '折扣', field: 'FDiscount', width: 60, halign: 'center', align: 'right', sortable: false, formatter: function (value, rowData, rowIndex) {
                        return value;
                    },
                    editor: { type: 'numberbox' }
                },
                {
                    title: '金额', field: 'FAmount', width: 80, halign: 'center', align: 'right', sortable: false, formatter: function (value, rowData, rowIndex) {
                        return value;
                    },
                    editor: { type: 'numberbox' }
                },
                {
                    title: '备注', field: 'FRemark', width: 300, halign: 'center', align: 'left', sortable: false, formatter: function (value, rowData, rowIndex) {
                        return value;
                    },
                    editor: { type: 'textbox' }
                }
            ]],
            onClickCell: function (rowIndex, field, value) {

                //先结束已经是编辑状态的行
                if (SalePact_Edit.rowIndex >= 0) {
                    $('#entryList').datagrid('endEdit', SalePact_Edit.rowIndex);
                }

                //开启编辑行
                $('#entryList').datagrid('selectRow', rowIndex).datagrid('beginEdit', rowIndex);

                //控件获取焦点
                var ed = $('#entryList').datagrid('getEditor', { index: rowIndex, field: field });
                if (ed) {
                    ($(ed.target).data('textbox') ? $(ed.target).textbox('textbox') : $(ed.target)).focus();
                }

                //记录当前编辑行的索引
                SalePact_Edit.rowIndex = rowIndex;
            },
            onClickRow: function (rowIndex, rowData) {

            },
            onBeginEdit: function (index, row) {

            }
        });
    },
    //获取 Form 表单中的所有控件值，selector 为一个 jquery 选择器（比如：'#id', '.user-form' 等等...）
    getFormValue: function (selector, formId) {

        //selector 和 formId 是必须的
        if (!selector || !formId) {
            alert('selector 和 formId 参数不能为空！');
            return;
        }

        //主键ID
        var id = $.trim($('#hid_' + formId + '_id').val());

        //数据包
        var packet = { Id: id, FormId: formId, OperationNo: '', BillData: [] }, bill = { Id: id, FEntry: [] };

        //获取 selector 下面包含 name 属性，且未禁用 的表单控件
        $('[name]', selector).each(function () {

            //控件的 name 属性值
            var name = $(this).attr('name');

            //控件的 type 属性值
            var type = $(this).attr('type');

            //检查特殊控件

            //第三方控件，比如：select2 下拉框控件
            if ($(this).hasClass('select2me')) {

                //给对象添加属性，并且给属性赋值
                bill[name] = $.trim($(this).select2("val"));
            }
                //普通控件（text, password, select, textarea, hidden, checkbox, radio）
            else {

                //复选框
                if (type === 'checkbox') {

                    bill[name] = $(this).is(':checked');
                }
                    //单选按钮
                else if (type === 'radio') {

                    //暂时用不到，用到再实现吧。
                }
                    //除了 checkbox, radio 之外的其他控件（text, password, select, textarea, hidden）
                else {

                    bill[name] = $.trim($(this).val());
                }
            }
        });

        bill.FEntry.push({ FMaterialId: 'materialid1', FLength: 100, FWidth: 100, FHeight: 100, FColorId: 'colorid1', FUnitId: 'unitid1', FQty: 10, FPrice: 300, FDiscount: 0.9, FAmount: 3000, FRemark: '备注' });

        //将单据添加值数据包中
        packet.BillData.push(bill);

        packet.BillData = JSON.stringify(packet.BillData);

        //返回数据包
        return packet;
    },
    parserControl: function () {
        //解析下拉框控件
        $('.select2me').select2();
        //解析日期控件
        $('.date-picker').datepicker();
        //解析所有的 Easy UI 控件
        $.parser.parse();
    }
};
$(document).ready(function () {
    SalePact_Edit.init();
});
