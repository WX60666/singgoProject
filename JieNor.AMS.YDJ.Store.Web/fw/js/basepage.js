/// <reference path="/fw/js/consts.js" />
/// <reference path="/fw/js/tabmgr.js" />
; (function () {

    //闭包
    var BasePage = (function () {

        //所有页面 js 的父类
        function BasePage(args) {

            //页签管理器实例（单例）
            this.tabMgr = TabMgr.getInstance();

            //表单ID
            this.formId = args ? (args.formId ? args.formId : '') : '';

            //页面ID（用于唯一标识一个页面）
            this.pageId = args ? (args.pageId ? args.pageId : '') : '';

            //父页面ID（每个页面都有一个父ID）
            this.parentPageId = args ? (args.parentPageId ? args.parentPageId : '') : '';

            //领域模型类型
            this.domainType = args ? (args.domainType ? args.domainType.toLowerCase() : '') : '';

            //页面打开方式
            this.openStyle = args ? (args.openStyle ? args.openStyle.toLowerCase() : '') : '';

            //主键ID（编辑的时候数据主键ID）
            this.pkid = args ? (args.pkid ? args.pkid : '') : '';

            //页面容器选择器
            this.pageSelector = Index.getPageSelector(this.pageId);
            args ? args.pageSelector = this.pageSelector : {};

            //操作返回的数据
            this.opData = args ? (args.opData ? args.opData : null) : null;

            //表单上下文
            this.formContext = {
                //客户端参数 ClientParameter
                cp: args ? (args.cp ? args.cp : null) : null,
                //服务端参数 ServerParameter
                sp: args ? (args.sp ? args.sp : null) : null,
            };
        };

        //定义方法：通过在类的原型上定义，从而实现方法在各个页面实例中复用，以减少内存开销
        BasePage.prototype = {

            //初始化编辑页面
            initBill: function (opData) {

                //初始化表单验证
                this.initFormValid();

                //初始化菜单
                this.initMenu(this.opData);

                //单据数据包
                var uidata = this.opData && this.opData.billData && this.opData.billData.uidata ? this.opData.billData.uidata : null;

                //生成明细表格ID
                this.buildJqGridId();

                //设置表单控件值
                yiCommon.setFormValue(this.pageSelector, uidata);

                //设置表单明细数据源
                yiCommon.setFormEntrys(this.pageSelector, uidata);

                //解析控件
                this.parserControl();
            },

            //解析编辑页面的控件
            parserControl: function () {

                //下拉框控件
                $('.select2me', this.pageSelector).select2();

                //日期控件
                $('.date-picker', this.pageSelector).datepicker();

                //日期时间控件
                var $datetime = $(this.pageSelector).find('.form_datetime');
                $.isFunction($datetime.datetimepicker) && $datetime.datetimepicker();

                //查找所有 type='lookup' 的 input 元素，并将其初始化为一个基础资料控件
                $('input[type="lookup"]', this.pageSelector).bdSelect({
                    domainType: this.domainType,
                    formId: this.formId,
                    pageId: this.pageId,
                    page: this
                });

                //上传文件初始化
                var uploaders = $('div.uploader-file', this.pageSelector);
                if ($.isFunction(uploaders.uploader)) {
                    uploaders.uploader({ pageId: this.pageId });
                }

                //枚举资料 <select class='form-control select2me dynamic' name='xxx'>
                //这个样式，表示这个下拉是动态数据源。 
                var $select = $('select.select2me.dynamic', this.pageSelector);
                if ($.isFunction($select.selectdrop)) {
                    $select.selectdrop({
                        domainType: this.domainType,
                        formId: this.formId,
                        pageId: this.pageId
                    });
                }

                //复选框，单选按钮
                yiCommon.parserCheckboxRadio(this.pageSelector);
            },

            //初始化表单验证
            initFormValid: function () {

                //更多信息请访问官方插件文档：
                //http://docs.jquery.com/Plugins/Validation

                //要验证的表单
                var $form = $('form', this.pageSelector),
                    $error = $('.alert-danger', this.pageSelector);


                $form.validate({

                    //输入框错误信息的默认容器
                    errorElement: 'span',

                    //输入框错误信息的默认样式类
                    errorClass: 'help-block help-block-error',

                    //验证规则
                    rules: {
                        //fname: {
                        //    required: true
                        //}
                    },

                    //验证处理
                    invalidHandler: function (event, validator) {
                        $error.show();
                        //Metronic.scrollTo($error, -165);
                    },

                    //错误位置
                    errorPlacement: function (error, element) {
                        $(element).parent('.input-icon').children('i').addClass('fa-warning')
                        .attr('data-original-title', error.text()).tooltip({ 'container': 'body' });
                    },

                    //标出错误
                    highlight: function (element) {
                        $(element).closest('.form-group').addClass('has-error');
                    },

                    //取消错误
                    unhighlight: function (element) {
                        $(element).parent('.input-icon').children('i').removeClass('fa-warning');
                        $(element).closest('.form-group').removeClass('has-error');
                    },

                    //验证成功
                    success: function (label, element) {
                        $(element).parent('.input-icon').children('i').removeClass('fa-warning');
                        $(element).closest('.form-group').removeClass('has-error');
                    },

                    //提交
                    submitHandler: function (form) {
                        $error.hide();
                        return false;
                    }
                });
            },

            //初始化菜单
            initMenu: function (opData) {

                var menuList = null;

                if (opData) {

                    //如果存在 listMenu 那么说明是列表页面
                    if (opData.listMenu) {
                        menuList = opData.listMenu;
                    }

                    //如果存在 billMenu 那么说明是编辑页面
                    if (opData.billMenu) {
                        menuList = opData.billMenu;
                    }
                }

                //如果菜单列表不存在，这不需要显示菜单条
                if (menuList && menuList.length > 0) {

                    //菜单按钮容器
                    var menuSelector = $(Consts.menuSelector, this.pageSelector),

                    //菜单按钮 html 代码
                    menuHtml = '';

                    //根据元素里面的 order 属性进行排序（注：如果元素里面没有 order 属性，会导致排序有一定的错误）
                    menuList = menuList.sort(yiCommon.sortby('order'));

                    //最后一个肯定不会有分界线
                    for (var i = 0, l = menuList.length; i < l ; i++) {

                        //如果元素中的 style 是 split 就设置一道分界线
                        if (menuList[i].style !== 'split') {

                            //分割线 css 类
                            var split = '';
                            //当检测到当前是最后一条数据，就不进行此循环，因为最后一个肯定不会有分界线
                            if (i !== l - 1) {
                                //在每进行一次检测的时候，判断下一个是否为分界线，如果是，就设置一道边界，如果不是就下一个
                                if (menuList[i + 1].style === 'split') {

                                    split = ' border-right';
                                }
                            }

                            var menuParam = "";
                            if (menuList[i].param)
                            {
                                menuParam = menuList[i].param;
                            }

                            menuHtml += '<button type="button" id="{0}" opcode="{1}" class="btn btn-xs btn-primary{2}" data-param="{4}">{3}</button>'
                                .format(menuList[i].id, menuList[i].opcode, split, menuList[i].caption, menuParam);
                        }
                    }

                    //渲染菜单
                    menuSelector.html(menuHtml).show();
                }

                //初始化页面操作
                this.initPageOperate();
            },

            //初始化页面操作
            initPageOperate: function () {

                var that = this;

                //为页面中的所有有提供 opcode 属性的元素绑定点击事件
                $('[opcode]', that.pageSelector).on('click', function () {

                    //点击完后立即将焦点从当前操作元素上面移走，避免按键盘时浏览器执行默认的点击行为
                    $(this).blur();

                    //如果子类不存在该函数，或者该操作没有被子类的 js 订阅，则说明该操作需要父类统一处理
                    if (!$.isFunction(that.onMenuItemClick) || !that.onMenuItemClick($(this))) {

                        //为了与各个 js 操作类的类名一致，opcode 首字母大写，其他小写
                        var opcode = $(this).attr('opcode').toLowerCase().replace(/(\w)/, function (v) { return v.toUpperCase() });
                        var opParam = $(this).attr('data-param');
                        
                        //传递到各个 formop 中参数列表
                        var args = {
                            formId: that.formId,
                            pageId: that.pageId,
                            domainType: that.domainType,
                            openStyle: that.openStyle,
                            pageSelector: that.pageSelector,
                            param: eval("({" + (opParam || "") + "})")
                        };

                        //根据领域类型获取主键ID
                        switch (that.domainType) {

                            case Consts.domainType.list:
                                args.pkids = that.getSelectKeys();
                                break;

                            case Consts.domainType.bill:
                                args.pkids = [that.pkid];
                                break;

                            default:
                                break;
                        }

                        //创建操作实例并执行操作
                        var opfile = '/fw/js/platform/formop/{0}.js'.format(opcode);
                        yiCacheScript.g(opfile, function () {
                            new window[opcode](args);
                        });
                    }
                });
            },

            //初始化城市下拉框
            initCity: function (province, city) {

                var that = this,
                    defOption = '<option value="">市</option>';

                province = $.trim(province);
                city = $.trim(city);

                //清空城市下拉框数据源
                that.gebn('fcity').html(defOption).select2();

                //清空地区下拉框数据源
                that.gebn('fregion').html('<option value="">区</option>').select2();

                //加载城市下拉框数据源
                if (province) {
                    that.getAssistData({ category: '市', group: province }, function (ds) {
                        var optHtml = defOption;
                        if (ds) {
                            for (var i = 0, l = ds.length; i < l; i++) {
                                optHtml += '<option value="{0}">{1}</option>'.format(ds[i].fid, ds[i].fenumitem);
                            }
                        }
                        var $city = that.gebn('fcity').html(optHtml).select2();
                        if (city) {
                            $city.select2('val', city);
                        }
                    });
                }
            },

            //初始化区下拉框
            initRegion: function (city, region) {

                var that = this,
                    defOption = '<option value="">区</option>';

                city = $.trim(city);
                region = $.trim(region);

                //清空地区下拉框数据源
                that.gebn('fregion').html(defOption).select2();

                //加载地区下拉框数据源
                if (city) {
                    that.getAssistData({ category: '区', group: city }, function (ds) {
                        var optHtml = defOption;
                        if (ds) {
                            for (var i = 0, l = ds.length; i < l; i++) {
                                optHtml += '<option value="{0}">{1}</option>'.format(ds[i].fid, ds[i].fenumitem);
                            }
                        }
                        var $region = that.gebn('fregion').html(optHtml).select2();
                        if (region) {
                            $region.select2('val', region);
                        }
                    });
                }
            },

            //获取辅助资料
            getAssistData: function (params, callback) {
                yiAjax.p('/dynamic/bd_enum?operationno=loaddetail&' + $.param(params), {},
                    function (r) {
                        $.isFunction(callback) && callback(r.operationResult.srvData);
                    }
                );
            },

            //获取基础资料
            getBaseData: function (params, callback) {
                var url = '/{0}/{1}?operationno=baserefquery'.format(this.domainType, this.formId);
                yiAjax.p(url, { simpleData: params },
                    function (r) {
                        //是否能获取到基础资料信息
                        var ds = r.operationResult.srvData.data, d = ds && ds.length > 0 ? ds[0] : null;
                        if (d) {
                            $.isFunction(callback) && callback(d);
                        }
                    }
                );
            },

            //验证当前页面表单，验证通过返回 true，否则返回 false
            validForm: function () {
                return $('form', this.pageSelector).valid();
            },

            //获取选中记录的主键ID数组
            getSelectKeys: function () {
                return $(Consts.gridSelector.format(this.pageId)).jqGrid('getGridParam', 'selarrrow');
            },

            //获取选中记录的对象数组
            getSelectDatas: function () {
                var datas = [], ids = this.getSelectKeys();
                for (var i = 0; i < ids.length; i++) {
                    datas.push($(Consts.gridSelector.format(this.pageId)).jqGrid('getRowData', ids[i]));
                }
                return datas;
            },

            //生成明细表格ID
            buildJqGridId: function () {
                var that = this;
                $('table[entryId]', '#' + that.pageId).each(function () {
                    var entryId = $(this).attr('entryId'),
                        gid = '{0}_{1}'.format(that.pageId, entryId);
                    $(this).attr('id', gid);
                });
            },

            //根据 EntryId 得到 jqGrid 表格控件 ID
            getJqGridId: function (entryId) {
                return '{0}_{1}'.format(this.pageId, entryId);
            },

            //getElementByName：在当前页面中根据 name 获取 jquery 元素
            gebn: function (name) {
                return $('[name="' + name + '"]', this.pageSelector);
            },

            //getElementBySelector：在当前页面中根据 name 获取 jquery 元素
            gebs: function (selector) {
                return $(this.pageSelector).find(selector);
            },

            //InputValueByName：对当前页面中某个 input 进行 取值 或 赋值
            ivbn: function (name, val) {
                var $input = this.gebn(name);
                if (val === undefined) {
                    return $.trim($input.val());
                } else {
                    $input.val($.trim(val));
                }
            },

            /*
                获取当前页面某个字段的值
                参数：
                fn 为字段标识（fieldName）必需，比如：编码字段 fnumber
                en 为明细标识（entryName）可选，比如：费用明细 fexpenseentry ，该参数一般和 rn 参数配合使用，否则无意义
                rn 为明细行号或行ID（rowNum）可选，比如：行号 8 或者 行ID 230E3765，如果是整数则认为是行号，否则认为是行ID ，该参数一般和 en 参数配合使用，否则无意义
                返回值：
                普通字段返回 { id: 'value' }
                基础资料字段 和 辅助资料字段返回 { id: 'value', number: 'value', name: 'value' }
            */
            getFieldValue: function (fn, en, rn) {
                var that = this;

                //字段标识没传入，则直接返回 null
                if (!$.trim(fn)) { return null; }

                //如果有传入“明细标识”和“明细行号”，则认为是取明细字段值，否则认为是取表头字段值
                if (en && rn) {
                    return getEntryFieldValue();
                }
                return getHeadFieldValue();

                //获取表头字段值
                function getHeadFieldValue() {

                    //控件元素
                    var $el = $('[name="' + fn + '"]', that.pageSelector).eq(0);
                    if (!$el) { return null; }

                    //控件的 type 属性值
                    var type = $el.attr('type');

                    //基础资料
                    if (type === 'lookup') {
                        return {
                            id: $el.attr('keyId') || '',
                            name: $el.val() || '',
                            number: $el.attr('keyNumber') || ''
                        };
                    }

                    //复选框（获取的是选中状态 true 或 false）
                    if (type === 'checkbox') {
                        return { id: $el.is(':checked') };
                    }

                    //单选按钮（获取的是同一组单选按钮中选中项的 value 属性值）
                    if (type === 'radio') {
                        return { id: $.trim($('input[name="' + fn + '"]:checked', that.pageSelector).val()) };
                    }

                    //辅助资料
                    if ($el.hasClass('select2me')) {
                        var ad = $el.select2('data');
                        return {
                            id: ad.id,
                            name: ad.text,
                            number: ad.text
                        };
                    }

                    //其他控件（text, password, select, textarea, hidden）
                    return { id: $.trim($el.val()) };
                }

                //获取明细字段值
                function getEntryFieldValue() {

                    //明细行ID
                    var gid = that.getJqGridId(en),
                        rid = rn;

                    //如果是数字，则认为是行号
                    if ($.type(rn) === 'number') {
                        //根据行号获取行ID
                        rid = $('#' + gid).find('.jqgrow').eq(rn - 1).attr('id');
                    }
                    if (!rid) { return; }

                    //明细数据源
                    var eds = $('#' + gid).jqGrid('getGridParam', 'data');
                    if (eds) {
                        for (var i = 0, l = eds.length; i < l; i++) {
                            //如果能找到对应的行数据，并且存在给定属性
                            if (eds[i].id === rid && eds[i][fn] !== undefined) {
                                //如果是（基础资料 或 辅助资料）字段必然存在 name 属性
                                if (eds[i][fn + '_name'] !== undefined) {
                                    return {
                                        id: eds[i][fn],
                                        name: eds[i][fn + '_name'],
                                        number: eds[i][fn + '_number']
                                    };
                                } else {
                                    //普通字段
                                    return { id: eds[i][fn] };
                                }
                            }
                        }
                    }
                    //没获取到，则直接返回 null
                    return null;
                }
            },

            /*
                设置当前页面某个字段的值
                参数：
                fn 为字段标识（fieldName）必需，比如：编码字段 fnumber
                fv 为字段值（fieldValue）必须，比如：编码字段 2017030100001
                en 为明细标识（entryName）可选，比如：费用明细 fexpenseentry ，该参数一般和 rn 参数配合使用，否则无意义
                rn 为明细行号或行ID（rowNum）可选，比如：行号 8 或者 行ID 230E3765，如果是整数则认为是行号，否则认为是行ID ，该参数一般和 en 参数配合使用，否则无意义
                字段值：
                普通字段值（传的普通值） 
                基础资料字段 和 辅助资料字段值（传的是 基础资料 或 辅助资料 的主键ID）
            */
            setFieldValue: function (fn, fv, en, rn) {
                var that = this;

                //字段标识没传入，则不做处理
                if (!$.trim(fn)) { return; }

                //如果有传入“明细标识”和“明细行号”，则设置明细字段值，否则设置表头字段值
                if (en && rn) {
                    setEntryFieldValue();
                } else {
                    setHeadFieldValue();
                }

                //获取表头字段值
                function setHeadFieldValue() {

                    //控件元素
                    var $el = $('[name="' + fn + '"]', that.pageSelector).eq(0);
                    if (!$el) { return; }

                    //控件的 type 属性值
                    var type = $el.attr('type');
                    //基础资料
                    if (type === 'lookup') {
                        //根据基础资料ID fv 获取其他信息
                        that.getBaseData({ fieldKey: fn, id: fv }, function (d) {
                            $el.attr({ keyId: fv, keyNumber: d.fnumber || '' }).val(d.fname || '');
                        });
                        return;
                    }

                    //复选框（获取的是选中状态 true 或 false）
                    if (type === 'checkbox') {
                        $el.prop('checked', fv).parent().addClass('checked');
                        return;
                    }

                    //单选按钮（获取的是同一组单选按钮中选中项的 value 属性值）
                    if (type === 'radio') {
                        $('input:radio[name="' + fn + '"][value="' + fv + '"]', that.pageSelector).prop('checked', true);
                        return;
                    }

                    //辅助资料
                    if ($el.hasClass('select2me')) {
                    	//因为在为select2赋值的时候，有可能出现赋值失败，所以使用定时事件
                    	var timer;
                    	$el.select2('val', fv);
                    	//如果在数据填充前就赋值，导致赋值没有成功，就会进行下面的语句
                    	if($el.select2('val') === null){
                    		//开启一个定时器，重复赋值。
                    		timer=setInterval(function(){
                    			$el.select2('val', fv);
                    			if($el.select2('val') != null){
                    				//赋值成功，就停止定时器
                    				clearInterval(timer);
                    			}
                    		},10)
                    	}
                    	
                        return;
                    }

                    //日期控件
                    if ($el.parent().hasClass('date-picker')) {

                        //日期控件赋值处理，因为后端返回日期格式是：yyyy-MM-dd HH:mm:ss
                        $el.val($.trim(fv).replace('T', ' ').split(' ')[0]).change();
                        return;
                    }

                    //其他控件（text, password, select, textarea, hidden）
                    $el.val(fv);
                }

                //获取明细字段值
                function setEntryFieldValue() {

                    //明细行ID
                    var gid = that.getJqGridId(en),
                        rid = rn;

                    //如果是数字，则认为是行号
                    if ($.type(rn) === 'number') {
                        //根据行号获取行ID
                        rid = $('#' + gid).find('.jqgrow').eq(rn - 1).attr('id');
                    }
                    if (!rid) { return; }

                    //明细数据源
                    var eds = $('#' + gid).jqGrid('getGridParam', 'data'),
                        cms = $('#' + gid).jqGrid('getGridParam', 'colModel'),
                        editRowId = $('#' + gid).attr('editRowId'),
                        fn_t = fn + '_name', fnb_t = fn + '_number';
                    if (eds) {
                        for (var i = 0, l = eds.length; i < l; i++) {
                            //如果能找到对应的行数据
                            if (eds[i].id === rid) {

                                //是否是基础资料
                                if (isBd()) {

                                    //根据基础资料ID fv 获取其他信息
                                    that.getBaseData({ fieldKey: fn, id: fv }, function (d) {

                                        //更新数据源
                                        eds[i][fn] = fv
                                        eds[i][fn_t] = d.fname || '';
                                        eds[i][fnb_t] = d.fnumber || '';

                                        //当前要修改的明细行是否处于编辑状态
                                        if (editRowId === rid) {
                                            //更新控件值
                                            var $ctl = $('#' + rid + '_' + fn_t).find('input');
                                            if ($ctl.length > 0) {
                                                $ctl.attr({ keyId: fv, keyNumber: d.fnumber }).val(d.fname);
                                            } else {
                                                //调用表格控件本身的接口更新数据
                                                $('#' + gid).jqGrid('setCell', rid, fn_t, d.fname || '');
                                            }
                                        } else {
                                            //调用表格控件本身的接口更新数据
                                            $('#' + gid).jqGrid('setCell', rid, fn_t, d.fname || '');
                                        }
                                    });
                                }
                                    //是否是辅助资料
                                else if (isAd()) {

                                    //根据辅助资料ID fv 获取其他信息
                                    that.getAssistData({ id: fv }, function (ds) {

                                        //是否能获取到辅助资料信息
                                        var d = ds && ds.length > 0 ? ds[0] : null;
                                        if (!d) { return; }

                                        //更新数据源
                                        eds[i][fn] = fv
                                        eds[i][fn_t] = d.fenumitem;
                                        eds[i][fnb_t] = d.fenumitem;

                                        //当前要修改的明细行是否处于编辑状态
                                        if (editRowId === rid) {
                                            //更新控件值
                                            var $ctl = $('#' + rid + '_' + fn_t);
                                            if ($ctl.length > 0) {
                                                $ctl.select2('val', fv);
                                            } else {
                                                //调用表格控件本身的接口更新数据
                                                $('#' + gid).jqGrid('setCell', rid, fn_t, d.fenumitem || '');
                                            }
                                        } else {
                                            //调用表格控件本身的接口更新数据
                                            $('#' + gid).jqGrid('setCell', rid, fn_t, d.fenumitem || '');
                                        }
                                    });
                                }
                                    //普通字段
                                else {

                                    eds[i][fn] = fv;

                                    //当前要修改的明细行是否处于编辑状态
                                    if (editRowId === rid) {

                                        //当前列是否是编辑状态（如果能找到编辑控件，则为编辑状态）
                                        var $ipt = $('#' + rid + '_' + fn);
                                        if ($ipt.length > 0) {
                                            //更新单元格控件值
                                            var type = $ipt.attr('type');
                                            if (type === 'checkbox') {
                                                $ipt.prop('checked', fv);
                                            } else {
                                                $ipt.val(fv);
                                            }
                                        } else {
                                            //更新单元格值
                                            //调用表格控件本身的接口更新数据
                                            $('#' + gid).jqGrid('setCell', rid, fn, fv);
                                        }
                                    } else {
                                        //调用表格控件本身的接口更新数据
                                        $('#' + gid).jqGrid('setCell', rid, fn, fv);
                                    }
                                }

                                //重新设置明细数据源
                                $('#' + gid).jqGrid('getGridParam', eds);

                                break;
                            }
                        }
                    }

                    //用于检查是否是基础资料字段
                    function isBd() {
                        for (var j = 0, k = cms.length; j < k; j++) {
                            if (cms[j].edittype && cms[j].edittype === 'custom' && cms[j].name === fn + '_name') {
                                return true;
                            }
                        }
                        return false;
                    }

                    //用于检查是否是辅助资料字段
                    function isAd() {
                        for (var j = 0, k = cms.length; j < k; j++) {
                            if (cms[j].edittype && cms[j].edittype === 'select' && cms[j].name === fn + '_name') {
                                return true;
                            }
                        }
                        return false;
                    }
                }
            },
			
			/*获取或设置某个元素的内码值，始终都直接返回一个值，如：数字，日期，字符串，对于基础资料及辅助资料返回其内码
             *  fn 为字段标识（fieldName）必需，比如：编码字段 fnumber
             *  en 为明细标识（entryName）可选，比如：费用明细 fexpenseentry ，该参数一般和 rn 参数配合使用，否则无意义
             *   rn 为明细行号（rowNum）可选，比如：行号 8 ，该参数一般和 en 参数配合使用，否则无意义
            */
			getSimpleFieldValue: function (fn, en, rn) {
				//调用getFieldValue方法，获取元素的数据包
				var intCodeObj=that.getFieldValue(fn, en, rn);
				if(intCodeObj !== null){
					//如果数据包存在，则返回元素的内码值
					return intCodeObj.id;
				}
				//没获取到，则直接返回 null
				return null;
            },
            
			/*获取或设置某个dom元素的属性值，
			 *  fn 为dom元素字段标识（fieldName）必需，比如：编码字段 fnumber
			 * keyname 为dom元素上的属性
			 */
			getFieldAttribute: function (fn, attrname,keyname) {
				var that=this;
				//字段标识没传入，或者没有要获得的字段,则直接返回 null
                if (!$.trim(fn) || attrname === undefined) { return null; }
				
				//如果没有传入某条明细的标识，就跳过
				if($.trim(keyname)){
					return getEmtityFieldAttribute(fn, attrname,keyname);
				}
				
                return getHeadFieldAttribute(fn, attrname);
                
                function getHeadFieldAttribute (fn, attrname){
                	//控件元素
                    var $el = $('[name="' + fn + '"]', that.pageSelector).eq(0);
                    //控件的 用户需要的 属性值
                    return $el.attr(attrname)
                    
                }
                
                function getEmtityFieldAttribute (fn, attrname,keyname){
                	//明细行ID
                    var gid = that.getJqGridId(fn),
                    //获得当前表的colModel的结构
                    	cms = $('#' + gid).jqGrid('getGridParam', 'colModel');
                    //通过循环找到对应的某列，然后返回对应的attrname属性；
                    for(var i=0,l=cms.length; i<l; i++){
                    	if(cms[i].name === keyname){
                    		
                    		return cms[i][attrname];
                    	}
                    }
                    
                }
            },
            
            /*fn 为dom元素字段标识（fieldName）必需，比如：编码字段 fnumber
             * attrname是添加属性的名字，value是属性值
             * keyname是具体的某条明细标识
             * that.setFieldAttribute('fentity','y_value','a+b','fmaterialid_name');
             */
			setFieldAttribute: function (fn, attrname,value,keyname) {
				var that=this;
				//字段标识没传入,没有要设置的字段attrname和value，则直接返回 null
                if (!$.trim(fn)||attrname === undefined||value === undefined) { return null; }
				//如果没有传入某条明细的标识，就跳过
				if($.trim(keyname)){
					return setEntityFieldAttribute(fn, attrname,value,keyname);
				}
				
                return setHeadFieldAttribute(fn, attrname,value);
                
                function setHeadFieldAttribute (fn, attrname,value){
                	//控件元素
                    var $el = $('[name="' + fn + '"]', that.pageSelector).eq(0);
                    
                    //控件的 用户需要设置的 属性值
                    $el.attr(attrname,value);
                }
                function setEntityFieldAttribute (fn, attrname,value,keyname){
                	//明细行ID
                    var gid = that.getJqGridId(fn),
                    //获得当前表的colModel的结构
                    	cms = $('#' + gid).jqGrid('getGridParam', 'colModel');
                    
                    //通过循环找到对应的某列，然后添加自定义属性
                    for(var i=0,l=cms.length; i<l; i++){
                    	//通过某列的字段，来找到是那列，然后在colModel对应的列添加自定义属性
                    	if(cms[i].name === keyname){
                    		cms[i][attrname]=value;
                    	}
                    }
                    //重新设置后加载。
                    $('#' + gid).jqGrid('setGridParam',{
				    	colModel:cms         
				    }).trigger('reloadGrid');//重新载入
				    
                }
            },
			
            //菜单按钮点击时
            onMenuItemClick: function (params) {

            },

            //处理服务端返回的数据
            onProcessSrvData: function (params) {

            },

            //页面渲染完成后
            onPageRenderComplete: function (params) {

            },

            //页签关闭前
            onPageClosing: function (params) {

            },

            //页签关闭后
            onPageClosed: function (params) {

            },

            //页签刷新时
            onPageRefresh: function (params) {

            },

            //字段值改变后
            onFieldValueChanged: function (params) {

            },

            //操作前
            onBeforeDoOperation: function (params) {

            },

            //操作后
            onAfterDoOperation: function (params) {

            }
        };

        return BasePage;

    })();

    //如果 window 上面没有该属性，则将该属性扩展到 window 上面
    window.BasePage = window.BasePage || BasePage;

})();