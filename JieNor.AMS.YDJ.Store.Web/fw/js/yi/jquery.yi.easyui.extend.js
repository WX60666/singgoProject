//扩展 Easy UI 校验规则
$.extend($.fn.validatebox.defaults.rules, {
    idcard: {
        validator: function (value) {
            return /^\d{15}(\d{2}[A-Za-z0-9])?$/i.test(value);
        },
        message: HtmlLang.Write(LangModule.Common, 'IDIncorrent', '身份证号码格式不正确！')
    },
    minLength: {
        validator: function (value, param) {
            return value.length >= param[0];
        },
        message: HtmlLang.Write(LangModule.Common, 'Needtoenteratleastcharacters', '至少需要输入{0}字符。')
    },
    length: {
        validator: function (value, param) {
            var len = $.trim(value).length;
            return len >= param[0] && len <= param[1];
        },
        message: HtmlLang.Write(LangModule.Common, 'InputContentLength', '输入长度必须在{0}到{1}之间！')
    },
    phone: {
        validator: function (value) {
            var isPhone = /([0-9]{3,4}-)?[0-9]{7,8}/;
            var isMob = /^((\+?86)|(\(\+86\)))?(13[012356789][0-9]{8}|15[012356789][0-9]{8}|18[02356789][0-9]{8}|147[0-9]{8}|170[0-9]{8}|1349[0-9]{7})$/;
            return isMob.test(value) || isPhone.test(value);
        },
        message: HtmlLang.Write(LangModule.Common, 'PhoneNumberIncorrect', '电话号码格式不正确！例如：010-88888888')
    },
    mobile: {
        validator: function (value) {
            return /^(13|15|18)\d{9}$/i.test(value);
        },
        message: HtmlLang.Write(LangModule.Common, 'MobileNumberIncorrect', '手机号码格式不正确！')
    },
    intOrFloat: {
        validator: function (value) {
            return /^\d+(\.\d+)?$/i.test(value);
        },
        message: HtmlLang.Write(LangModule.Common, 'IntOrFloat', '请输入数字，并确保正确的格式！')
    },
    currency: {
        validator: function (value) {
            return /^\d+(\.\d+)?$/i.test(value);
        },
        message: HtmlLang.Write(LangModule.Common, 'CurrencyIncorrent', '货币格式不正确！')
    },
    qq: {
        validator: function (value) {
            return /^[1-9]\d{4,9}$/i.test(value);
        },
        message: HtmlLang.Write(LangModule.Common, 'QQIncorrent', 'QQ号码格式不正确！')
    },
    integer: {
        validator: function (value) {
            return /^([+]?[0-9])|([-]?[0-9])+\d*$/i.test(value);
        },
        message: HtmlLang.Write(LangModule.Common, 'InputInt', '请输入一个整数！')
    },
    age: {
        validator: function (value) {
            return /^(?:[1-9][0-9]?|1[01][0-9]|120)$/i.test(value);
        },
        message: HtmlLang.Write(LangModule.Common, 'AgeIncorrent', '年龄必须在0到120之间的整数！')
    },
    chinese: {
        validator: function (value) {
            return /^[\Α-\￥]+$/i.test(value);
        },
        message: HtmlLang.Write(LangModule.Common, 'InputChinese', '请输入中文！')
    },
    english: {
        validator: function (value) {
            return /^[A-Za-z]+$/i.test(value);
        },
        message: HtmlLang.Write(LangModule.Common, 'InputEnglish', '请输入英文！')
    },
    unnormal: {
        validator: function (value) {
            return /.+/i.test(value);
        },
        message: HtmlLang.Write(LangModule.Common, 'unnormal', '输入值不能是空的和其他包含的非法字符！')
    },
    username: {
        validator: function (value) {
            return /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/i.test(value);
        },
        message: HtmlLang.Write(LangModule.Common, 'UserNameIncorrent', '用户名非法（允许字母，数字，下划线组成）！')
    },
    faxno: {
        validator: function (value) {
            return /^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/i.test(value);
        },
        message: HtmlLang.Write(LangModule.Common, 'FaxnoIncorrent', '传真格式不正确！')
    },
    zip: {
        validator: function (value) {
            return /^[0-9]{6}$/i.test(value);
        },
        message: HtmlLang.Write(LangModule.Common, 'ZipIncorrent', '邮政编码格式不正确！')
    },
    ip: {
        validator: function (value) {
            return /d+.d+.d+.d+/i.test(value);
        },
        message: HtmlLang.Write(LangModule.Common, 'IPIncorrent', 'IP地址格式不正确！')
    },
    //验证姓名，可以是中文或英文
    name: {
        validator: function (value) {
            return /^[\Α-\￥]+$/i.test(value) | /^\w+[\w\s]+\w+$/i.test(value);
        },
        message: HtmlLang.Write(LangModule.Common, 'InputName', '请输入名字！')
    },
    //验证日期，格式 yyyy-MM-dd 或 yyyy-M-d
    date: {
        validator: function (value) {
            return /^(?:(?!0000)[0-9]{4}([-]?)(?:(?:0?[1-9]|1[0-2])\1(?:0?[1-9]|1[0-9]|2[0-8])|(?:0?[13-9]|1[0-2])\1(?:29|30)|(?:0?[13578]|1[02])\1(?:31))|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)([-]?)0?2\2(?:29))$/i.test(value);
        },
        message: HtmlLang.Write(LangModule.Common, 'DateFormatIncorrent', '日期格式不正确！')
    },
    msn: {
        validator: function (value) {
            return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value);
        },
        message: HtmlLang.Write(LangModule.Common, 'MSNIncorrent', 'MSN格式不正确，例如：abc@hotnail(msn/live).com')
    },
    same: {
        validator: function (value, param) {
            if ($('#' + param[0]).val() !== '' && value !== '') {
                return $('#' + param[0]).val() == value;
            } else {
                return true;
            }
        },
        message: HtmlLang.Write(LangModule.Common, 'TowPasswordNotSame', '两个密码不匹配！')
    },
    maxDate: {
        validator: function (value, param) {
            var d1 = $.fn.datebox.defaults.parser(param[0]);
            var d2 = $.fn.datebox.defaults.parser(value);
            return d2 < d1;
        },
        message: HtmlLang.Write(LangModule.Common, 'datemustlessthan', '日期必须小于{0}！')
    },
    minDate: {
        validator: function (value, param) {
            var d1 = $.fn.datebox.defaults.parser(param[0]);
            var d2 = $.fn.datebox.defaults.parser(value);
            return d2 >= d1;
        },
        message: HtmlLang.Write(LangModule.Common, 'datemustlargerthan', '日期必须大于或等于{0}！')
    },
    day: {
        validator: function (value) {
            var temp = parseInt(value);
            return temp >= 1 && temp <= 31;
        },
        message: HtmlLang.Write(LangModule.Common, 'day', '天数必须 1 到 31 之间！')
    }
});
//扩展 Easy UI Combobox，向现有下拉框中添加一个方法，用于选择月份
$.extend($.fn.combobox.methods, {
    yearAndMonth: function (jq) {
        return jq.each(function () {
            var obj = $(this).combobox();
            var date = new Date();
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var table = $('<table>');
            var tr1 = $('<tr>');
            var tr1td1 = $('<td>', {
                text: '－',
                click: function () {
                    var y = $(this).next().html();
                    y = parseInt(y) - 1;
                    $(this).next().html(y);
                }
            });
            var def = year + '-' + ((month < 10 ? '0' + month : month));
            obj.combobox('setValue', def).combobox('setText', def);
            tr1td1.appendTo(tr1);
            $('<td>', { text: year }).appendTo(tr1);

            $('<td>', {
                text: '＋',
                click: function () {
                    var y = $(this).prev().html();
                    y = parseInt(y) + 1;
                    $(this).prev().html(y);
                }
            }).appendTo(tr1);
            tr1.appendTo(table);

            var n = 1;
            for (var i = 1; i <= 4; i++) {
                var tr = $('<tr>');
                for (var m = 1; m <= 3; m++) {
                    var td = $('<td>', {
                        text: n,
                        click: function () {
                            var yyyy = $(table).find('tr:first>td:eq(1)').html();
                            var cell = $(this).html();
                            var v = yyyy + '-' + (cell.length < 2 ? '0' + cell : cell);
                            obj.combobox('setValue', v).combobox('setText', v).combobox('hidePanel');
                        }
                    });
                    if (n === month) {
                        td.addClass('tdbackground');
                    }
                    td.appendTo(tr);
                    n++;
                }
                tr.appendTo(table);
            }
            table.addClass('mytable cursor');
            table.find('td').hover(function () {
                $(this).addClass('tdbackground');
            }, function () {
                $(this).removeClass('tdbackground');
            });
            table.appendTo(obj.combobox('panel'));
        });
    }
});