/*
    系统数据管理类，包括钱币的格式转化
*/

; (function () {

    var yiMath = (function () {
        var math = function () { };
        return math;
    })();

    //扩展静态方法
    $.extend(yiMath, {

        /*
            将数字转换成指定的小数位（number 要转换的数字，precision 要保留的小数位，如果没有传递该参数，则默认保留两位小数，minPrecision 最少保留的小数位）
            比如：yiMath.toMoneyFormat(5400.800, 2, 0); 转换后为 5,400.8
        */
        toMoneyFormat: function (number, precision, minPrecision) {
            var newPrecision = precision || 2;
            if (minPrecision !== undefined) {
                precision = minPrecision;
                if (number !== null && number !== '') {
                    var numberString = String(number);
                    if (numberString.indexOf('.') > -1) {
                        var arrNumber = numberString.split('.');
                        if (arrNumber.length === 1 || arrNumber[1].length <= minPrecision) {
                            precision = minPrecision;
                        } else if (arrNumber[1].length < precision) {
                            precision = arrNumber[1].length
                        } else {
                            precision = newPrecision;
                        }
                    }
                }
            }
            return yiMath.toMilliFormat(yiMath.toDecimal(number, precision));
        },

        //将数字转换为带有千分位格式的数字字符串
        toMilliFormat: function (number) {
            var num = number + '';
            num = num.replace(new RegExp(',', 'g'), '');
            var symble = '';
            if (/^([-+]).*$/.test(num)) {
                symble = num.replace(/^([-+]).*$/, '$1');
                num = num.replace(/^([-+])(.*)$/, '$2');
            }
            if (/^[0-9]+(\.[0-9]+)?$/.test(num)) {
                num = num.replace(new RegExp('^[0]+', 'g'), '');
                if (/^\./.test(num)) {
                    num = '0' + num;
                }
                var decimal = num.replace(/^[0-9]+(\.[0-9]+)?$/, '$1');
                var integer = num.replace(/^([0-9]+)(\.[0-9]+)?$/, '$1');
                var re = /(\d+)(\d{3})/;
                while (re.test(integer)) {
                    integer = integer.replace(re, '$1,$2');
                }
                return symble + integer + decimal;
            } else {
                return number;
            }
        },

        /*
            将数字转换成指定的小数位（floatvar 要转换的数字，num 要保留的小数位，如果没有传递该参数，则默认保留两位小数）
            比如：转换前是 100 或 100.9800 ，转换后为 100.00 或 100.98
        */
        toDecimal: function (floatvar, num) {
            if (floatvar === undefined || floatvar === null || $.trim(floatvar) === '') {
                return '';
            }
            if (isNaN(floatvar)) {
                return floatvar;
            }
            var per = 100;
            if (num === undefined) {
                num = 2;
            }
            if (num === 0) {
                var numberString = String(floatvar);
                if (numberString.indexOf('.') > -1) {
                    return numberString.split('.')[0]
                } else {
                    return numberString;
                }
            }
            if (num === 4) {
                per = 10000;
            }
            if (num === 6) {
                per = 1000000;
            }
            var f_x = parseFloat(floatvar);
            if (isNaN(f_x)) {
                alert('function:changeTwoDecimal->parameter error');
                return false;
            }
            f_x = Math.round(f_x * per) / per;
            var s_x = f_x.toString();
            var pos_decimal = s_x.indexOf('.');
            if (pos_decimal < 0) {
                pos_decimal = s_x.length;
                s_x += '.';
            }
            while (s_x.length <= pos_decimal + num) {
                s_x += '0';
            }
            return s_x;
        },

        //将字符串转成数字（str 要转换的字符串，def 转换失败后的默认值，如果没有传递该默认值，则为 0）
        toNumber: function (str, def) {
            var num = parseFloat(str);
            if (isNaN(num)) {
                return def === undefined ? 0 : def;
            }
            return num;
        }
    });

    //扩展到 window 上面
    window.yiMath = yiMath;
})();