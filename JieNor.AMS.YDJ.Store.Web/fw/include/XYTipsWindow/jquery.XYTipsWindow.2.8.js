/*
 * jQuery XYTipsWindow Plus @requires jQuery v1.3.2
 * Dual licensed under the MIT and GPL licenses.
 *
 * Copyright (c) xinyour (http://www.xinyour.com/)
 *
 * Autor: Await
 * webSite: http://leotheme.cn/
 * Date: 星期四 2011年05月15日
 * Version: 2.8.0
 **********************************************************************
 * @example
 * $("#example").XYTipsWindow();
 **********************************************************************
 * XYTipsWindow o参数可配置项：
 *		    mTitle : 窗口标题文字;
 *	  	    mBoxID : 弹出层ID(默认随机);
 *	 	  mContent : 内容(可选内容为){ text | id | img | swf | url | iframe};
 *	 	    mWidth : 窗口宽度(默认宽度为300px);
 *	 	   mHeight : 窗口离度(默认高度为200px);
 *	   mTitleClass : 窗口标题样式名称;
 *	 	  mCloseID : 关闭窗口ID;
 *	    mTriggerID : 相对于这个ID定位;[暂时取消此功能]
 *	   mBoxBdColor : 弹出层外层边框颜色(默认值:#E9F3FD);
 *   mBoxBdOpacity : 弹出层外层边框透明度(默认值:1,不透明);
 * mBoxWrapBdColor : 弹出层内部边框颜色(默认值:#A6C9E1);
 *  mWindowBgColor : 遮罩层背景颜色(默认值:#000000);
 *mWindowBgOpacity : 遮罩层背景透明度(默认值:0.5);
 *		     mTime : 自动关闭等待时间;(单位毫秒);
 *		     mDrag : 拖动手柄ID[当指定mTriggerID的时候禁止拖动];
 * mDragBoxOpacity : 设置窗口拖动时窗口透明度(默认值:1,不透明);
 *	    mShowTitle : 是否显示标题(布尔值 默认为true);
 *	    mShowBoxbg : 是否显示弹出层背景(布尔值 默认为true);
 *		   mShowbg : 是否显示遮罩层(布尔值 默认为false);
 *	  	   mButton : 数组，要显示按钮的文字;
 *		 mCallback : 回调函数，默认返回所选按钮显示的文 ;
 *		  mOffsets : 设定弹出层位置,默认居中;内置固定位置浮动:left-top(左上角);right-top(右上角);left-bottom(左下角);right-bottom(右下角);middle-top(居中置顶);middle-bottom(居中置低);left-middle(靠左居中);right-middle(靠右居中);
 *		      mFns : 弹出窗口后执行的函数;
 *       mCloseFns : 关闭窗口后执行的函数;
 * mCloseCallback  : 关闭窗口后调用父窗口的函数
 *            mMax : 是否可以最大化，最小化
 *         mLoaded : 弹窗框加载成功后执行函数
 *       mPostData : post参数
 **********************************************************************/
