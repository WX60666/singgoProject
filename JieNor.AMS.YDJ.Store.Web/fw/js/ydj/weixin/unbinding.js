var Un = function() {
	var Unbinding = function() {
		this.oBtn = null;
		this.oConf = null;
	};
	Unbinding.prototype = {
		constructor: Unbinding,
		init: function() {
			this.oBtn = document.getElementsByClassName('get_v_code')[0];
			this.oConf = document.getElementById('conf');
			var This = this;
			this.oBtn.addEventListener('touchend', function() {
				This.getVcode(60);
			}, false);
			this.oConf.addEventListener('touchend', function() {
				This.checkOutQrCode();
			}, false);

		},
		getVcode: function(t) {
			//禁止点击
			if(this.oBtn.disabled) {
				return false;
			}
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
		checkOutQrCode: function() {
			var qrCode = document.getElementById('qr-code').value;
			if(qrCode == '') {
				var alert = document.getElementsByClassName('alert')[0];
				alert.innerHTML = "请输入正确的验证码";
				alert.style.display = 'block';
				return false;
			} else {
				//清空验证码
				document.getElementById('qr-code').value = "";
				window.location.href = 'msgpage.html';
			}
		}

	};
	return {
		init: function() {
			var u = new Unbinding();
			u.init();
		}
	}

}();

window.onload = function() {
	Un.init();
}