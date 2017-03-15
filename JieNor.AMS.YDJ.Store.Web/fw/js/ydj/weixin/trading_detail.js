		var Fd = function() {
			var Trading_detail = function() {
				this.oCall = null;
				this.oCancel = null;
			}

			Trading_detail.prototype = {
				constructor: Trading_detail,
				init: function() {
					this.oCall = document.getElementsByClassName('call_icon')[0];
					this.oCancel = document.getElementById('call_cancel');
					var This = this;
					this.oCall.addEventListener('touchend', function() {
						This.callUp(true);
					}, false);
					this.oCancel.addEventListener('touchend', function() {
						This.callUp(false);
					}, false);
				},
				callUp: function(iscall) {
					var conf = document.getElementById('dialog1'),
						conf_num = document.getElementById('confirm_num');
					if(iscall) {
						conf_num.innerText = 18522569874;
						conf.style.display = 'block';
					} else {
						conf_num.innerText = ""
						conf.style.display = 'none';
					}
				}

			}

			return {
				init: function() {
					var t = new Trading_detail();
					t.init();
				}
			}

		}();

		window.onload = function() {
			Fd.init();
		}