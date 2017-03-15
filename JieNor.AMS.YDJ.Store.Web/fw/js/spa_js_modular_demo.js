/*
    1.为了前端代码的安全性 和 规范化，各个页面的 js 代码采用模块化的方式，以免各自写的 js 代码影响其他开发人员的开发的功能。
    2.保持整体代码结构清晰整洁，删除不需要的代码 和 多余的空行，关键代码要有必要的注释。
    3.页面中禁止出现 js 代码（除非特殊情况），与页面相关的 js 统一放在与之对于的 js 文件中，以便后续维护。
    4.<script src="/fw/js/account/register.js"></script> 对于页面上面的这种 js 文件引用，统一放在页面 body 之后（jquery.yi.min.js 除外）。
*/

/*********************************************** 第一种写法 ***************************************************/
var Register = {
    //各种变量 和 常量
    cons: {
        UserNameId: '#txtUserName'
    },
    //初始化注册页面的所有功能
    init: function () {
        this.submit();
    },
    //提交注册
    submit: function () {

    },
    //刷新验证码
    refreshCode: function () {

    },
    //检查用户名
    checkUserName: function () {

    }
    //后续各种功能方法的实现......
};
//页面加载后，初始化与之相关的所有功能
$(document).ready(function () {
    Register.init();
});



/*********************************************** 第二种写法 ***************************************************/
;(function () {
    //
    var Register = (function () {
        //各种变量 和 常量
        var cons = {
            UserNameId: '#txtUserName'
        };
        //返回此对象
        return function () {
            //当前对象的引用，此写法可以避免 this 混淆
            var that = this;
            //初始化注册页面的所有功能
            that.init = function () {
                that.submit();
            };
            //提交注册
            that.submit = function () {

            };
            //刷新验证码
            that.refreshCode = function () {
                
            };
            //检查用户名
            that.checkUserName = function () {
                var userName = $.trim($(cons.UserNameId));
                if (!userName) {
                    //用户名不能为空
                }
            };
            //后续各种功能方法的实现......
        };
    })();
    //注册到 window 对象上面
    window.Register = Register;
})();
//页面加载后，初始化与之相关的所有功能
$(document).ready(function () {
    new Register().init();
});