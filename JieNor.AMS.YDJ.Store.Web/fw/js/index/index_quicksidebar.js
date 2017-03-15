/**
Core script to handle the entire theme and core functions
**/
var QuickSidebar = function () {
	//为创建消息而测试 
	//在页面上进行消息展示 $platform是消息展示的地方，num是消息的数量，type是消息的所有人，in是别人，out是自己
	var showMessage = function ($platform,num,type){
		$platform.empty();
		var time = new Date();
		//这里是数据请求，即向后台获得聊天的消息
		for(var i=0;i<num;i++){
			var message = createMessage(type, (time.getHours() + ':' + time.getMinutes()), "Bob Nilson", 'avatar3', 'test测试');
			
            $platform.append(message);
        }
	}
	//创建消息 createMessage(方式in和out, 发送消息时间, 名字, '图片路径', '消息');
	var createMessage = function (dir, time, name, avatar, message) {
        var tpl = '';
        tpl += '<div class="post ' + dir + '">';//dir=in或者out
        tpl += '<img class="avatar" alt="" src="' + Layout.getLayoutImgPath() + avatar + '.jpg"/>';
        tpl += '<div class="message">';
        tpl += '<span class="arrow"></span>';
        tpl += '<a href="#" class="name">Bob Nilson</a>&nbsp;';
        tpl += '<span class="datetime">' + time + '</span>';
        tpl += '<span class="body">';
        tpl += message;
        tpl += '</span>';
        tpl += '</div>';
        tpl += '</div>';

        return tpl;
    };
	
    // Handles quick sidebar toggler
    var handleQuickSidebarToggler = function () {
        // quick sidebar toggler
        $('.page-header .quick-sidebar-toggler, .page-quick-sidebar-toggler').click(function (e) {
            $('body').toggleClass('page-quick-sidebar-open');
        });
        //点击右侧栏之外的地方（除了显示操作），隐藏右侧栏
        $('body').bind('click', function (e) {
            var t = $(e.target);
            //如果点击的不是“显示右侧栏操作”并且也不是“右侧栏本身”的话
            if (t.closest(".quick-sidebar-toggler").length === 0 && t.closest(".page-quick-sidebar-wrapper").length === 0) {
                //则隐藏右侧栏
                $('body').removeClass('page-quick-sidebar-open');
            }
        });
    };

    // Handles quick sidebar chats
    var handleQuickSidebarChat = function () {
        var wrapper = $('.page-quick-sidebar-wrapper');
        var wrapperChat = wrapper.find('.page-quick-sidebar-chat');
        //聊天信息框
		var chatContainer = wrapperChat.find(".page-quick-sidebar-chat-user-messages");
		
        var initChatSlimScroll = function () {
            var chatUsers = wrapper.find('.page-quick-sidebar-chat-users');
            var chatUsersHeight;

            chatUsersHeight = wrapper.height() - wrapper.find('.nav-justified > .nav-tabs').outerHeight();

            // chat user list  
            Metronic.destroySlimScroll(chatUsers);
            chatUsers.attr("data-height", chatUsersHeight);
            //创建滚动条
            Metronic.initSlimScroll(chatUsers);

            var chatMessages = wrapperChat.find('.page-quick-sidebar-chat-user-messages');
            var chatMessagesHeight = chatUsersHeight - wrapperChat.find('.page-quick-sidebar-chat-user-form').outerHeight() - wrapperChat.find('.page-quick-sidebar-nav').outerHeight();

            // user chat messages 
            Metronic.destroySlimScroll(chatMessages);
            chatMessages.attr("data-height", chatMessagesHeight);
            Metronic.initSlimScroll(chatMessages);
        };

        initChatSlimScroll();
        Metronic.addResizeHandler(initChatSlimScroll); // reinitialize on window resize
		//当点用户的时候，就可以弹出他们的聊天消息框和显示聊天内容
        wrapper.find('.page-quick-sidebar-chat-users .media-list > .media').click(function () {
        	//弹出聊天消息框
            wrapperChat.addClass("page-quick-sidebar-content-item-shown");
            var params=$(this).attr('id');
            params=params.split('-');
			showMessage(chatContainer,params[0],params[1]);
        });
		
		//点击back的时候，回到用户栏
        wrapper.find('.page-quick-sidebar-chat-user .page-quick-sidebar-back-to-list.back').click(function () {
            //以去除类名的方式去除消息栏
            wrapperChat.removeClass("page-quick-sidebar-content-item-shown");
        });
        //点击更多的消息按键时，出现当前消息
		$('.page-quick-sidebar-chat-user div.btn-group ul li').click(function(){
			var index=$(this).index()+1;
			showMessage(chatContainer,index,'in');
		})
		
        var handleChatMessagePost = function (e) {
            e.preventDefault();

            //var chatContainer = wrapperChat.find(".page-quick-sidebar-chat-user-messages");
            var input = wrapperChat.find('.page-quick-sidebar-chat-user-form .form-control');

            var text = input.val();
            if (text.length === 0) {
                return;
            }

            // handle post
            var time = new Date();
            var message = createMessage('out', (time.getHours() + ':' + time.getMinutes()), "Bob Nilson", 'avatar3', text);
            message = $(message);
            chatContainer.append(message);

            var getLastPostPos = function () {
                var height = 0;
                chatContainer.find(".post").each(function () {
                    height = height + $(this).outerHeight();
                });

                return height;
            };

            chatContainer.slimScroll({
                scrollTo: getLastPostPos()
            });

            input.val("");

            // simulate reply
            setTimeout(function () {
                var time = new Date();
                var message = createMessage('in', (time.getHours() + ':' + time.getMinutes()), "Ella Wong", 'avatar2', 'Lorem ipsum doloriam nibh...');
                message = $(message);
                chatContainer.append(message);

                chatContainer.slimScroll({
                    scrollTo: getLastPostPos()
                });
            }, 3000);
        };

        wrapperChat.find('.page-quick-sidebar-chat-user-form .btn').click(handleChatMessagePost);
        wrapperChat.find('.page-quick-sidebar-chat-user-form .form-control').keypress(function (e) {
            if (e.which == 13) {
                handleChatMessagePost(e);
                return false;
            }
        });
    };

    // Handles quick sidebar tasks
    var handleQuickSidebarAlerts = function () {
        var wrapper = $('.page-quick-sidebar-wrapper');
        var wrapperAlerts = wrapper.find('.page-quick-sidebar-alerts');

        var initAlertsSlimScroll = function () {
            var alertList = wrapper.find('.page-quick-sidebar-alerts-list');
            var alertListHeight;

            alertListHeight = wrapper.height() - wrapper.find('.nav-justified > .nav-tabs').outerHeight();

            // alerts list 
            Metronic.destroySlimScroll(alertList);
            alertList.attr("data-height", alertListHeight);
            Metronic.initSlimScroll(alertList);
        };

        initAlertsSlimScroll();
        Metronic.addResizeHandler(initAlertsSlimScroll); // reinitialize on window resize
    };

    // Handles quick sidebar settings
    var handleQuickSidebarSettings = function () {
        var wrapper = $('.page-quick-sidebar-wrapper');
        var wrapperAlerts = wrapper.find('.page-quick-sidebar-settings');

        var initSettingsSlimScroll = function () {
            var settingsList = wrapper.find('.page-quick-sidebar-settings-list');
            var settingsListHeight;

            settingsListHeight = wrapper.height() - wrapper.find('.nav-justified > .nav-tabs').outerHeight();

            // alerts list 
            Metronic.destroySlimScroll(settingsList);
            settingsList.attr("data-height", settingsListHeight);
            Metronic.initSlimScroll(settingsList);
        };

        initSettingsSlimScroll();
        Metronic.addResizeHandler(initSettingsSlimScroll); // reinitialize on window resize
    };
	
	//创建用户树形表
	var createUser = function () {
		var curMenu = null, zTree_Menu = null;
		var setting = {
			view: {
				showLine: false,
				showIcon: false,
				selectedMulti: false,
				dblClickExpand: false,
				addDiyDom: addDiyDom
			},
			
			data: {
				simpleData: {
					enable: true
				}
			},
			callback: {
				beforeClick: beforeClick,
				//点击一次展开或者隐藏下拉项
				onClick: onClick
			}
		};

		var zNodes =[
			{ id:1, pId:0, name:"文件夹", open:true},
			{ id:11, pId:1, name:"收件箱"},
			{ id:111, pId:11, name:"收件箱1"},
			{ id:112, pId:111, name:"收件箱2"},
			{ id:113, pId:112, name:"收件箱3"},
			{ id:114, pId:113, name:"收件箱4"},
			{ id:12, pId:1, name:"垃圾邮件"},
			{ id:13, pId:1, name:"草稿"},
			{ id:14, pId:1, name:"已发送邮件"},
			{ id:15, pId:1, name:"已删除邮件"},
			{ id:3, pId:0, name:"快速视图"},
			{ id:31, pId:3, name:"文档"},
			{ id:32, pId:3, name:"照片"}
		];
		
		function onClick(e,treeId, treeNode) {
			
			
		}
		
		function addDiyDom(treeId, treeNode) {
			var spaceWidth = 5;
			var switchObj = $("#" + treeNode.tId + "_switch"),
			icoObj = $("#" + treeNode.tId + "_ico");
			switchObj.remove();
			icoObj.before(switchObj);

			if (treeNode.level > 1) {
				var spaceStr = "<span style='display: inline-block;width:" + (spaceWidth * treeNode.level)+ "px'></span>";
				switchObj.before(spaceStr);
			}
		}

		function beforeClick(treeId, treeNode) {
			if (treeNode.level == 0 ) {
				var zTree = $.fn.zTree.getZTreeObj("userTree");
				zTree.expandNode(treeNode);
				return false;
			}
			return true;
		}
		
		return {
			install:function(){
				var treeObj = $("#userTree");
				
				$.fn.zTree.init(treeObj, setting, zNodes);
				zTree_Menu = $.fn.zTree.getZTreeObj("userTree");
				curMenu = zTree_Menu.getNodes()[0].children[0].children[0];
				zTree_Menu.selectNode(curMenu);
				
				treeObj.hover(function () {
					if (!treeObj.hasClass("showIcon")) {
						treeObj.addClass("showIcon");
					}
				}, function() {
					treeObj.removeClass("showIcon");
				});
			}
		};
	}
	
	//当超级管理员广播消息的时候，弹出侧边栏，激活通知列签，并且显示广播的信息
	var broastCast = function () {
		//侧边栏的对象
		var $navJustified=$('.nav-justified');
	    var loghub = $.connection.log;
		var imhub = $.connection.im;
		
		if(imhub==undefined){
			//如果检测到没有该对象，证明文件没有被导入，测试代码，后期删除。
			console.log(imhub);
			return false;
		}
		
		//后台设计的im通道,是为了广播消息而设计的,通过微软的signalr功能,imhub.client.resmes里面是广播的信息
		imhub.client.recvmsg = function (message) {
			
	      //功能实现要求: 当超级管理员广播消息的时候，弹出侧边栏，激活通知列签，并且显示广播的信息
			//弹出侧边栏
		    $('body').addClass('page-quick-sidebar-open');
			//显示通知列签
		    $navJustified.children('ul.nav-tabs').find('li').removeClass('active').eq(2).addClass('active');
		    //显示通知列签的页面
		    $navJustified.find('.tab-content>div').removeClass('active')
		    .eq(2).addClass('active');
		    //广播的具体信息
		    var $sysMessage = $(
		    '<li>\
			    <div class="col1">\
		            <div class="cont">\
		                <div class="cont-col1">\
		                    <div class="label label-sm label-warning">\
		                        <i class="fa fa-bell-o"></i>\
		                    </div>\
		                </div>\
		                <div class="cont-col2">\
		                    <div class="desc"></span></div>\
		                </div>\
		            </div>\
		        </div>\
		        <div class="col2">\
		        	<div class="date"></div>\
		        </div>\
			</li>');
		    //填充消息

		    $sysMessage.find('div.desc').text(message.message);
		    $sysMessage.find('div.date').text(message.date);

			//因为不管有没有广播消息,广播的提示始终是存在的,所以为广播设置一个标识.即attr-showSys=sysMessage
			//标识信息的后面就是广播的具体信息的位置.
		    $navJustified.find('ul[attr-showSys=sysMessage]')
		    //添加消息
		    .append($sysMessage);
	      
		};
		
	    // Start the connection.
	  $.connection.hub.start().done(function (r) {
	      console.info(r);
	  })
      .fail(function (e) {
            console.info(e);
        });
	
	};
	
    return {
        init: function () {
            //layout handlers
            //控制弹出和弹入
            handleQuickSidebarToggler(); // handles quick sidebar's toggler
            handleQuickSidebarChat(); // handles quick sidebar's chats
            handleQuickSidebarAlerts(); // handles quick sidebar's alerts
            handleQuickSidebarSettings(); // handles quick sidebar's setting
            //用户树形表
            createUser().install();
            broastCast();//侧边栏效果
        }
    };
}();
$(document).ready(function () {
	
    QuickSidebar.init();
});