; (function () {
    $.XYTipsWindow = function (o) {
        defaults = $.extend({
            mTitle: "",
            mBoxID: boxID(10),
            mContent: "text:内容",
            mWidth: $(window).width(),
            mHeight: $(window).height() - 35,
            mTitleClass: "boxTitle",
            mCloseID: "",
            mTriggerID: "",
            mBoxBdColor: "#E9F3FD",
            mBoxBdOpacity: "1",
            mBoxWrapBdColor: "#A6C9E1",
            mWindowBgColor: "#000000",
            mWindowBgOpacity: "0.5",
            mTime: "",
            mDrag: "",
            mDragBoxOpacity: "1",
            mShowTitle: true,
            mShowBoxbg: true,
            mShowbg: true,
            mOffsets: "",
            mButton: "",
            mMax: true,
            mCallback: function () { },
            mFns: function () { },
            mLoaded: function () { },
            mPostData:null
        }, o);
        $.XYTipsWindow.init(defaults);
        $.XYTipsWindow.options = defaults;
    };
    var BOXID, isIE6 = !-[1, ] && !window.XMLHttpRequest;
    var $XYTipsWindowarr = new Array();
    var boxID = function (n) {
        var Str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0, r = ""; i < n; i++) {
            r += Str.charAt(Math.floor(Math.random() * 62));
        };
        return r;
    };
    $.extend($.XYTipsWindow, {
        //初始化
        init: function (o) {
            BOXID = o;
            if ($("#" + o.mBoxID).length > 0) {
                alert("对不起，创建弹出层失败！窗口“" + o.mBoxID + "”已存在！");
                return false;
            };
            //对话框弹出层
            var $box = $("#" + o.mBoxID);
            //显示对话框
            $.XYTipsWindow.showBox(o);
            //关闭功能
            $(".mCloseBox", $box).die().live("click", function () {
                return $.XYTipsWindow.closeBox(o);
            }).css({ zIndex: "870618" });
            //最大化功能
            $(".mMaxBox", $box).die().live("click", function () {
                $.XYTipsWindow.maxBox();
            }).css({ zIndex: "870618" });
            //最小化功能
            $(".mMinBox", $box).die().live("click", function () {
                $.XYTipsWindow.minBox();
            }).css({ zIndex: "870618" });
            //双击功能（最大化 和 最小化）切换
            $(".boxTitle", $box).die().live("dblclick", function () {
                if (o.mMax) {
                    if ($("#" + o.mBoxID).data("data")) {
                        $.XYTipsWindow.minBox();
                    }
                    else {
                        $.XYTipsWindow.maxBox();
                    }
                }
            });
            //用户自定义关闭标签
            if (o.mCloseID != "") {
                $("#" + o.mCloseID, $box).die().live("click", function () {
                    $.XYTipsWindow.removeBox();
                });
            };
            //在指定的时间后自动关闭对话框
            if (o.mTime != "") {
                setTimeout($.XYTipsWindow.removeBox, o.mTime);
            };
            //显示背景
            if (o.mShowbg != "" && o.mShowbg == true) {
                var $boxBgDom = "<div id=\"XYTipsWindowBg\" style=\"position:absolute;overflow:hidden;height:" + $(document).height() + "px;background:" + o.mWindowBgColor + ";filter:alpha(opacity=0);opacity:0;width:100%;left:0;top:0;z-index:870618\"><iframe src=\"about:blank\" style=\"width=100%;height:" + ($(document).height()) + "px;filter:alpha(opacity=0);opacity:0;scrolling=no;z-index:870610\"></iframe></div>";
                $($boxBgDom).appendTo("body").animate({ opacity: o.mWindowBgOpacity }, 200);
            };
            //拖拽功能
            if (o.mDrag != "") {
                $.XYTipsWindow.dragBox(o);
            };
            //弹窗后执行指定的回调函数
            if (o.mFns != "" && $.isFunction(o.mFns)) {
                o.mFns.call(this);
            };
            $.XYTipsWindow.contentBox(o);
            if (o.mButton != "") {
                $.XYTipsWindow.ask(o);
            };
            $.XYTipsWindow.keyDown(o);
            $.XYTipsWindow.setBoxzIndex(o);
            if (o.mShowbg != true) {
                $("#" + o.mBoxID).addClass("shadow");
            };
            $("#" + o.mBoxID).die().live("mouseenter", function () {
                BOXID = o;
            });
        },
        getID: function () {
            return thisID = BOXID.mBoxID;
        },
        //关闭box
        closeBox: function (o) {
            o = o || $.XYTipsWindow.options;
            //
            var $tipsWindow = $(".XYTipsWindow");
            //获取参数
            var index = $tipsWindow.attr("index"), param = $tipsWindow.attr("param");
            //如果有关闭调用函数
            if (o.mCloseFns && $.isFunction(o.mCloseFns)) {
                o.mCloseFns();
            };
            //如果有回调函数函数
            if (o.mCloseCallback) {
                //会执行的函数
                var func = $.isArray(o.mCloseCallback) ? (o.mCloseCallback[index ? index : 0]) : o.mCloseCallback;
                //如果是函数
                $.isFunction(func) ? func(param) : "";
            }
            //然后再关闭窗口
            $.XYTipsWindow.removeBox();
        },
        //如果本身就在弹出框中
        handlePanrentTile: function (max) {
            //
            var parentTipsWindow = $(".XYTipsWindow", window.parent.document);
            //
            if (parentTipsWindow) {
                if (max === true && $(".mMaxBox", parentTipsWindow).is(":visible")) {
                    //$(".mMaxBox", parentTipsWindow).trigger("click");
                    //$.XYTipsWindow.hideParentTitle(parentTipsWindow);
                    window.parent.window.$.XYTipsWindow.maxBox();
                }
                else if (max === false && $(".mMinBox", parentTipsWindow).is(":visible")) {
                    //$.XYTipsWindow.showParentTitle(parentTipsWindow);
                    //$(".mMinBox", parentTipsWindow).trigger("click");
                    window.parent.window.$.XYTipsWindow.minBox();
                }
            }
        },
        //构造弹出层
        showBox: function (o) {
            //处理
            $.XYTipsWindow.handlePanrentTile(true);
            //是否显示标题栏，决定标题栏的高度
            var $titleHeight = 35,
				$borderHeight = 0;
            $boxDialogHeight = o.mButton != "" ? 45 : 0;
            //border 设置为0
            $boxDialogBorder = 0;
            //初始化的时候，高度和宽度都有限定
            var $width = parseInt(o.mWidth),
				$height = parseInt(o.mHeight);
            //第二层
            var $boxDom = "<div id=\"" + o.mBoxID + "\" class=\"XYTipsWindow\">";
            //第三层
            $boxDom += "<div class=\"mBoxWrap\">";
            $boxDom += "<div class=\"mBoxTitle\"><h3></h3><span class=\"mMaxBox\">最大化</span><span class=\"mMinBox\"  style=\"display:none;\">最小化</span><span class=\"mCloseBox\">关闭</span></div>";
            //第四层
            $boxDom += "<div class=\"mBoxContent\"></div>";
            $boxDom += "<div class=\"mBoxDialog\"></div>";
            $boxDom += "</div>";
            $boxDom += "<div class=\"mBoxBd m-box-bd\"></div>";
            //第五层
            $boxDom += "<iframe src=\"about:blank\" style=\"position:absolute;left:0;top:0;filter:alpha(opacity=0);opacity:0;scrolling=no;z-index:10714\"></iframe>";
            $boxDom += "</div>";
            $($boxDom).appendTo("body");
            //是否启用最大化最小化
            if (!o.mMax) {
                $(".mMaxBox,.mMinBox").hide();
            }
            var $box = $("#" + o.mBoxID);
            $box.css({
                position: "relative",
                width: $width + "px",
                height: $height + $titleHeight + $borderHeight + $boxDialogHeight + "px",
                zIndex: "891208"
            });
            var $iframe = $("iframe", $box);
            $iframe.css({
                width: $width + "px",
                height: $height + $titleHeight + $borderHeight + $boxDialogHeight + "px"
            });
            var $boxWrap = $(".mBoxWrap", $box);
            $boxWrap.css({
                position: "relative",
                top: "4px",
                margin: "0 auto",
                width: $width + "px",
                height: $height + $titleHeight + $boxDialogHeight + "px",
                overflow: "hidden",
                zIndex: "20590"
            });
            var $boxContent = $(".mBoxContent", $box);
            $boxContent.css({
                position: "relative",
                width: $width + "px",
                height: $height + "px",
                padding: "0px",
                borderWidth: "0px",
                borderStyle: "solid",
                borderColor: o.mBoxWrapBdColor,
                overflow: "auto",
                backgroundColor: "#fff"
            });
            var $boxDialog = $(".mBoxDialog", $box);
            $boxDialog.css({
                width: $width + "px",
                height: $boxDialogHeight + "px",
                borderWidth: $boxDialogBorder + "px",
                borderStyle: "solid",
                borderColor: o.mBoxWrapBdColor,
                borderTop: "none",
                textAlign: "right"
            });
            var $boxBg = $(".mBoxBd", $box);
            $boxBg.css({
                position: "absolute",
                width: $width + "px",
                height: $height + $titleHeight + $borderHeight + $boxDialogHeight + "px",
                left: "0px",
                top: "0",
                opacity: o.mBoxBdOpacity,
                zIndex: "10715"
            });
            var $title = $(".mBoxTitle>h3", $box);
            $title.html(o.mTitle);
            $title.parent().css({
                position: "relative",
                width: ($width) + "px"//,
                //borderColor: o.mBoxWrapBdColor
            });
            if (o.mTitleClass != "") {
                $title.parent().addClass(o.mTitleClass);
                $title.parent().find("span").hover(function () {
                    $(this).addClass("hover");
                }, function () {
                    $(this).removeClass("hover");
                });
            };
            if (o.mShowTitle != true) { $(".mBoxTitle", $box).remove(); }
            if (o.mShowBoxbg != true) {
                $(".mBoxBd", $box).remove();
                $box.css({
                    width: $width + "px",
                    height: $height + $titleHeight + $boxDialogHeight + "px"
                });
                $boxWrap.css({ left: "0", top: "0" });
            };
            //定位弹出层
            var TOP = -1;
            $.XYTipsWindow.getDomPosition(o);
            var $location = o.mOffsets;
            //最外层
            var $wrap = $("<div id=\"" + o.mBoxID + "parent\"></div>");
            var est = isIE6 ? (o.mTriggerID != "" ? 0 : document.documentElement.scrollTop) : "";
            if (o.mOffsets == "" || o.mOffsets.constructor == String) {
                switch ($location) {
                    case ("left-top")://左上角
                        $location = { left: "0px", top: "0px" + est };
                        TOP = 0;
                        break;
                    case ("left-bottom")://左下角
                        $location = { left: "0px", bottom: "0px" };
                        break;
                    case ("right-top")://右上角
                        $location = { right: "0px", top: "0px" + est };
                        TOP = 0;
                        break;
                    case ("right-bottom")://右下角
                        $location = { right: "0px", bottom: "0px" };
                        break;
                    case ("middle-top")://居中置顶
                        $location = { left: "50%", marginLeft: -parseInt($box.width() / 2) + "px", top: "0px" + est };
                        TOP = 0;
                        break;
                    case ("middle-bottom")://居中置低
                        $location = { left: "50%", marginLeft: -parseInt($box.width() / 2) + "px", bottom: "0px" };
                        break;
                    case ("left-middle")://左边居中
                        $location = { left: "0px", top: "50%" + est, marginTop: -parseInt($box.height() / 2) + "px" + est };
                        TOP = $getPageSize[1] / 2 - $box.height() / 2;
                        break;
                    case ("right-middle")://右边居中
                        $location = { right: "0px", top: "50%" + est, marginTop: -parseInt($box.height() / 2) + "px" + est };
                        TOP = $getPageSize[1] / 2 - $box.height() / 2;
                        break;
                    default://默认为居中
                        $location = { left: "50%", marginLeft: -parseInt($box.width() / 2) + "px", top: "50%" + est, marginTop: -parseInt($box.height() / 2) + "px" + est };
                        TOP = $getPageSize[1] / 2 - $box.height() / 2;
                        break;
                };
            } else {
                var str = $location.top;
                $location.top = $location.top + est;
                if (typeof (str) != 'undefined') {
                    str = str.replace("px", "");
                    TOP = str;
                };
            };
            if (o.mTriggerID != "") {
                var $offset = $("#" + o.mTriggerID).offset();
                var triggerID_W = $("#" + o.mTriggerID).outerWidth(), triggerID_H = $("#" + o.mTriggerID).outerHeight();
                var triggerID_Left = $offset.left, triggerID_Top = $offset.top;
                var vL = $location.left, vT = $location.top;
                if (typeof (vL) != 'undefined' || typeof (vT) != 'undefined') {
                    vL = parseInt(vL.replace("px", ""));
                    vT = parseInt(vT.replace("px", ""));
                };
                var ___left = vL >= 0 ? parseInt(vL) + triggerID_Left : parseInt(vL) + triggerID_Left - $getPageSize[2];
                var ___top = vT >= 0 ? parseInt(vT) + triggerID_Top : parseInt(vT) + triggerID_Top - $getPageSize[3];
                $location = { left: ___left + "px", top: ___top + "px" };
            };
            if (isIE6) {
                if (o.mTriggerID == "") {
                    if (TOP >= 0) {
                        $.XYTipsWindow.addStyle(".ui_fixed_" + o.mBoxID + "{width:100%;height:100%;position:absolute;left:expression(documentElement.scrollLeft+documentElement.clientWidth-this.offsetWidth);top:expression(documentElement.scrollTop+" + TOP + ")}");
                        $wrap = $("<div class=\"" + o.mBoxID + "IE6FIXED\" id=\"" + o.mBoxID + "parent\"></div>");
                        $box.appendTo($wrap);
                        $("body").append($wrap);
                        $("." + o.mBoxID + "IE6FIXED").css($location).css({
                            position: "absolute",
                            width: $width + 12 + "px",
                            height: $height + $titleHeight + $borderHeight + $boxDialogHeight + "px",
                            zIndex: "891208"
                        }).addClass("ui_fixed_" + o.mBoxID);
                    } else {
                        $.XYTipsWindow.addStyle(".ui_fixed2_" + o.mBoxID + "{width:100%;height:100%;position:absolute;left:expression(documentElement.scrollLeft+documentElement.clientWidth-this.offsetWidth);top:expression(documentElement.scrollTop+documentElement.clientHeight-this.offsetHeight)}");
                        $wrap = $("<div class=\"" + o.mBoxID + "IE6FIXED\"  id=\"" + o.mBoxID + "parent\"></div>");
                        $box.appendTo($wrap);
                        $("body").append($wrap);
                        $("." + o.mBoxID + "IE6FIXED").css($location).css({
                            position: "absolute",
                            width: $width + 12 + "px",
                            height: $height + $titleHeight + $borderHeight + $boxDialogHeight + "px",
                            zIndex: "891208"
                        }).addClass("ui_fixed2_" + o.mBoxID);
                    };
                    $("body").css("background-attachment", "fixed").css("background-image", "url(n1othing.txt)");
                } else {
                    $wrap.css({
                        position: "absolute",
                        left: ___left + "px",
                        top: ___top + "px",
                        width: $width + 12 + "px",
                        height: $height + $titleHeight + $borderHeight + $boxDialogHeight + "px",
                        zIndex: "891208"
                    });
                };
            } else {
                $wrap.css($location).css({
                    position: "fixed",
                    width: $width + "px",
                    height: $height + $titleHeight + $borderHeight + $boxDialogHeight + "px",
                    zIndex: "891208"
                });
                if (o.mTriggerID != "") { $wrap.css({ position: "absolute" }) };
                $("body").append($wrap);
                $box.appendTo($wrap);
            };
        },
        //装载弹出层内容
        contentBox: function (o) {
            var $box = $("#" + o.mBoxID);
            //是否显示标题栏，决定标题栏的高度
            var $width = parseInt(o.mWidth),
				$height = parseInt(o.mHeight);
            var $contentID = $(".mBoxContent", $box);
            $contentType = o.mContent.substring(0, o.mContent.indexOf(":"));
            $content = o.mContent.substring(o.mContent.indexOf(":") + 1, o.mContent.length);
            $.ajaxSetup({ global: false });
            switch ($contentType) {
                case "text":
                    $contentID.html($content);
                    break;
                case "id":
                    $("#" + $content).children().appendTo($contentID);
                    break;
                case "img":
                    $.ajax({
                        beforeSend: function () {
                            $contentID.html("<p class='boxLoading'>loading...</p>");
                        },
                        error: function () {
                            $contentID.html("<p class='boxError'>加载数据出错...</p>");
                        },
                        success: function (html) {
                            $contentID.html("<img src=" + $content + " alt='' />");
                        }
                    });
                    break;
                case "swf":
                    $.ajax({
                        beforeSend: function () {
                            $contentID.html("<p class='boxLoading'>loading...</p>");
                        },
                        error: function () {
                            $contentID.html("<p class='boxError'>加载数据出错...</p>");
                        },
                        success: function (html) {
                            $contentID.html("<div id='" + o.mBoxID + "swf'><h1>Alternative content</h1><p><a href=\"http://www.adobe.com/go/getflashplayer\"><img src=\"http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif\" alt=\"Get Adobe Flash player\" /></a></p></div><script type=\"text/javascript\" src=\"swfobject.js\" ></script><script type=\"text/javascript\">swfobject.embedSWF('" + $content + "', '" + o.mBoxID + "swf', '" + $width + "', '" + $height + "', '9.0.0', 'expressInstall.swf');</script>");
                            $("#" + o.mBoxID + "swf").css({
                                position: "absolute",
                                left: "0",
                                top: "0",
                                textAlign: "center"
                            });
                        }
                    });
                    break;
                case "url":
                    var contentDate = $content.split("?");
                    $.ajax({
                        beforeSend: function () {
                            $contentID.html("<p class='boxLoading'>loading...</p>");
                        },
                        type: contentDate[0],
                        url: contentDate[1],
                        data: contentDate[2],
                        error: function () {
                            $contentID.html("<p class='boxError'><em></em><span>加载数据出错...</span></p>");
                        },
                        success: function (html) {
                            $contentID.html(html);
                        }
                    });
                    break;
                case "iframe":
                    $contentID.css({ overflowY: "hidden" });
                    $.ajax({
                        beforeSend: function () {
                            $contentID.html("<p class='boxLoading'>loading...</p>");
                        },
                        error: function () {
                            $contentID.html("<p class='boxError'>加载数据出错...</p>");
                        },
                        success: function (html) {
                            //给frame一个随机的id chenpan
                            var frameId = Math.random();

                            //如果用post方法提交
                            if (o.mPostData) {
                                //避免src后的参数过长问题
                                $contentID.html("<iframe id='" + frameId + "' name='"+frameId+"'  width=\"100%\" height=\"" + parseInt(o.mHeight) + "px\" scrolling=\"auto\" frameborder=\"0\" marginheight=\"0\" marginwidth=\"0\"></iframe>");

                                var form = $("<form id='f_" + frameId + "'></form>");
                                // 设置属性  
                                form.attr('action', $content);
                                form.attr('method', 'post');
                                // form的target属性决定form在哪个页面提交  
                                form.attr('target', frameId);
                                // 创建Input  
                                //遍历key
                                for (var key in o.mPostData) {
                                    var input = $("<input type='hidden' name='" + key + "'/>");
                                    input.attr('value', o.mPostData[key]);
                                    form.append(input);
                                }
                                // 提交表单
                                $contentID.append(form);
                                form.submit();
                            }
                            else{
                                $contentID.html("<iframe id='" + frameId + "' name='"+frameId+"' src=\"" + $content + "\" width=\"100%\" height=\"" + parseInt(o.mHeight) + "px\" scrolling=\"auto\" frameborder=\"0\" marginheight=\"0\" marginwidth=\"0\"></iframe>");
                            }
                            var oFrm = $("body").find("iframe[id='" + frameId + "']");
                            //给frame绑定加载完成事件，并把frame传给回调函数
                            $(oFrm).load(function () {
                                //把生成的iframe移除
                                if (o.mLoaded) { o.mLoaded(this) };
                            });
                        }
                    });
            };
        },
        //对话模式
        ask: function (o) {
            var $box = $("#" + o.mBoxID);
            $boxDialog = $(".mBoxDialog", $box);
            if (o.mButton != "") {
                var map = {}, answerStrings = [];
                if (o.mButton instanceof Array) {
                    for (var i = 0; i < o.mButton.length; i++) {
                        map[o.mButton[i]] = o.mButton[i];
                        answerStrings.push(o.mButton[i]);
                    };
                } else {
                    for (var k in o.mButton) {
                        map[o.mButton[k]] = k;
                        answerStrings.push(o.mButton[k]);
                    };
                };
                $boxDialog.html($.map(answerStrings, function (v) {
                    return "<input class='dialogBtn' type='button'  value='" + v + "' />";
                }).join(' '));
                $(".dialogBtn", $boxDialog).hover(function () {
                    $(this).addClass("hover");
                }, function () {
                    $(this).removeClass("hover");
                }).click(function () {
                    var $this = this;
                    if (o.mCallback != "" && $.isFunction(o.mCallback)) {
                        //设置回调函数返回值很简单，就是回调函数名后加括号括住的返回值就可以了。
                        o.mCallback(map[$this.value]);
                    };
                    $.XYTipsWindow.removeBox(o);
                });
            };
        },
        //获取要吸附的ID的left和top值并重新计算弹出层left和top值
        getDomPosition: function (o) {
            var $box = $("#" + o.mBoxID);
            var cw = document.documentElement.clientWidth, ch = document.documentElement.clientHeight;
            var sw = $box.outerWidth(), sh = $box.outerHeight();
            var $soffset = $box.offset(), sl = $soffset.left, st = $soffset.top;
            $getPageSize = new Array();
            $getPageSize.push(cw, ch, sw, sh, sl, st);
        },
        //设置窗口的zIndex
        setBoxzIndex: function (o) {
            $XYTipsWindowarr.push(document.getElementById(o.mBoxID + "parent"));//存储窗口到数组
            var ___event = "mousedown" || "click";
            var $box = $("#" + o.mBoxID + "parent");
            $box.die().live("click", function () {
                for (var i = 0; i < $XYTipsWindowarr.length; i++) {
                    $XYTipsWindowarr[i].style.zIndex = 870618;
                };
                this.style.zIndex = 891208;
            });
        },
        //写入CSS样式
        addStyle: function (s) {
            var T = this.style;
            if (!T) {
                T = this.style = document.createElement('style');
                T.setAttribute('type', 'text/css');
                document.getElementsByTagName('head')[0].appendChild(T);
            };
            T.styleSheet && (T.styleSheet.cssText += s) || T.appendChild(document.createTextNode(s));
        },
        //绑定拖拽
        dragBox: function (o) {
            var $moveX = 0, $moveY = 0,
				drag = false;
            var $ID = $("#" + o.mBoxID);
            $Handle = $("." + o.mDrag, $ID);
            $Handle.mouseover(function () {
                if (o.mTriggerID != "") {
                    $(this).css("cursor", "default");
                } else {
                    $(this).css("cursor", "move");
                };
            });
            $Handle.mousedown(function (e) {
                //如果最大化了，就不允许拖动
                if ($ID.data("data")) {
                    return false;
                }
                drag = o.mTriggerID != "" ? false : true;
                if (o.mDragBoxOpacity) {
                    if (o.mBoxBdOpacity != "1") {
                        $ID.children("div").css("opacity", o.mDragBoxOpacity);
                        $ID.children("div.mBoxBd").css("opacity", o.mBoxBdOpacity);
                    } else {
                        $ID.children("div").css("opacity", o.mDragBoxOpacity);
                    };
                };
                e = window.event ? window.event : e;
                var ___ID = document.getElementById(o.mBoxID);
                $moveX = e.clientX - ___ID.offsetLeft;
                $moveY = e.clientY - ___ID.offsetTop;
                $(document).mousemove(function (e) {
                    if (drag) {
                        e = window.event ? window.event : e;
                        window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
                        var ___x = e.clientX - $moveX;
                        var ___y = e.clientY - $moveY;
                        $(___ID).css({
                            left: ___x,
                            top: ___y
                        });
                    };
                });
                $(document).mouseup(function () {
                    drag = false;
                    if (o.mDragBoxOpacity) {
                        if (o.mBoxBdOpacity != "1") {
                            $ID.children("div").css("opacity", "1");
                            $ID.children("div.mBoxBd").css("opacity", o.mBoxBdOpacity);
                        } else {
                            $ID.children("div").css("opacity", "1");
                        };
                    };
                });
            });
        },
        //关闭弹出层
        removeBox: function () {
            //处理
            $.XYTipsWindow.handlePanrentTile(false);
            var $box = $("#" + BOXID.mBoxID);
            var $boxbg = $("#XYTipsWindowBg");
            if ($box != null || $boxbg != null) {
                var $contentID = $(".mBoxContent", $box);
                $contentType = BOXID.mContent.substring(0, BOXID.mContent.indexOf(":"));
                $content = BOXID.mContent.substring(BOXID.mContent.indexOf(":") + 1, BOXID.mContent.length);
                if ($contentType == "id") {
                    $contentID.children().appendTo($("#" + $content));
                    $box.parent().removeAttr("style").remove();
                    $boxbg.animate({ opacity: "0" }, 500, function () { $(this).remove(); });
                    $("body").css("background", "#fff");
                } else {
                    $box.parent().removeAttr("style").remove();
                    $boxbg.animate({ opacity: "0" }, 500, function () { $(this).remove(); });
                    $("body").css("background", "#fff");
                };
            };
        },
        //最大换弹出层
        maxBox: function () {
            //第二层
            var $xyTipWindow = $("#" + BOXID.mBoxID);
            //第一层
            var $box = $xyTipWindow.parent();
            //第三层
            var $boxWrap = $(".mBoxWrap", $xyTipWindow);
            //第三层 的 mBoxBd
            var $boxBd = $(".mBoxBd", $xyTipWindow);
            //第四层的 boxTitle 
            var $boxTitle = $(".boxTitle", $boxWrap);
            //第四层的 boxContent
            var $boxContent = $(".mBoxContent", $boxWrap);
            //第六层，内部的iframe
            var $iframe = $("iframe", $boxContent);
            //记录六个高度
            var nowSize = [
                [$box.width(), $box.height(), $box.css("marginLeft"), $box.css("marginTop"), $box.offset()],
                [$xyTipWindow.width(), $xyTipWindow.height()],
                [$boxWrap.width(), $boxWrap.height()],
                [$boxBd.width(), $boxBd.height()],
                [$boxTitle.width()],
                [$boxContent.width(), $boxContent.height()],
                [$iframe.width(), $iframe.height()]
            ];
            //保存到data
            $xyTipWindow.data("data", nowSize);
            //隐藏最大化按钮
            $(".mMaxBox", $boxTitle).hide();
            //显示最小化按钮
            $(".mMinBox", $boxTitle).show();
            //调节box的高度以及位置
            $box.css(
                {
                    top: "0px",
                    left: "0px",
                    marginLeft: "0px",
                    marginTop: "0px",
                    height: $(window).height() + "px",
                    width: $(window).width() + "px"
                });
            //调节xyTipsWindow的高度以及位置
            $xyTipWindow.css(
                {
                    top: "0px",
                    left: "0px",
                    height: $(window).height() + "px",
                    width: $(window).width() + "px"
                });
            //调节$boxWrap
            $boxWrap.css(
                {
                    height: $(window).height() + "px",
                    width: $(window).width() + "px"
                });
            //调节boxContext $boxContent
            $boxBd.css(
                {
                    height: ($(window).height() - $boxTitle.height()) + "px",
                    width: $(window).width() + "px"
                });
            //调节$boxTitle
            $boxTitle.css(
                {
                    width: $(window).width() + "px"
                });
            //调节boxContext $boxContent
            $boxContent.css(
                {
                    height: ($(window).height() - $boxTitle.height()) + "px",
                    width: $(window).width() + "px"
                });
            //调节boxContext $boxContent
            $iframe.css(
                {
                    height: ($(window).height() - $boxTitle.height()) + "px",
                    width: $(window).width()
                });
            //调用计算高度的函数
            $($iframe[0].contentWindow).resize()
        },
        //还原弹出层
        minBox: function () {
            //第二层
            var $xyTipWindow = $("#" + BOXID.mBoxID);
            //第一层
            var $box = $xyTipWindow.parent();
            //第三层
            var $boxWrap = $(".mBoxWrap", $xyTipWindow);
            //第三层 的 mBoxBd
            var $boxBd = $(".mBoxBd", $xyTipWindow);
            //第四层的 boxTitle 
            var $boxTitle = $(".boxTitle", $boxWrap);
            //第四层的 boxContent
            var $boxContent = $(".mBoxContent", $boxWrap);
            //第六层，内部的iframe
            var $iframe = $("iframe", $boxContent);
            //隐藏最大化按钮
            $(".mMaxBox", $boxTitle).show();
            //显示最小化按钮
            $(".mMinBox", $boxTitle).hide();
            //上一个记录
            var lastSize = $xyTipWindow.data("data");
            //清空数据
            $xyTipWindow.data("data", "");
            //调节box的高度以及位置
            $box.css(
                {
                    width: lastSize[0][0] + "px",
                    height: lastSize[0][1] + "px",
                    marginLeft: lastSize[0][2] + "px",
                    marginTop: lastSize[0][3] + "px",
                    top: lastSize[0][4].top + "px",
                    left: lastSize[0][4].left + "px"
                });
            //调节xyTipsWindow的高度以及位置
            $xyTipWindow.css(
                {
                    width: lastSize[1][0] + "px",
                    height: lastSize[1][1] + "px",
                });
            //调节$boxWrap
            $boxWrap.css(
                {
                    width: lastSize[2][0] + "px",
                    height: lastSize[2][1] + "px",
                });
            //调节boxContext $boxContent
            $boxBd.css(
                {
                    width: lastSize[3][0] + "px",
                    height: lastSize[3][1] + "px",
                });
            //调节$boxTitle
            $boxTitle.css(
                {
                    width: lastSize[4][0] + "px"
                });
            //调节boxContext $boxContent
            $boxContent.css(
                {
                    width: lastSize[5][0] + "px",
                    height: lastSize[5][1] + "px",
                });
            //调节boxContext $boxContent
            $iframe.css(
                {
                    width: lastSize[6][0] + "px",
                    height: lastSize[6][1] + "px",
                });
            //调用计算高度的函数
            $($iframe[0].contentWindow).resize()
        },
        //健盘事件，当按Esc的时候关闭弹出层
        keyDown: function (o) {
            document.onkeydown = function (e) {
                e = e || event;
                if (e.keyCode == 27) {
                    $.XYTipsWindow.removeBox();
                };
            };
        }
    });
})(jQuery);