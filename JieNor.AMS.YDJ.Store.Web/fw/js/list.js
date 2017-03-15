/// <reference path="/fw/js/basepage.js" />
; (function () {
    var ListPage = (function (_super) {

        //公用方法
        var methods = {

            //获取列数组
            getColModel: function (opData) {

                //列数组
                var columns = [];

                //如果列表结构信息不存在
                if (!opData || !opData.listModel || opData.listModel.length <= 0) {
                    yiDialog.m({ msg: '初始化列表出错：列表结构信息为空！' });
                    return columns;
                }

                //默认添加主键ID列，但该列是隐藏的，主要用于列表弹窗时选择数据
                columns.push({ label: '主键ID', name: 'fbillhead_id', hidedlg: true, hidden: true });

                //遍历列表结构信息
                for (var i = 0, l = opData.listModel.length; i < l; i++) {

                    var lm = opData.listModel[i];

                    //如果不可见，则不需要创建列
                    if (!lm.visible) { continue; }

                    //根据列表结构信息创建列对象
                    columns.push({

                        classes: 'ui-ellipsis', //设置列的 css 单元格内容多余时显示“...”

                        label: lm.caption, //标题

                        name: lm.id, //名称

                        index: lm.id, //排序字段名称（暂时默认与字段名称相同）

                        align: lm.align, //对齐方式

                        width: lm.width, //宽度

                        sortable: lm.allowSort, //是否允许排序

                        fixed: true //列宽度是否要固定不可变
                    });
                }

                //返回列数组
                return columns;
            },

            //获取查询参数
            getSearchParams: function (that) {

                var params = [];

                $(Consts.searchSelector, that.pageSelector).find('.top-form form').each(function () {

                    var $inputs = $(this).find('input[type=text]');
                    val1 = $.trim($inputs.eq(0).attr('dataid')),
                    val2 = $.trim($inputs.eq(1).attr('datasym')),
                    val3 = $.trim($inputs.eq(2).val());

                    if (val1 && val2) {

                        params.push({ id: val1, operator: val2, value: val3 });
                    }
                });

                return params;
            },

            dataFastOne: function ($searchSelector, listModel) { //第一个下拉框，绑定的是所有列，第二个下拉框，是根据第一个下拉框的选择才触发的，

                $searchSelector.on('click', '.top-form>form>div .input-group-btn .dropdown-menu li>a', function () { //第一个过滤框点击事件

                    //在点击第一个下拉框的内容时，先将内容嵌入文本框中，	
                    var $toSet = $(this).parents('div.col-md-3');
                    var toSetIndex = $toSet.index();

                    //为判断是一列中是第几个下拉框的a被点击
                    if (toSetIndex === 0) {

                        //在点击所属的第一个下拉框时，其后面的文本框内容清空，并加载相应的第二个过滤下拉框 ，由于数据的原因，暂时无法用到隐藏的过滤框，暂时性处理
                        $('.top-form form:eq(' + $toSet.parent().index() + ')>div:eq(1) input').val('');

                        var dataid = $(this).attr('dataid');

                        $(this).parents('.input-group-btn.btn-group-sm').prev().attr('dataid', dataid).val($(this).text().trim());

                        for (var i = 0; i < listModel.length; i++) {
                            if (listModel[i].caption === $(this).text().trim()) {
                                methods.dataFastTwo(listModel[i], $toSet);
                            }
                        }
                    }

                        //这是一列中的第二个下拉框被点住
                    else if (toSetIndex === 1) {

                        var $comVar = $(this).parents('.input-group-btn.btn-group-sm'),
                            dataSym = $(this).attr('datasym'),
                            isIncludeValue = $(this).attr('isIncludeValue');

                        $comVar.prev().attr('datasym', dataSym).val($(this).text().trim());

                        //当isIncludeValue为true的时候，后面的输入框就会被锁住
                        if (isIncludeValue === 'true') {
                            $comVar.parent().parent().next().find('input').prop('disabled', 'disabled');
                        }
                    }
                });
            },

            dataFastTwo: function (two, $index) { //第一个下拉框确定选择的情况下，第二个下拉框的内容

                //为了防止之前已经选择一次的内容，所以要除去
                $('.top-form form:eq(' + $index.parent().index() + ') .input-group-btn:eq(1)>ul').remove();

                //第二个下拉框的临时存储空间
                var twoHtml = '';

                for (var i = 0; i < two.operators.length; i++) {

                    var o = two.operators[i];

                    twoHtml += '<li><a isIncludeValue="{0}" dataSym="{1}" href="javascript:;">{2}</a></li>'
                            .format(o.isIncludeValue, o.symbol, o.caption);
                }

                twoHtml = '<ul class="dropdown-menu pull-right">{0}</ul>'.format(twoHtml);

                $index.next().find('.input-group-btn').append(twoHtml)
            },

            //添加一行搜索条件
            addFilter: function ($searchSelector) {//obj是特定id页面,为了减少代码，将第一行作为复制内容，进行搜索条件的添加

                var $clo = $('.top-form form:eq(0)', $searchSelector).eq(0).html();
                $clo = '<form role="form" class="test clearfix">' + $clo;
                $clo += '<a id="deleteOne"><i class="fa fa-minus-square"></i> </a></form>';//添加删除本行按钮

                $searchSelector.find('.top-form #moreDrop').before($clo);
                $searchSelector.find('.top-form form:last .input-group-btn:eq(1) ul').remove();//为新增加的搜索行初始化
            },

            //点击过滤方案，进行方案填充以及搜索数据
            saveClick: function (obj, index, $searchSelector, listModel) {

                //现在所点击的过滤方案
                var filterNum = obj[index],

                //二级存储空间
                dataOperators = '',

                //过滤方案中具体的数据
                filterData = filterNum.filterData,

                //在点击过滤方案的时候，首先要去除原来的过滤方案,并且保留
                firstForm = '<form role="form" class="clearfix">' + $searchSelector.find(".top-form form").eq(0)[0]['innerHTML'] + '</form>';

                $searchSelector.find(".top-form form").remove();
                $searchSelector.find(".top-form").prepend(firstForm);

                for (var i = 0; i < filterData.length; i++) {
                    if (i > 0) {//有几个搜索form，就添加几个，不过原本就有一个所以在i>0开始
                        methods.addFilter($searchSelector);
                    }
                };

                $searchSelector.find(".top-form form").each(function (index, ele) {

                    var $toSet = $(this).children(),
                        $par = $(this).find('input[type=text]'),
                        idName = filterData[index].id,
                        symBol = filterData[index].operator;

                    //根据英文指令找出其中文
                    for (var i = 0; i < listModel.length; i++) {
                        if (listModel[i].id === idName) {
                            idName = listModel[i].caption;
                            dataOperators = listModel[i].operators;
                        }
                    }
                    $par.eq(0).attr('dataid', filterData[index].id).val(idName);

                    //填充第二个下拉框的选项
                    for (var i = 0; i < listModel.length; i++) {
                        if (listModel[i].id === filterData[index].id) {
                            methods.dataFastTwo(listModel[i], $toSet);
                        }
                    }

                    for (var i = 0; i < dataOperators.length; i++) {

                        if (dataOperators[i].symbol === symBol) {

                            symBol = dataOperators[i].caption;

                            //当isIncludeValue为true的时候，要将第三个input锁住
                            if (dataOperators[i].isIncludeValue) {

                                $par.eq(2).prop('disabled', 'disabled');

                            } else {

                                $par.eq(2).val(filterData[index].value);
                            }
                        }
                    }
                    $par.eq(1).attr('datasym', filterData[index].operator).val(symBol);
                });
            }
        };

        //列表页面类
        var _child = function (args) {
            var that = this;
            _super.call(that, args);

            //获取列表数据的 url
            that.queryDataUrl = '/list/{0}?operationno=querydata&pageid={1}'.format(that.formId, that.pageId);

            //获取过滤信息的url
            that.filterUrl = '/list/{0}?operationno=savefilter&pageid={1}'.format(that.formId, that.pageId);

            //页面地址（由各个子业务对象的 js 初始化）
            that.pageFile = '/views/list.html';

            //列表控件实例
            that.dataGrid = null;

            //初始化列表页面
            that.init = function () {

                //初始化菜单
                that.initMenu(args.opData);

                //初始化搜索面板
                that.initSearchPane(args.opData);

                //初始化列表控件
                that.initGrid(args.opData);
            };

            //刷新
            that.refresh = function () {

                //刷新列表控件数据
                that.dataGrid.jqGrid('setGridParam', { page: 1 }).trigger('reloadGrid');
            };

            //初始化搜索面板
            that.initSearchPane = function (opData) {

                //搜索面板容器
                var $searchSelector = $(Consts.searchSelector, that.pageSelector),

                //页面中的 top-form 容器
                $topFormSelector = $searchSelector.find('.top-form'),

                //
                dataFilter = opData.filterSchemes,

                //
                listModel = opData.listModel,

                //定时器
                timer,

                //第一个下拉框的存储空间，第一个下拉框，绑定的是所有列，第二个下拉框，是根据第一个下拉框的选择才触发的，绑定的是那个operators
                oneUl = '',

                //过滤栏临时存储空间
                fliterSpan = '\
                    <span class="label label-success">快速过滤</span>\
                    <span class="label label-info">方案：</span>';

                //第一个下拉框渲染
                for (var i = 0; i < listModel.length; i++) {

                    var lm = listModel[i];

                    //当 allowFilter = true 的时候，就绑定到下拉列表
                    if (lm.allowFilter) {

                        oneUl += '<li><a dataId="{0}" href="javascript:;">{1}</a></li>'.format(lm.id, lm.caption);
                    };

                    //为了看效果，暂时先设置无条件添加
                    oneUl += '<li><a dataId="{0}" href="javascript:;">{1}</a></li>'.format(lm.id, lm.caption);
                }
                oneUl = '<ul class="dropdown-menu pull-right">{0}</ul>'.format(oneUl);
                $topFormSelector.find('form:eq(0) .input-group-btn:eq(0)').append(oneUl);

                //在添加元素后启动与元素相互绑定的事件。
                methods.dataFastOne($searchSelector, listModel);

                //过滤栏填充过滤方案
                for (var i = 0; i < dataFilter.length; i++) {
                    fliterSpan += ' <span class="label label-default">{0}</span>'.format(dataFilter[i].name);
                }
                $searchSelector.find('.tab-more').html(fliterSpan);

                //点击过滤方案时
                $searchSelector.on('click', '.tab-more span', function () {

                    //如果点击的是有效的过滤方案，则需要处理
                    var index = $(this).index();
                    if (index > 1) {

                        //填充过滤条件
                        methods.saveClick(dataFilter, index - 2, $searchSelector, listModel);

                        //将所有的过滤方案设置为默认样式
                        $('.tab-more span', $searchSelector).each(function (i) {

                            //排除前面两个无效的过滤方案
                            if (i > 1) {
                                $(this).attr('class', 'label label-default');
                            }
                        });

                        //将当前点击的过滤方案设置为选中样式
                        $(this).attr('class', 'label label-success');

                        //执行搜索
                        that.refresh();
                    }
                });

                //搜索
                $searchSelector.on('click', '#top-search', function () {

                    //执行搜索
                    that.refresh();
                });

                //保存
                $searchSelector.on('click', '#top-save', function () {

                    //弹窗输入过滤方案名称
                    yiDialog.p({
                        title: '方案名称',
                        ok: function (name) {

                            //保存过滤方案的数据包
                            var params = {
                                simpleData: {
                                    filterScheme: {
                                        id: '',
                                        name: name, //方案的名字
                                        filterData: methods.getSearchParams(that) //方案的数据
                                    }
                                }
                            };

                            //后台规定，这个属性值需要以 json 字符串格式传递
                            params.simpleData.filterScheme = JSON.stringify(params.simpleData.filterScheme);

                            //请求保存过滤方案
                            yiAjax.p(that.filterUrl, params);
                        }
                    });
                });

                //重置
                $searchSelector.on('click', '#top-reset', function () {

                    //清空form里面已经选择的方案
                    $('form', $topFormSelector).each(function (index, ele) {

                        //清除所有input的值和所附带的属性参数
                        $(this).find('input').eq(0).attr('dataid', '').val('');

                        //并清除第二个框所附带的ul下拉选项，因为它是由第一个选项决定的。
                        $(this).find('input').eq(1).attr('datasym', '').val('').next().find('ul').remove();

                        $(this).find('input').eq(2).prop('disabled', '').val('');
                    })
                });

                //删除一行搜索条件
                $searchSelector.on('click', '#deleteOne', function () {

                    $(this).parent().remove();

                    if ($('form', $topFormSelector).length === 1) {

                        $topFormSelector.removeClass('act');
                    }
                })

                //添加一行搜索条件
                $searchSelector.on('click', '#moreDrop', function () {
                    methods.addFilter($searchSelector);
                });

                //鼠标进入搜索面板时的效果
                $topFormSelector.on('mouseenter', function () {

                    clearTimeout(timer);

                    //为了防止多次增加classname出现的bug，进行的条件判断处理
                    if (!$topFormSelector.hasClass('act')) {

                        $topFormSelector.addClass('act');

                        //判断该弹窗是不是有type=page的弹窗
                        if ($(this).parent().parent().parent().parent().parent().attr('type') == 'page') {

                            var $menuList = $topFormSelector.parents('.page-search-pane').prev();
                            //如果弹窗里面的功能栏按键不为空
                            if ($menuList.find('button').length > 0) {
                                //设离顶部高度为7.2rem
                                $topFormSelector.addClass('have');
                            }
                        }


                    }
                });

                //鼠标离开搜索面板时的效果
                $topFormSelector.on('mouseleave', function () {

                    timer = setTimeout(function () {

                        $topFormSelector.removeClass('act').removeClass('have');

                        $('.input-group-btn', $topFormSelector).removeClass('open');

                    }, 1000);
                });
            };

            //初始化列表控件
            that.initGrid = function (opData) {

                //定义列表控件
                that.dataGrid = $(Consts.gridSelector.format(that.pageId)).jqGrid({

                    //宽度
                    width: '100%',

                    //高度
                    height: 357,

                    //获取数据的地址
                    url: that.queryDataUrl,

                    //从服务器端返回的数据类型
                    datatype: 'json',

                    //ajax提交方式。post或者get，默认get
                    mtype: 'post',

                    ajaxGridOptions: { contentType: 'application/json; charset=utf-8' },

                    //定义是否自动宽度
                    autowidth: true,

                    //定义是否可以多选
                    multiselect: true,

                    //定义是否隔行变色
                    altRows: true,

                    //定义是否可以排序
                    sortable: true,

                    //定义是否可以多列排序
                    multiSort: true,

                    //自定义 loading 提示方式
                    loadui: 'disable',

                    //列对象数组
                    colModel: methods.getColModel(opData),

                    //定义翻页用的导航栏，必须是有效的html元素。翻页工具栏可以放置在html页面任意位置
                    pager: Consts.gridPagerSelector.format(that.pageId),

                    //在grid上显示记录条数，这个参数是要被传递到后台
                    rowNum: 10,

                    //一个下拉选择框，用来改变显示记录数，当选择时会覆盖rowNum参数传递到后台
                    rowList: [10, 30, 50, 100],

                    //定义是否要显示总记录数
                    viewrecords: true,

                    //自定义解析服务端数据结构
                    jsonReader: {

                        //数据模型入口
                        root: 'operationResult.srvData.data',

                        //当前第几页
                        page: 'operationResult.srvData.dataDesc.page',

                        //总页数
                        total: 'operationResult.srvData.dataDesc.pages',

                        //总记录数
                        records: 'operationResult.srvData.dataDesc.rows',

                        //如果设为 false，则 jqGrid 在解析json 时，会根据 name 来搜索对应的字段
                        repeatitems: false,

                        //配置主键字段名称
                        id: 'fbillhead_id'
                    },

                    //双击行时触发的事件
                    ondblClickRow: function (rowId, rowIndex, cellIndex, e) {

                        //打开编辑页面
                        yiCacheScript.g('/fw/js/platform/formop/modify.js', function () {
                            new Modify({
                                formId: that.formId,
                                pageId: that.pageId,
                                domainType: that.domainType,
                                openStyle: that.openStyle,
                                pageSelector: that.pageSelector,
                                pkids: [rowId]
                            });
                        });
                    },

                    //向服务器端发起请求之前触发此事件但如果datatype是一个function时例外
                    beforeRequest: function () {

                        Metronic.blockUI({ target: $(that.pageSelector), animate: true });
                    },

                    //当从服务器返回响应时执行，xhr：XMLHttpRequest 对象
                    loadComplete: function () {

                        Metronic.unblockUI($(that.pageSelector));
                    },

                    //如果请求服务器失败则调用此方法。xhr：XMLHttpRequest 对象；status：错误类型，字符串类型；error：exception对象
                    loadError: function (xhr, status, error) {

                        Metronic.unblockUI($(that.pageSelector));

                        //走统一的错误处理接口
                        yiAjax.ajaxError(xhr);
                    },

                    //向服务器发起请求时会把数据进行序列化，用户自定义数据也可以被提交到服务器端
                    serializeGridData: function (pd) {
                        /* 
                            pd 对象默认的数据结构：
                            var pd = { _search: false, nd: '', page: 1, rows: 10, sidx: '', sord: 'asc' };
                        */
                        //自定义 postData
                        var cpd = {

                            //过滤方案
                            whereString: methods.getSearchParams(that),

                            //排序字符串
                            OrderByString: '',

                            //当前第几页
                            pageIndex: pd.page,

                            //每页条数
                            pageCount: pd.rows
                        };

                        //如果存在排序字段
                        if (pd.sidx) {
                            cpd.OrderByString = pd.sidx + ' ' + pd.sord;
                        }

                        return JSON.stringify(cpd);
                    }
                });

                //列表分页工具条左侧相关操作
                that.dataGrid.jqGrid('navGrid', Consts.gridPagerSelector.format(that.pageId), {
                    edit: false, add: false, del: false, search: false
                });

                //列表宽度自适应
                $(window).on('resize.jqGrid', function () {
                    if (that.dataGrid && $(Consts.gridSelector.format(that.pageId)).is(':visible')) {
                        that.dataGrid.setGridWidth($(that.pageSelector).outerWidth() - 22);
                    }
                });
            };
        };

        __extends(_child, _super);
        return _child;
    })(BasePage);
    window.ListPage = window.ListPage || ListPage;
})();