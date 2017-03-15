/// <reference path="../../../typings/jquery/jquery.d.ts" />

var checks = {
    checkEmail: function ($email) {  /*电子邮箱验证*/
        var $emError = $("#emError");
        var $display = $(".display-hide");
        if ($email.val() == "") {
            //$email.focus();
            $email.addClass("input_error");
            $email.siblings('i').addClass("i_error");
            $emError.show().removeClass().html("该项为必填项！").addClass("alerts");
            return false;
        } else {
            var reg = /^.{1,}@\w{1,}(\.[a-z]{2,3}){1,2}$/;
            if (reg.test($email.val()) == false) {
                $email.addClass("input_error");
                $email.siblings('i').addClass("i_error");
                $emError.show().removeClass().html("请输入正确的电子邮箱格式！").addClass("alerts");
                return false;
            } else {
                $email.removeClass("input_error");
                $email.siblings('i').removeClass("i_error");
                $("#email-number").html($email.val());//动态获取用户输入的电子邮箱
                $emError.hide();
                return true;
            }
        }
    },

    checkRecode: function ($code) {  /*验证码验证*/
        var recError = $("#recError");
        if ($code.val() == "") {
            $code.addClass("input_error");
            $code.siblings('i').addClass("i_error");
            recError.show().removeClass().html("该项为必填项！").addClass("alerts");
            return false;
        } else {
            if ($code.val() != $("#code").html()) {
                $code.addClass("input_error");
                $code.siblings('i').addClass("i_error");
                recError.show().removeClass().html("验证码不正确！").addClass("alerts");
                return false;
            } else {
                $code.removeClass("input_error");
                $code.siblings('i').removeClass("i_error");
                recError.hide();
                return true;
            }
        }
    },

    checkName: function ($userName) {  /*用户名验证*/
        var $unError = $("#unError");
        if ($userName.val() == "") {
            $userName.addClass("input_error");
            $userName.siblings('i').addClass("i_error");
            $unError.show().removeClass().html("该项为必填项！").addClass("alerts");
            return false;
        } else {
            $userName.removeClass("input_error");
            $userName.siblings('i').removeClass("i_error");
            $unError.hide();
            return true;

        }
    },

    checkPhone: function ($phone) {  /*电话号码验证*/
        var $telError = $("#telError");
        if ($phone.val() == "") {
            $phone.addClass("input_error");
            $phone.siblings('i').addClass("i_error");
            $telError.show().removeClass().html("该项为必填项！").addClass("alerts");
            return false;
        } else {
            var reg = /^[1][0-9]{10}$/;
            if (reg.test($phone.val()) == false) {
                $phone.addClass("input_error");
                $phone.siblings('i').addClass("i_error");
                $telError.show().removeClass().html("电话号码以1开头，且长度为11位").addClass("alerts");
                return false;
            } else {
                $phone.removeClass("input_error");
                $phone.siblings('i').removeClass("i_error");
                $telError.hide();
                return true;
            }
        }
    },

    checkPwd: function ($pwd) {  /*密码验证*/
        var $pwError = $("#pwError");
        if ($pwd.val() == "") {
            $pwd.addClass("input_error");
            $pwd.siblings('i').addClass("i_error");
            $pwError.show().removeClass().html("该项为必填项！").addClass("alerts");
            return false;
        } else {
            var reg = /^\S{6,16}$/;
            if (reg.test($pwd.val()) == false) {
                $pwd.addClass("input_error");
                $pwd.siblings('i').addClass("i_error");
                $pwError.show().removeClass().html("登录密码长度为6-16").addClass("alerts");
                return false;
            } else {
                $pwd.removeClass("input_error");
                $pwd.siblings('i').removeClass("i_error");
                $pwError.hide();
                return true;
            }
        }
    },
    checkRepwd: function ($repwd) {  /*确认密码验证*/
        var repwError = $("#repwError");
        if ($repwd.val() == "") {
            $repwd.addClass("input_error");
            $repwd.siblings('i').addClass("i_error");
            repwError.show().removeClass().html("该项为必填项！").addClass("alerts");
            return false;
        } else {
            if ($repwd.val() != $("#txtPassword").val()) {
                $repwd.addClass("input_error");
                $repwd.siblings('i').addClass("i_error");
                repwError.show().removeClass().html("两次输入密码不一致，请重新输入！").addClass("alerts");
                return false;
            } else {
                $repwd.removeClass("input_error");
                $repwd.siblings('i').removeClass("i_error");
                repwError.hide();
                return true;
            }
        }
    },

    check1: function () {  /*鼠标离开时判断是否满足验证要求*/
        $(document).on("blur", "#txtEm1", function () { //电子邮件
            checks.checkEmail($(this));
        });
        $(document).on("blur", "#txtCode", function () { //验证码
            checks.checkRecode($(this));
        });
        $(document).on("blur", "#txtUserName", function () {  //用户名
            checks.checkName($(this));
        });
        $(document).on("blur", "#txtPhone", function () {  //电话号码
            checks.checkPhone($(this));
        });
        $(document).on("blur", "#txtPassword", function () {  //密码
            checks.checkPwd($(this));
        });
        $(document).on("blur", "#txtRePassword", function () {  //确认密码
            checks.checkRepwd($(this));
        });
    },

    check2: function () {   /*登录,注册提交*/
        var b = true;
        var $email = $("#txtEm1");
        var $code = $("#txtCode");
        var $userName = $("#txtUserName");
        var $phone = $("#txtPhone");
        var $passWord = $("#txtPassword");
        var $rePassword = $("#txtRePassword");
        //跳转到进入邮箱
        $(document).on("click", ".to-email", function () {
            $email.each(function () {
                if (checks.checkEmail($(this)) == false) { b = false; } else {
                    b = true;
                }
            });
            $passWord.each(function () {
                if (checks.checkPwd($(this)) == false) { b = false; } else {
                    b = true;
                }
            });
            $rePassword.each(function () {
                if (checks.checkRepwd($(this)) == false) { b = false; } else {
                    b = true;
                }
            });
            $code.each(function () {
                if (checks.checkRecode($(this)) == false) { b = false; } else {
                    b = true;
                }
            });
            if (b == true) {
                yiAjax.p('/reguser', getUserInfo(),
                function (r) {
                    yiCommon.showError('填写完成，正在发送邮件 . . .', 'success');
                    $(".register-email").show().siblings("form").hide();
                },
                function (m) {

                    //提示错误信息
                    yiCommon.showError(yiCommon.extract(m));

                }, false
            );
            } else {
                $(".alert").html("请填写以下信息").show();
            }
            function getUserInfo() {
                return {
                    email: $.trim($email.val()),
                    userName: $.trim($email.val()),
                    passWord: $.trim($passWord.val()),
                    rePassword: $.trim($rePassword.val())
                }
            }
        });
        //跳转到填写用户信息
        // var nowUrl=window.location.href;//获得当前路径
        // var index=nowUrl.indexOf("?");//获取?后面的参数
        // var str=nowUrl.substr(index+1,10); //截取指定字符串
        // var fanal='activecode';
        var activeCode = $.query.get("activecode");
        var redirectto = $.query.get("redirect");

        if (activeCode) {   //判断截取的字符串是否等于activecode，即判断URL中是否含有activecode的字符串。若有则进行页面跳转
            $(".register-message").show().siblings("form").hide(); //跳转到填写用户信息
            $(".steps ul li").eq(1).addClass("li-active");
            $(".steps ul li i").eq(1).addClass("i-active");
        }
        //跳转到用户名登录
        $(document).on("click", ".to-login", function () {
            $userName.each(function () {
                if (checks.checkName($(this)) == false) { b = false; } else {

                    b = true;

                }
            });
            $phone.each(function () {
                if (checks.checkPhone($(this)) == false) { b = false; } else {

                    b = true;

                }
            });
            if (b == true) {
                yiAjax.p('/authuser/update'.format(activeCode), getUserInfo(),
                function (r) {

                    yiCommon.showError('注册成功，正在跳转至登录界面 . . .', 'success');
                    if (redirectto) {
                        window.location.href = redirectto;
                    }
                    else {
                        window.location.href = "login.html";
                    }

                },
                function (m) {

                    //提示错误信息
                    yiCommon.showError(yiCommon.extract(m));

                }, false
            );
            }
            function getUserInfo() {
                return {
                    displayName: $.trim($userName.val()),
                    mobilePhone: $.trim($phone.val()),
                    activeCode: activeCode

                }
            }
        });

    },

    check3: function () {
        /*验证码的动态获取*/
        $(document).on("click", ".change", function () { //随机产生数字
            var letter = new Array("1234", "5876", "5475", "5788", "7757", "5246", "4788", "2555", "7526", "1672", "2868", "2587", "8786", "6758", "4572", "4783", "4785", "5757", "5242", "9682", "0235", "7774", "6835", "5535", "8635", "4263");
            var index = Math.floor(Math.random() * 26);
            $("#code").html(letter[index]);
        });
    },
    init: function () {
        this.check1();
        this.check2();
        this.check3();
    }
}

checks.init();
