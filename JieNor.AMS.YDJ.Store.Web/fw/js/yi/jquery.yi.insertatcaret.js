/*
    1.插件用途：在文本框所在的光标处插入指定的内容
    
    2.使用方法：$('#id').insertAtCaret('要插入的内容');
*/

; (function ($, window, document, undefined) {

    //插件代码
    $.fn.insertAtCaret = function (content) {

        //遍历当前所选择的 Dom 元素，并提供链式操作
        return this.each(function () {

            //当前遍历的 Dom 元素，是否存在 hint 属性
            var hint = $.trim($(this).attr('hint'));
            if (hint) {
                //如果存在，则将该属性值在文本框中清除掉
                this.value = this.value.replace(hint, '');
            }

            //是否有选择内容
            if (document.selection) {

                this.focus();

                document.selection.createRange().text = content;

                this.focus();

            } else {

                //如果选择内容的开始位置存在 或者 为 0
                if (this.selectionStart || this.selectionStart === 0) {

                    //选择内容的开始位置
                    var ss = this.selectionStart;

                    //选择内容的结束位置
                    var sn = this.selectionEnd;

                    //文本框滚动条的垂直位置
                    var st = this.scrollTop;

                    this.value = this.value.substring(0, ss) + content + this.value.substring(sn, this.value.length);

                    this.focus();

                    this.selectionStart = ss + content.length;

                    this.selectionEnd = ss + content.length;

                    this.scrollTop = st;

                } else {

                    this.value += content;

                    this.focus();
                }
            }
        });
    };

})(jQuery, window, document);