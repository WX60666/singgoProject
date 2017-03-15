/// <reference path="/fw/js/yi/jquery.yi.ajax.js" />
var Login = function () {
    var cookieName = 'userName',
        userNameId = '#txtUserName',
        passwordId = '#txtPassword',
        rememberId = '#ckRemember',
        referUrl='';
    var handleLogin = function () {
        var form = $('.login-form'),
            group = '.form-group',
            icon = '.input-icon',
            error = 'has-error';
        form.validate({
            errorElement: 'span', //默认input错误信息提示标签
            errorClass: 'help-block', // 默认input错误信息样式
            focusInvalid: true,
            rules: {
                username: {
                    required: true
                },
                password: {
                    required: true,
                    rangelength: [6, 16]
                },
                remember: {
                    required: false
                }
            },
            messages: {
                username: {
                    required: '用户名不能为空！'
                },
                password: {
                    required: '密码不能为空！',
                    rangelength: '密码长度必须为 6-16 位！'
                }
            },
            invalidHandler: function (event, validator) { //display error alert on form submit   
                yiCommon.showError('请输入您的用户名和密码！');
            },
            highlight: function (element) { // input错误颜色
                $(element).closest(group).addClass(error); // 设置错误样式给控制组
            },
            success: function (label) {
                label.closest(group).removeClass(error);
                label.remove();
            },
            errorPlacement: function (error, element) {
                error.insertAfter(element.closest(icon));
            },
            submitHandler: function () {
                submit(); // 表单验证成功进行下一步动作
            }
        });
        $('input', form).keypress(function (e) {
            if (e.which === 13) {
                if (form.validate().form()) {
                    submit(); // 按Enter键时表单验证成功进行下一步动作
                }
                return false;
            }
        });
        function submit() {

            //显示进度条
            var $content = $('.content');

            //提示进度信息
            yiCommon.showError('正在登录中，请稍等 . . .', 'success');

            var userName = $.trim($(userNameId).val());
            var password = $.trim($(passwordId).val());

            //记住用户名
            remember(userName);

            //提交登录
            yiAjax.p('/auth/credentials', { userName: userName, password: password },

                function () {

                    //提示成功信息
                    yiCommon.showError('登录成功，正在跳转至首页 . . .', 'success');

                    //跳转至首页
                    if(referUrl)
                    {
                        window.location.href = referUrl;
                    }
                    else
                    {
                        window.location.href = '/views/index.html';
                    }
                },

                function (m) {

                    //提示错误信息
                    yiCommon.showError(yiCommon.extract(m));

                }, false, $content
            );
        }
        function remember(userName) {
            if ($(rememberId).is(':checked')) {
                $.cookie(cookieName, userName, { expires: 365 });
            } else {
                $.removeCookie(cookieName);
            }
        }
    };
    var handleUserName = function () {
        var userName = $.cookie(cookieName);
        if (userName) {
            $(userNameId).val(userName);
            $(rememberId).prop('checked', true).parent().addClass('checked');
        }
    };
    return {
        init: function () {
            handleUserName();
            handleLogin();
            referUrl=document.referrer;
            if(referUrl==='')
            {
                referUrl=$.query.get('redirect');
            }
        }
    };
}();
$(document).ready(function () {
    Metronic.init();
    Login.init();
});