var ModifyPwd = {

    //常量
    oldPasswordId: '#oldpwd',
    dialogSelector: '',

    //初始化
    init: function (index) {

        var that = this;
        that.dialogSelector = '#' + Index_UserBar.consts.pwdDialogId;

        //回车响应提交
        $('input', '#' + Index_UserBar.consts.pwdDialogId).keypress(function (e) {
            if (e.which === 13) {
                that.submit(index);
                return false;
            }
        });

        //表单离开焦点的时候
        ModifyPwd.blurs();
    },

    checkOpwd: function ($pwd) {  /*旧密码验证*/
        var $fg = $pwd.closest('.form-group'),
            $hb = $fg.find('.help-block');
        if (!$.trim($pwd.val())) {
            $hb.show().html("请输入旧密码！");
            $fg.addClass('has-error');
            return false;
        }
        $fg.removeClass('has-error');
        $hb.hide();
        return true;
    },

    checkPwd: function ($pwd) {  /*新密码验证*/
        var $fg = $pwd.closest('.form-group'),
            $hb = $fg.find('.help-block'),
            reg = /^\S{6,16}$/;
        if (!reg.test($.trim($pwd.val()))) {
            $fg.addClass('has-error');
            $hb.show().html("新密码长度必须为 6-16 位！");
            return false;
        }
        $fg.removeClass('has-error');
        $hb.hide();
        return true;
    },

    checkRepwd: function ($repwd) {  /*新密码确认验证*/
        var $fg = $repwd.closest('.form-group'),
            $hb = $fg.find('.help-block'),
            newpwd = $.trim($("#newpwd").val()),
            repwd = $.trim($repwd.val());
        if (!repwd) {
            $fg.addClass('has-error');
            $hb.show().html("请输入新确认密码！");
            return false;
        }
        if (repwd !== newpwd) {
            $fg.addClass('has-error');
            $hb.show().html("两次输入密码不一致，请重新输入！");
            return false;
        }
        $fg.removeClass('has-error');
        $hb.hide();
        return true;
    },

    blurs: function () {  /*鼠标离开时判断是否满足验证要求*/
        $("#oldpwd").on("blur", function () {  //旧密码
            ModifyPwd.checkOpwd($(this));
        });
        $("#newpwd").on("blur", function () {  //新密码
            ModifyPwd.checkPwd($(this));
        });
        $("#newrepwd").on("blur", function () {  //新密码确认
            ModifyPwd.checkRepwd($(this));
        });
    },

    //提交
    submit: function (index) {

        var that = this,
        $oldpwd = $("#oldpwd"),
        $newpwd = $("#newpwd"),
        $newrepwd = $("#newrepwd"),
        valids = [];

        //先全部验证一遍
        valids.push(ModifyPwd.checkOpwd($oldpwd));
        valids.push(ModifyPwd.checkPwd($newpwd));
        valids.push(ModifyPwd.checkRepwd($newrepwd));

        //如果其中有一项验证不通过，则终止后续操作
        for (var i = 0; i < valids.length; i++) {
            if (!valids[i]) {
                return;
            }
        }

        //参数
        var params = {
            simpleData: {
                oldpwd: $.trim($oldpwd.val()),
                newpwd: $.trim($newpwd.val()),
                newrepwd: $.trim($newrepwd.val())
            }
        };

        yiAjax.p('/dynamic/sys_mainfw?operationno=modifypwd', params,
			function () {

			    yiCommon.showError('修改成功！', 'success', that.dialogSelector);

			    //关闭对话框
			    layer.close(index);
			},
			function (m) {

			    //提示错误信息
			    yiCommon.showError(yiCommon.extract(m), '', that.dialogSelector);

			}, true, $(that.dialogSelector).parent()
		);
    }
};