; (function () {
    //获取最顶层 window
    $.fn.yiTopWindow = (function (parent, current) {
        while (parent != current) {
            current = parent;
            parent = parent.parent;
        }
        return current;
    })(window.parent, window);
    //form提交
    $.fn.yiFormSubmit = function (options) {
        $(options.selector).form('submit', {
            url: options.url,
            onSubmit: function(){
                var isValid = $(this).form('validate');
                if (!isValid){
                    $.messager.progress('close');	// 如果表单是无效的则隐藏进度条
                }
                return isValid;	// 返回false终止表单提交
            },
            success: function(){
                $.messager.progress('close');	// 如果提交成功则隐藏进度条
            }
        });

        //获取参数
        options.param = $.extend(true, options.param, $(selector).mFormGetForm());
        //弹出遮罩
        $(selector).mask('');
        //异步提交,回掉函数可以获取刚才声称的参数
        mAjax.Post(options.url, options.param, function (msg) {
            if (options.callback) {
                options.callback(msg, options.param);
            }
            try {
                //取消遮罩
                $(selector).unmask();
            } catch (e) {
                //取消遮罩
                //$(selector).unmask();
            }
        }, function (msg) {
            if (options.error) {
                options.error(msg, options.param);
            }
            try {
                //取消遮罩
                $(selector).unmask();
            } catch (e) {
                //取消遮罩
                //$(selector).unmask();
            }
        });
    };
    //form校验
    $.fn.yiFormValidate = function (selector) {
        //如果没有传递表单，则取默认的 jquery 对象
        selector = selector ? selector : this;
        //校验结果
        var result = true;
        //获取指定表单中的所有 easyui 控件
        var easyUIControls = $(selector).yiGetEasyUIControls();
        //遍历每一种类型的组件校验
        for (var i = 0; i < easyUIControls.length ; i++) {
            //获取其中的一种
            var control = easyUIControls[i];
            //对其中某一种进行遍历
            for (var j = 0; j < control.controls.length ; j++) {
                //校验
                //switch (control.type)
                //{
                //    case 'validatebox':
                //        result = $(control.controls[j]).validatebox('validate') && result;
                //		break;
                //}
                result = eval('$(control.controls[' + j + ']).' + control.type + '(\'validate\')') && result;
            }
        }
        return result;
    };
    //获取指定表单中的所有 easyui 控件
    $.fu.yiGetEasyUIControls = function (selector) {
        //如果没有传递表单，则取默认的 jquery 对象
        selector = selector ? selector : this;
        //控件集合
        var result = [];
        //循环遍历获取每一种控件
        for (var i = 0 ; i < EasyUIControls.length ; i++) {
            //控件类型
            var type = EasyUIControls[i];
            //获取控件
            var controls = $('.easyui-' + type + ':not(.no-validate)', selector);
            //如果能获取到
            if (controls && controls.length > 0) {
                //加入控件集合
                result.push({ type: type, controls: controls });
            }
        }
        //返回
        return result;
    },
    ////获取form中的参数
    //$.fn.yiFormGetForm = function (selector) {
    //    //
    //    selector = selector ? selector : this;
    //    //多语言对应的数组
    //    var arrMultLang = new Array();
    //    //返回的对象
    //    var obj = {};
    //    $(dataFieldSelector, selector).each(function () {
    //        //
    //        var name = value = '';
    //        //easyuicontrol的类型
    //        var easyUIType = $(this).mIsEasyUIControl();
    //        //多语言字段
    //        if ($(this).hasClass(langFieldClassName)) {
    //            //多语言信息
    //            arrMultLang.push($(this).getLangEditorData());
    //        } else if (easyUIType) {
    //            //如果是easyui类型
    //            name = easyUIType.getName();
    //            value = $.trim(easyUIType.getValue());
    //        } else {
    //            //字段名字
    //            name = $(this).attr('name');
    //            //控件类型
    //            var type = $(this).attr('type');
    //            //checkbox
    //            if (type == 'checkbox') {
    //                //复选
    //                value = $(this).attr('checked') == 'checked' ? true : false;
    //            } else if (type == 'radio') {
    //                //单选
    //                if ($(this).is(':checked') == true) {
    //                    value = $(this).val();
    //                }
    //            } else {
    //                $(this).trigger('focus.hint');
    //                value = $.trim($(this).val());
    //                $(this).trigger('blur.hint');
    //            }
    //        }
    //        //名称合法，都可以传到后台去
    //        if (name) {
    //            //如果这个是金币类型的
    //            if ($(this).hasClass('money-format')) {
    //                //去掉分割符号
    //                value = value.replace(/\,/g, '');
    //            }
    //            //赋值
    //            obj[name] = value;
    //        }
    //    });
    //    obj.MultiLanguage = arrMultLang;
    //    //返回
    //    return obj;
    //};
    ////给form初始化值
    //$.fn.yiFormSetForm = function (data, selector) {
    //    //
    //    selector = selector ? selector : this;
    //    //是否需要初始化多语言
    //    var hasLangField = [];
    //    //获取所有需要设置值得字段
    //    $(dataFieldSelector).each(function () {
    //        //字段名字
    //        var name = $(this).attr('name');
    //        //字段的值
    //        var value = data[name];
    //        //是否是easyui空间集
    //        var easyUIType = $(this).mIsEasyUIControl();
    //        //是否是多语言字段
    //        if ($(this).hasClass(langFieldClassName)) {
    //            //多语言值
    //            var langDatas = data[multiLanguageName];
    //            //当前字段的多语言值
    //            var langData = '';
    //            //找到对应的多语言字段值
    //            for (var i = 0; i < langDatas.length ; i++) {
    //                //匹配名字
    //                if (langDatas[i].MFieldName == $(this).attr('name')) {
    //                    //找到为止
    //                    langData = langDatas[i];
    //                    break;
    //                }
    //            }
    //            //初始化多语言的值
    //            $(this).initLangEditor(langData);
    //        }
    //        else if (easyUIType) {
    //            //设置值
    //            easyUIType.setValue(data[easyUIType.getName()]);
    //        }
    //        else if ($(this).attr('type') == 'radio') {
    //            //radiobox
    //            $(this).attr('checked', value == true && $(this).val() == 'true');
    //        } else if ($(this).attr('type') == 'checkbox') {
    //            //checkbox
    //            $(this).attr('checked', (value == 'true' || value == true));
    //        }
    //        else {
    //            //针对于日期字段
    //            if (value && (value.toString().indexOf('/Date(') > -1 || $(this).hasClass('date-type'))) {
    //                //转化成日期格式
    //                value = $.mDate.format(value);
    //            }
    //            else if (value && $(this).hasClass('money-type')) {
    //                //如果是钱币字段
    //                value = mMath.toMoneyFormat(value);
    //            }
    //            //如果是input，则赋值
    //            $(this).is('input') || $(this).is('select') ? $(this).val(value) : $(this).text(value);
    //        }
    //    });
    //    //设置hint值
    //    if ($(selector).initHint != undefined) {
    //        $(selector).initHint();
    //    }
    //    //把changed都设置为空
    //    $('input,selected,textarea', selector).attr('changed', '');
    //};
    ////清空form中字段的值
    //$.fn.yiFormClearForm = function (selector) {
    //    //
    //    selector = selector ? selector : this;
    //    //
    //    $(selector).find(dataFieldSelector).each(function () {
    //        var defaultValue = '';
    //        if ($(this).attr('defaultValue') != undefined) {
    //            defaultValue = $(this).attr('defaultValue');
    //        }
    //        //是否是easyui空间集
    //        var easyUIType = $(this).mIsEasyUIControl();
    //        //如果是
    //        if (easyUIType) {
    //            //设置值
    //            easyUIType.setValue(defaultValue);
    //        } else if ($(this).attr('type') == 'radio') {
    //            $(this).attr('checked', false);
    //        } else if ($(this).attr('type') == 'checkbox') {
    //            $(this).attr('checked', false);
    //        } else {
    //            $(this).val(defaultValue);
    //        }
    //    });
    //};
    ////form disable，禁用页面内所有的输入框，选择框,每个需要禁用的，至少有mg-data样式，否则禁用没有意义
    //$.fn.yiFormDisable = function (selector) {
    //    //
    //    selector = selector ? selector : this;
    //    //获取所有有data-lang样式的
    //    $(dataFieldSelector, selector).each(function () {
    //        //
    //        var name = value = '';
    //        //easyuicontrol的类型
    //        var easyUIType = $(this).mIsEasyUIControl();
    //        //多语言字段
    //        if ($(this).hasClass(langFieldClassName)) {
    //            //多语言信息
    //            $(this).attr('readonly', 'readonly');
    //            //后面的按钮也禁用
    //            $(this).next('.m-lang-btn').hide();
    //        }
    //        else if (easyUIType) {
    //            //如果是easyui类型
    //            easyUIType.disable();
    //        }
    //        else {
    //            //控件类型
    //            var type = $(this).attr('type');
    //            //checkbox
    //            if (type == 'checkbox' || type == 'radio') {
    //                //复选
    //                $(this).attr('disabled', 'disabled');
    //            }
    //            else {
    //                //剩下的只有input了
    //                $(this).attr('readonly', 'readonly');
    //            }
    //        }
    //    });
    //};
    ////form disable，启用页面内所有的输入框，选择框,每个需要禁用的，至少有mg-data样式，否则禁用没有意义
    //$.fn.yiFormEnable = function (selector) {
    //    //
    //    selector = selector ? selector : this;
    //    //获取所有有data-lang样式的
    //    $(dataFieldSelector, selector).each(function () {
    //        //
    //        var name = value = '';
    //        //easyuicontrol的类型
    //        var easyUIType = $(this).mIsEasyUIControl();
    //        //多语言字段
    //        if ($(this).hasClass(langFieldClassName)) {
    //            //多语言信息
    //            $(this).attr('readonly', '');
    //            //后面的按钮也禁用
    //            $(this).next('.m-lang-btn').show();
    //        }
    //        else if (easyUIType) {
    //            //如果是easyui类型
    //            easyUIType.enable();
    //        }
    //        else {
    //            //控件类型
    //            var type = $(this).attr('type');
    //            //checkbox
    //            if (type == 'checkbox' || type == 'radio') {
    //                //复选
    //                $(this).attr('disabled', '');
    //            }
    //            else {
    //                //剩下的只有input了
    //                $(this).attr('readonly', '');
    //            }
    //        }
    //    });
    //};
    ////form get
    //$.fn.yiFormGet = function (options, selector) {
    //    selector = options.form || 'body';
    //    selector = selector ? selector : this;
    //    //打开遮罩
    //    $(selector).mask('');
    //    //所有的参数
    //    var param = options.param || {};
    //    //关键字段
    //    $(keyFieldSelector).each(function () {
    //        var keyValue = '';
    //        var paramName = '';
    //        //是否是easyui空间集
    //        var easyUIType = $(this).mIsEasyUIControl();
    //        //如果是
    //        if (easyUIType) {
    //            //获取name
    //            paramName = easyUIType.getName();
    //            //获取值
    //            keyValue = $.trim(easyUIType.getValue());
    //        } else if ($(this).attr('type') == 'radio') {
    //            if ($(this).is(':checked') == true) {
    //                paramName = $(this).attr('name');
    //                keyValue = $(this).val();
    //            }
    //        } else if ($(this).attr('type') == 'checkbox') {
    //            paramName = $(this).attr('name');
    //            keyValue = $(this).attr('checked');
    //        } else {
    //            paramName = $(this).attr('name')
    //            keyValue = $.trim($(this).val());
    //        }
    //        param[paramName] = keyValue;
    //    });
    //    //异步获取值
    //    mAjax.Post(options.url, param, function (data) {
    //        //如有有数据,set form必须在callback之前执行
    //        if (data && options.fill !== false) {
    //            //新的方式应该返回的格式为 {Data:data,Result:1/2/3..,Message:''},为了兼容老的写法，特用此例
    //            data = data.Data || data;
    //            //没有回掉函数的，则默认为初始化form
    //            $(selector).mFormSetForm(data);
    //        }
    //        //先调用回掉函数,如果传来了参数不需要填充form
    //        if (options.callback && $.isFunction(options.callback)) {
    //            //调用回调函数
    //            options.callback(data);
    //        }
    //        //取消遮罩
    //        $(selector).unmask();
    //    }, function () {
    //        $(selector).unmask();
    //    });
    //};
    ////form post
    //$.fn.yiFormPost = function (options, selector) {
    //    //
    //    selector = options.form || 'body';
    //    selector = selector ? selector : this;
    //    //遮罩
    //    $(selector).mask('');
    //    //
    //    if (!options.param) {
    //        options.param = null;
    //    }
    //    //是否需要校验
    //    if (options.validate == true) {
    //        var form = options.form;
    //        var result = $(form).mFormValidate();
    //        var extResult = true;
    //        //自定义的校验
    //        if (options.extValidate != undefined) {
    //            extResult = options.extValidate();
    //        }
    //        //有一个校验失败，则算是失败
    //        if (!result || !extResult) {
    //            return $(selector).unmask();
    //        }
    //    }
    //    //异步提交post请求
    //    mAjax.Post(options.url, options.param, function (msg) {
    //        //调用回掉函数
    //        if (options.callback != undefined) {
    //            options.callback(msg);
    //        }
    //        //取消遮罩
    //        $(selector).unmask()
    //    }, function () {
    //        //取消遮罩
    //        $(selector).unmask()
    //    });
    //};
})();