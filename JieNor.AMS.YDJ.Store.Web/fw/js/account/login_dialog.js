var Login_Dialog = {

    //常量
    passwordId: '#txtPasswordBox',
    dialogSelector: '',

    //初始化
    init: function (index) {

        var that = this;

        that.dialogSelector = '#' + Index_UserBar.consts.loginDialogId;

        //回车响应登录
        $(that.passwordId).keypress(function (e) {
            if (e.which === 13) {
                that.login(index);
                return false;
            }
        });

        //将光标移到密码框中
        setTimeout(function () {
            $(that.passwordId).focus();
        }, 500)
    },

    //注销
    logout: function () {

        yiCommon.showError('正在注销中，请稍等 . . .', 'success', this.dialogSelector);
    },

    //登录
    login: function (index, callback) {

        var that = this;

        var txtPassword = $(that.passwordId);
        var password = $.trim(txtPassword.val());
        if (!password) {
            yiCommon.showError('请输入您的密码！', '', that.dialogSelector);
            txtPassword.focus();
            return;
        }

        //提示进度信息
        yiCommon.showError('正在登录中，请稍等 . . .', 'success', that.dialogSelector);

        //提交登录
        yiAjax.p('/auth/credentials', { userName: Index_UserBar.consts.userName, password: password },

            function () {

                //提示成功信息
                yiCommon.showError('登录成功，正在执行后续操作 . . .', 'success', that.dialogSelector);

                //关闭对话框
                layer.close(index);

                //执行回调函数
                $.isFunction() && callback();
            },

            function (m) {

                //提示错误信息
                yiCommon.showError(yiCommon.extract(m), '', that.dialogSelector);

            }, false, $(that.dialogSelector).parent()
        );
    }
};