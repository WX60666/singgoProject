var Fb = function() {
	var Feedback = function() {
		this.oTextarea = null;
		this.oBtn = null;
	}

	Feedback.prototype = {
		constructor: Feedback,
		init: function() {
			var This = this;
			this.oTextarea = document.getElementsByClassName('proposal')[0];
			this.oBtn = document.getElementsByClassName('feed_submit')[0];

			this.oTextarea.addEventListener('keyup', function() {
				This.verify(this);
			}, false);
			this.oBtn.addEventListener('touchend', function() {
				This.submitProposal(this);
			}, false);
		},
		verify: function(arg) {
			var proposal = arg.value;
			if(proposal != "") {
				if(Class.hasClass(this.oBtn, 'weui-btn_disabled')) {
					Class.removeClass(this.oBtn, "weui-btn_disabled");
				}
			} else {
				if(!Class.hasClass(this.oBtn, 'weui-btn_disabled')) {
					Class.addClass(this.oBtn, "weui-btn_disabled");
				}
			}
		},
		submitProposal: function(arg) {
			if(Class.hasClass(arg, "weui-btn_disabled")) {
				return false;
			} else {
				//清空表单
				this.oTextarea.value = "";
				window.location.href = 'msgpage.html';
			}
		}

	}

	return {
		init: function() {
			var f = new Feedback();
			f.init();
		}
	}
}();

window.onload = function() {
	Fb.init();
}