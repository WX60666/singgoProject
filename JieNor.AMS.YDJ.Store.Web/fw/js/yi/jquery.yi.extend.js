//公用的专门来实现继承的函数
//第一个参数：子类
//第二个参数：父类
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//日期格式化
Date.prototype.format = function (format) {
    var o = {
        'M+': this.getMonth() + 1,
        'd+': this.getDate(),
        'h+': this.getHours() % 12 == 0 ? 12 : this.getHours() % 12,
        'H+': this.getHours(),
        't+': this.getHours() <= 12 ? '上午' : '下午',
        'm+': this.getMinutes(),
        's+': this.getSeconds(),
        'q+': Math.floor((this.getMonth() + 3) / 3),
        'S': this.getMilliseconds()
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
    (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (var k in o) if (new RegExp('(' + k + ')').test(format))
        format = format.replace(RegExp.$1,
      RegExp.$1.length == 1 ? o[k] :
        ('00' + o[k]).substr(('' + o[k]).length));
    return format;
};
//数组去除重复元素
Array.prototype.distinct = function () {
    var self = this;
    var _a = this.concat().sort();
    _a.sort(function (a, b) {
        if (a === b) {
            var n = self.indexOf(a);
            self.splice(n, 1);
        }
    });
    return self;
};
//字符串格式化
String.prototype.format = function (args) {
    if (arguments.length > 0) {
        var result = this, reg;
        if (arguments.length === 1 && typeof (args) === 'object') {
            for (var key in args) {
                if (key === null) {
                    continue;
                }
                reg = new RegExp('({' + key + '})', 'g');
                result = result.replace(reg, args[key]);
            }
        } else {
            for (var i = 0; i < arguments.length; i++) {
                var value = arguments[i];
                if (value === undefined || value === null) {
                    //continue;
                    value = '';
                }
                if (value.toString().indexOf('/Date(') > -1) {
                    value = $.mDate.format(value);
                }
                reg = new RegExp('({[' + i + ']})', 'g');
                result = result.replace(reg, value);
            }
        }
        return result;
    } else {
        return this;
    }
};
//字符串去除前面空格
String.prototype.trimStart = function (trimStr) {
    trimStr = trimStr ? trimStr : ' ';
    var temp = this;
    while (true) {
        if (temp.substr(0, trimStr.length) !== trimStr) {
            break;
        }
        temp = temp.substr(trimStr.length);
    }
    return temp.toString();
};
//字符串去除尾部空格
String.prototype.trimEnd = function (trimStr) {
    trimStr = trimStr ? trimStr : ' ';
    var temp = this;
    while (true) {
        if (temp.substr(temp.length - trimStr.length, trimStr.length) !== trimStr) {
            break;
        }
        temp = temp.substr(0, temp.length - trimStr.length);
    }
    return temp.toString();
};
//字符串去除前后空格
String.prototype.trim = function (trimStr) {
    trimStr = trimStr ? trimStr : ' ';
    return this.trimStart(trimStr).trimEnd(trimStr).toString();
};
//字符串首字母转换为小写
String.prototype.toUpperChar = function () {
    return this.substr(0, 1).toUpperCase() + this.substr(1);
};