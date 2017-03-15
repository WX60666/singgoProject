var Forget = function () {
    var handleForget = function () {
        var form = $('.forget-form'),
            group = '.form-group',
            icon = '.input-icon',
            error = 'has-error',
            success = 'alert-success',
            danger = 'alert-danger';
        form.validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: true, // do not focus the last invalid input
            rules: {
                email: {
                    required: true,
                    email: true
                }
            },
            messages: {
                email: {
                    required: '电子邮箱不能为空'
                }
            },
            invalidHandler: function (event, validator) { //display error alert on form submit   
                showError('请输入您的电子邮箱。');
            },
            highlight: function (element) { // hightlight error inputs
                $(element).closest(group).addClass(error); // set error class to the control group
            },
            success: function (label) {
                label.closest(group).removeClass(error);
                label.remove();
            },
            errorPlacement: function (error, element) {
                error.insertAfter(element.closest(icon));
            },
            submitHandler: function (form) {
                //submit(); // form validation success, call ajax form submit
            }
        });
        $('#back-btn').click(function () {
            window.location = '/views/account/login.html';
        });
        $('input', form).keypress(function (e) {
            if (e.which === 13) {
                if (form.validate().form()) {
                    //submit(); // form validation success, call ajax form submit
                }
                return false;
            }
        });
        function submit() {
            var email = $.trim($('#txtEmail').val());
            yiAjax.p('/sendemail', { email: email },
                function (r) {
                    showError('邮件已发送，请点击邮件中的链接重置密码', 'success');
                },
                function (m) {
                    if (m && m.ResponseStatus) {
                        showError('电子邮箱不存在！');
                    } else {
                        showError('系统错误，请联系管理员！');
                    }
                }, false
            );
        }
        function showError(msg, statusCode) {
            var alert = $('.alert');
            if (statusCode) {
                alert.removeClass(danger).addClass(success);
            } else {
                alert.removeClass(success).addClass(danger);
            }
            $('span', alert).text(msg);
            if (!alert.is(':visible')) {
                alert.show();
            }
        }
    };
    return {
        init: function () {
            handleForget();
        }
    };
}();
$(document).ready(function () {
    Metronic.init();
    Forget.init();
});