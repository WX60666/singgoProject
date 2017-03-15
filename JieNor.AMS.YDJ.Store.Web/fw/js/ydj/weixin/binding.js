var Bn = function() {
	var Binding = function() {
		this.oBtn = null;
		this.oConf = null;
	}
	Binding.prototype = {
		constructor: Binding,
		init: function(arg1, arg2) {
			this.oBtn = document.getElementsByClassName(arg1)[0];
			this.oConf = document.getElementById(arg2);
			var This = this;
			this.oBtn.addEventListener('touchend', function() {
				This.checkOutNum();
			}, false);
			this.oConf.addEventListener('touchend', function() {
				This.checkOutQrCode();
			}, false);

		},
		getVcode: function() {
			this.oBtn.disabled = true;
			this.update_p(0, 60);
		},
		update_p: function(num, t) {
			var This = this;
			this.oBtn.disabled = true;
			if(num == t) {
				this.oBtn.value = "获取验证码";
				this.oBtn.disabled = false;
			} else {
				printnr = t - num;
				num++;
				this.oBtn.value = " (" + printnr + ")秒后重新发送";
				setTimeout(function() {
					This.update_p(num, t);
				}, 1000);
			}
		},
		checkOutNum: function() {
			if(this.oBtn.disabled) {
				return false;
			}
			var phone = document.getElementById('phone').value;
			var alert = document.getElementsByClassName('alert')[0];
			if(!(/^1[34578]\d{9}$/.test(phone))) {
				alert.innerHTML = "请输入正确的手机号";
				alert.style.display = 'block';
				return false;
			} else {
				alert.style.display = 'none';
				this.getVcode(60);
			}
		},
		checkOutQrCode: function() {
			var qrCode = document.getElementById('qr-code').value;
			if(qrCode == '') {
				var alert = document.getElementsByClassName('alert')[0];
				alert.innerHTML = "请输入正确的验证码";
				alert.style.display = 'block';
				return false;
			} else {
				//清空手机号,验证码
				document.getElementById('qr-code').value = "";
				document.getElementById('phone').value = "";
				window.location.href = 'msgpage.html';
			}





		}

	};

	return {
		init: function() {
			var b = new Binding();
			b.init('get_v_code', 'conf');
		}
	}
}();

window.onload = function() {
	Bn.init();
}