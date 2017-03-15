/// <reference path="/fw/js/yi/jquery.yi.ajax.js" />
var Index_UserBar = {

    //常量
    consts: {
        //存放登录后的用户名
        userName: '',
        passwordId: '#txtPasswordBox',
        loginDialogId: 'login-dialog',
        pwdDialogId: 'modifypwd-dialog',
        loginUrl: '/views/account/login.html'
    },

    //初始化
    init: function () {
        this.getSysInfo();
        this.bindOperate();
    },

    //绑定操作
    bindOperate: function () {

        var that = this;

        //修改密码
        $('#aModifyPwd').click(function () {
            that.showPwdDialog();
        });

        //注销
        $('#aLogout').click(function () {
            that.logout();
        });
    },

    //获取系统信息
    getSysInfo: function () {
        yiAjax.p('/dynamic/sys_mainfw?operationno=getsysinfo', {},
            function (r) {
                Index_UserBar.showSysInfo(r);
            }
        );
    },

    //显示系统信息
    showSysInfo: function (r) {
        if (r && r.operationResult && r.operationResult.srvData) {

            //用户名
            this.consts.userName = $.trim(r.operationResult.srvData.userName);
            var displayName = $.trim(r.operationResult.srvData.displayName);
            $('#spanUserName').text(displayName ? displayName : this.consts.userName);

            //用户头像
            if (r.operationResult.srvData.userIcon) {
                $('#imgUserIcon').attr('src', r.operationResult.srvData.userIcon).error(function () {
                    //如果用户头像地址错误，则显示一个默认头像
                    $(this).attr('src', '/fw/images/user_default_icon.jpg');
                });
            }
        }
    },

    //显示修改密码对话框
    showPwdDialog: function () {

        var that = this;

        yiAjax.gf('/views/account/modifypwd.html', {}, function (html) {
            yiDialog.d({
                id: that.consts.pwdDialogId,
                type: 1,
                resize: false,
                content: html,
                title: '修改密码',
                area: '320px',
                btn: ['修改', '取消'],
                yes: function (index, layero) {
                    ModifyPwd.submit(index);
                    return false;
                },
                success: function (layero, index) {
                    ModifyPwd.init(index);
                }
            });
        });
    },

    //注销
    logout: function () {
        yiAjax.p('/auth/logout', {},
            function () {
                $('html').html('<script>window.location.href="{0}";</script>'.format(Index_UserBar.consts.loginUrl));
            }, null, false, $('body')
        );
    },

    //显示登录对话框
    showLoginDialog: function (callback) {

        var that = this;

        //如果用户名不存在，则说明该用户压根就没有登录过，那么直接跳转至登录页面（因为对话框登录需要该用户名）
        if (!that.consts.userName) {
            window.location.href = that.consts.loginUrl;
            return;
        }

        /*
            如果已经打开了登录对话框，则不需要再重复打开，
            只有登录对话框需要做这个判断，因为用户登录后的所有请求，都需要验证是否登录，
            有可能存在并发的 ajax 请求，从而导致显示多个登录对话框的情况
            所以在显示登录对话框的时候，需要判断当前是否已经有登录对话框
        */
        if ($('#' + that.consts.loginDialogId).length > 0) {
            return;
        }

        //登录对话框
        yiAjax.gf('/views/account/login_dialog.html', {}, function (html) {
            yiDialog.d({
                id: that.consts.loginDialogId,
                type: 1,
                closeBtn: 0, //不显示关闭按钮
                resize: false,
                content: html,
                title: '会话已过期，请重新登录',
                area: '320px',
                btn: ['登录', '注销'],
                yes: function (index, layero) {
                    Login_Dialog.login(index, callback);
                    return false;
                },
                btn2: function (index, layero) {
                    Login_Dialog.logout();
                    that.logout();
                    return false;
                },
                success: function (layero, index) {
                    Login_Dialog.init(index);
                }
            });
        });
    }
};
$(document).ready(function () {
    Index_UserBar.init();
});