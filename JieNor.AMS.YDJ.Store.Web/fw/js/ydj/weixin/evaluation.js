/*
 * 四个对象处理四个模块的逻辑
 * Star:处理点赞模块
 * Tag:处理建议按钮点击
 * Grade:处理表单输入
 * suggest:处理网络请求
 * */
var Ev = function() {
	
	var Star = function() {
		this.aStar = null;
	};

	Star.prototype = {
		constructor: Star,
		init: function() {
			this.aStar = document.getElementsByClassName('single_star');
			/*
			 *  把事件监听方法的过程封装起来.bindEvent()
				for(var i =0;i<this.aStar.length;i++){
					this.aStar[i].isLight = true;
					//利用闭包保存for循环里面的每个i
					(function(i){
						This.aStar[i].addEventListener('touchend',function(){
							This.touchStar(i,this);
						},false);
					})(i);
				}
			*/
			bindEvent(this, this.aStar, this.touchStar);
		},
		touchStar: function(index, obj) {
			if(obj.isLight) {
				for(var i = index; i < 4; i++) {
					this.aStar[i + 1].src = '../../../fw/images/weixin/star0.png';
					this.aStar[i + 1].isLight = false;
				}
			} else {
				for(var i = 0; i <= index; i++) {
					this.aStar[i].src = '../../../fw/images/weixin/star1.png';
					this.aStar[i].isLight = true;
				}
			}
		},
	};

	var Tag = function() {
		this.aPositive = null;
		this.aNegative = null;
	};
	Tag.prototype = {
		constructor: Tag,
		init: function() {
			this.aPositive = document.getElementsByClassName('positive');
			//绑定事件
			bindEvent(this, this.aPositive, this.poClick);

			this.aNegative = document.getElementsByClassName('negative');
			//绑定事件
			bindEvent(this, this.aNegative, this.ngClick);
		},
		poClick: function(index, obj) {
			//isLight = true:未选中,isLight=false:选中
			if(obj.isLight) {
				obj.isLight = false;
				Class.removeClass(obj, 'weui-btn_default');
				Class.addClass(obj, 'weui-btn_primary');
			} else {
				obj.isLight = true;
				Class.removeClass(obj, 'weui-btn_primary');
				Class.addClass(obj, 'weui-btn_default');
			}
		},
		ngClick: function(index, obj) {
			//isLight = true:未选中,isLight=false:选中
			if(obj.isLight) {
				obj.isLight = false;
				Class.removeClass(obj, 'weui-btn_default');
				Class.addClass(obj, 'weui-btn_warn');
			} else {
				obj.isLight = true;
				Class.removeClass(obj, 'weui-btn_warn');
				Class.addClass(obj, 'weui-btn_default');
			}
		}
	};

	var Grade = function() {
		this.oGrade = null;
		this.oC_s_aera = document.getElementsByClassName('c_s_aera')[0];
		this.oFinalContent = "";
		this.oSubmit_btn = null;
		this.nCurrent_count = 0;

	};
	Grade.prototype = {
		constructor: Grade,
		init: function() {
			this.oGrade = document.getElementsByClassName('grading')[0];
			this.oSubmit_btn = document.getElementsByClassName('submit_btn')[0];

			var This = this;
			this.oGrade.addEventListener('keyup', function() {
				This.monitorGrade(this);
			}, false);

			this.oC_s_aera.addEventListener('keyup', function() {
				This.countContent(this);
			}, false);

		},
		monitorGrade: function(obj) {
			var grade = obj.value;
			if(grade > 5 || grade < 0) {
				this.oGrade.value = "";
			}
		},
		countContent: function (obj) {
            //输入的字符数量
		    this.nCurrent_count = document.getElementById('current_count');
		    var value1 = this.trim(obj.value);
		    if (value1.length<= 150) {
		        this.oFinalContent = value1;
				this.nCurrent_count.innerText = this.oFinalContent.length;
		    } else if(value1.length > 150) {
				this.oC_s_aera.value = this.oFinalContent;
			}
			if(this.oFinalContent != "") {
				if(Class.hasClass(this.oSubmit_btn, 'weui-btn_disabled')) {
					Class.removeClass(this.oSubmit_btn, "weui-btn_disabled");
				}
			} else {
				if(!Class.hasClass(this.oSubmit_btn, 'weui-btn_disabled')) {
					Class.addClass(this.oSubmit_btn, "weui-btn_disabled");
				}
			}
		},
		trim:function(str){
		    return str.replace(/(^\s*)|(\s*$)/g, "");
		}
	}

	var Suggest = function() {
		this.oS_btn = null;
		this.g = null;
	}
	Suggest.prototype = {
		constructor: Suggest,
		init: function() {
			this.oS_btn = document.getElementsByClassName('submit_btn')[0];
			this.g = new Grade();
			var This = this;
			this.oS_btn.addEventListener('touchend', function() {
				This.submitSuggest();
			}, false);
		},
		submitSuggest: function() {
			//清空表单
			//评分保留一位小数
			this.g.oC_s_aera.value = "";

			window.location.href = 'msgpage.html';
		}

	};

	/*
	 * 绑定事件监听的抽象方法:
	 * This(required):传入的执行环境,即调用的fn方法所在的环境;
	 * obj(required):传入的要绑定的dom元素的集合;
	 * fn(required):传入的要执行的方法;
	 */
	var bindEvent = function(This, obj, fn) {
		for(var i = 0; i < obj.length; i++) {
			obj[i].isLight = true;
			(function(i) {
				obj[i].addEventListener('touchend', function() {
					fn.call(This, i, obj[i]);
				}, false);
			})(i);
		}
	};

	return {
		init: function() {
			var s = new Star();
			s.init();
			var t = new Tag();
			t.init();
			var g = new Grade();
			g.init();
			var suggest = new Suggest();
			suggest.init();
		}
	}
}();

window.onload = function() {
	Ev.init();
}