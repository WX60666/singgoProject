/*
    1.插件用途：用于限制文本框，密码框，多行文本框的最大输入字符数
    
    2.使用方法：$('#id').maxLength(25);
*/

; (function ($, window, document, undefined) {

    //插件代码
    $.fn.maxLength = function (max) {

        //遍历当前所选择的 Dom 元素，并提供链式操作
        return this.each(function () {

            //标签名称
            var type = this.tagName.toLowerCase();

            //表单类型
            var inputType = this.type ? this.type.toLowerCase() : null;

            //如果标签名称是表单标签，并且标签类型是文本框 或者 密码框
            if (type === 'input' && inputType === 'text' || inputType === 'password') {

                //设置元素的 maxLength 属性值为当前要限制的最大字符数
                this.maxLength = max;
            }

                //如果是多行文本框
            else if (type === 'textarea') {

                //当一个键按下时
                this.onkeypress = function (e) {

                    //事件对象
                    var obj = e || event;

                    //是否有选择内容
                    var hasSelecton = document.selection ? document.selection.createRange().text.length > 0 : false;

                    //选择内容的开始位置 != 选择内容的结束位置
                    this.selectionStart != this.selectionEnd;

                    //如果满足以下条件，则不可以输入，否则可以输入
                    //1.输入的字符 >= 指定的最大字符数
                    //2.并且按键为：Enter 或 Spacebar 或 键盘代码 > 50
                    //3.并且 Ctrl 键被按下
                    //4.并且 Alt 键未被按下
                    //5.并且未选择内容

                    if (this.value.length >= max
                        && (obj.keyCode === 0 || obj.keyCode === 13 || obj.keyCode === 32 || obj.keyCode > 50)
                        && obj.ctrlKey
                        && !obj.altKey
                        && !hasSelecton) {

                        //不可以输入
                        return false;

                    } else {

                        //可以输入
                        return true;
                    }
                };

                //当一个键松开时
                this.onkeyup = function () {

                    //如果输入的字符 > 指定的最大字符数
                    if (this.value.length > max) {

                        //则自动截断多余的字符
                        this.value = this.value.substring(0, max);
                    }
                };
            }
        });
    };

})(jQuery, window, document);