/*
    一个安全，结构良好，组织有序的插件编写格式如下：

	; (function ($, window, document, undefined) {

		//插件代码...

	})(jQuery, window, document);

*/

; (function ($, window, document, undefined) {

	//默认参数
	var defaults = {};

	//插件代码
	$.fn.pluginName = function (options) {

		//合并默认参数，但是不影响默认参数（保护好默认参数）
		var settings = $.extend({}, defaults, options);

		//支持链式调用
		return this.each(function () {

		});
	};

})(jQuery, window, document);