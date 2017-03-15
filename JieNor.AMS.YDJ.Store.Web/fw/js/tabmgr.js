;(function () {

    var TabMgr = (function () {

        //tab 页签容器选择器
        var tabSelector = '#tabs';

        //仪表盘页签 id
        var dashboardId = 'dashboard';

        //tab 页签右键菜单 id
        var contextMenuId = 'tab_context_menu';

        //tab 页签 id 前缀
        var tabPrefix = 'tab_';

        //同时打开的最大页签数（超过最大页签数，则将最开始打开页签从页面中清除掉）
        var maxTab = 15;

        //当前打开的所有页签数组
        var tabs = [];

        //被激活的 tab 面板
        var activeTab = null;

        //关闭页签（先请求服务端，根据请求返回的结果来确定是否要关闭页签，在 close.js 中实现）
        function close(pageId, pageObj) {
            yiCacheScript.g('/fw/js/platform/formop/close.js', function () {
                var po = pageObj ? pageObj : Index.getPage(pageId);
                new Close(po);
            });
        }

        //刷新页签（先请求服务端，根据请求返回的结果来确定是否要刷新页签，在 refresh.js 中实现）
        function refresh(pageId) {
            yiCacheScript.g('/fw/js/platform/formop/refresh.js', function () {
                var po = Index.getPage(pageId);
                new Refresh(po);
            });
        }

        //显示右键菜单
        function showContextMenu(pageId, e) {

            //先移除之前创建的右键菜单
            $('#' + contextMenuId).remove();

            //创建右键菜单
            var $cm = $('<ul>',
                {
                    'id': contextMenuId,
                    'aria-controls': pageId,
                    'class': 'rightMenu list-group'
                })

                .append(
                '<a href="javascript:;" class="list-group-item" data-right="refresh"><i class="glyphicon glyphicon-refresh"></i> 刷新此页签</a>' +
                '<a href="javascript:;" class="list-group-item" data-right="remove"><i class="glyphicon glyphicon-remove"></i> 关闭此页签</a>' +
                '<a href="javascript:;" class="list-group-item" data-right="remove-circle"><i class="glyphicon glyphicon-remove-circle"></i> 关闭其他页签</a>' +
                '<a href="javascript:;" class="list-group-item" data-right="remove-left"><i class="glyphicon glyphicon-chevron-left"></i> 关闭左侧页签</a>' +
                '<a href="javascript:;" class="list-group-item" data-right="remove-right"><i class="glyphicon glyphicon-chevron-right"></i> 关闭右侧页签</a>' +
                '<a href="javascript:;" class="list-group-item" data-right="remove-all"><i class="glyphicon glyphicon-remove-sign"></i> 关闭所有页签</a>'
            );

            //设置右键菜单显示的位置
            $cm.css({ 'top': e.context.offsetHeight - 0 + 'px', 'left': e.context.offsetLeft + 15 + 'px' });

            //将右键菜单追加到 tab 页签中，并显示
            $cm.appendTo($(tabSelector)).fadeIn('slow');

            //鼠标指针离开右键菜单时，隐藏右键菜单
            $cm.mouseleave(function () {
                $(this).fadeOut('slow');
            });

            //点击页面其他地方的时候隐藏右键菜单
            $(document).one('click', function () {
                $cm.fadeOut('slow');
            });
        }

        //隐藏右键菜单
        function hideContextMenu() {

            $('#' + contextMenuId).fadeOut('slow');
        }

        //销毁一个 tab 页签
        function dispose (pageId) {

            //将 tab 页签 从 页签容器中清除掉
            $('#' + tabPrefix + pageId).remove();

            //将 tab 页签内容面板 从 面板容器中清除掉
            $('#' + pageId).remove();

            //销毁页面对象
            Index.disposePage(pageId);
        };

        //禁用所有 tab 页签
        function disable () {

            //禁用所有 tab 页签
            $('li[role="presentation"].active').removeClass('active');

            //禁用所有 tab 内容面板
            $('div[role="tabpanel"].active').removeClass('active');
        };

        //启用一个页签
        function enable(pageId) {

            //激活 tab 页签
            $('#' + tabPrefix + pageId).addClass('active');

            //激活 tab 内容面板
            $('#' + pageId).addClass('active');
        };

        //启用仪表盘
        function enableDsbd() {

            //激活 tab 页签
            $('a[aria-controls="' + dashboardId + '"]').parent().addClass('active');

            //激活 tab 内容面板
            $('#' + dashboardId).addClass('active');
        };

        //打开页签后要执行的一些操作
        function opening(pageId) {

            //先将所有 tab 页签设置为“非激活”状态
            disable();

            //根据 id 激活 tab 页签
            enable(pageId);

            //处理多余的页签
            tabDrop();
        };

        //下拉框页签
        function tabDrop () {

            //tab 页签容器
            var yi_tabs = $(tabSelector);

            //tab 容器下面的 ul 元素
            var element = yi_tabs.find('.nav-tabs');

            //页签下拉列表
            var dropdown = element.find('.tabdrop');

            //如果页签下拉列表不存在
            if (!dropdown) {

                //创建页签下拉列表
                dropdown = $('<li>', {
                    'class': 'dropdown pull-right hide tabdrop tab-drop'
                }).append(
                    $('<a>', {
                        'class': 'dropdown-toggle',
                        'data-toggle': 'dropdown',
                        'href': '#'
                    }).append(
                        $('<i>', { 'class': "glyphicon glyphicon-align-justify" })
                    ).append(
                        $('<b>', { 'class': 'caret' })
                    )
                ).append(
                    $('<ul>', { 'class': "dropdown-menu" })
                );

                //添加到页签容器中
                dropdown.prependTo(element);
            }

            //如果 tab 页签容器存在该样式类
            if (yi_tabs.is('.tabs-below')) {

                //则页签下拉列表增加下拉样式类
                dropdown.addClass('dropup');
            }

            //超出页签条的页签数
            var collection = 0;

            //统计超出页签条的页签数
            element.append(dropdown.find('li'))
            .find('>li')
            .not('.tabdrop')
            .each(function () {

                //如果页签超出了页签条的宽度
                if (this.offsetTop > 0 || element.width() - $(this).position().left - $(this).width() < 83) {

                    //将超出的页签追加到页签下拉列表中
                    dropdown.find('ul').append($(this));

                    //累计超出页签条的页签数
                    collection++;
                }
            });

            //如果有超出的，显示下拉页签
            if (collection > 0) {

                //显示下拉页签
                dropdown.removeClass('hide');

                //如果下拉列表中存在有激活的页签
                if (dropdown.find('.active').length === 1) {

                    //则将下拉页签列表也激活
                    dropdown.addClass('active');

                } else {

                    //否则下拉页签列表不激活
                    dropdown.removeClass('active');
                }

            } else {

                //隐藏下拉页签
                dropdown.addClass('hide');
            }
        };

        //设置 tab 页签内容面板最小高度
        function setPaneMinHeight () {

            //头部的高度
            var hd_height = $('.page-head-placeholder').outerHeight();

            //设置页签内容面板的最小高度，以免底部版权信息往上浮
            var c_min_height = $(window).outerHeight() - hd_height;

            $('#tab-content').css('min-height', c_min_height);
        };

        //还原页面滚动条位置
        function restoreScroll(pageId) {

            //点击 tab 页签时，还原滚动条的位置
            var st = $('#' + pageId).attr('scrollTop');
            $(window).scrollTop(st ? st : 0);

            //清空被激活的 tab 面板
            activeTab = null;

            //切换页签时使该页签中的表格宽度自适应
            setTimeout(function () {
                $(window).triggerHandler('resize.jqGrid');
            }, 50);
        };

        //页面滚动的时候
        function pageScroll () {

            //页面滚动时
            $(window).scroll(function (e) {

                if (!activeTab) {

                    activeTab = $('#tab-content .active');
                }

                //记录各个页签的滚动位置
                activeTab.attr('scrollTop', $(this).scrollTop());
            });
        };

        //初始化页签操作
        function initTabOperate() {

            //tab 页签容器
            var yi_tabs = $(tabSelector);

            //在页签上面点击 X 操作，关闭页签
            yi_tabs.on('click', '.close-tab', function () {

                //获取当前要关闭的 tab 页签 pageId
                var pageId = $(this).siblings('a').attr('aria-controls');

                //请求服务端关闭页签
                close(pageId);
            });

            //在页签上面点击右键菜单
            yi_tabs.on('contextmenu', 'li[role=presentation]', function () {

                //下拉列表的页签中不需要显示右键菜单
                if ($(this).parent().hasClass('dropdown-menu')) {

                    //禁用系统默认的右键菜单
                    return false;
                }

                //获取当前右键菜单点击的 tab 页签
                var pageId = $(this).children('a').attr('aria-controls');

                //如果是“仪表盘”则不需要显示右键菜单
                if (pageId === dashboardId) {

                    //禁用系统默认的右键菜单
                    return false;
                }

                //显示我们自定义的右键菜单
                showContextMenu(pageId, $(this));

                //禁用系统默认的右键菜单
                return false;
            });

            //刷新页签
            yi_tabs.on('click', 'ul.rightMenu a[data-right=refresh]', function () {

                //获取当前要刷新的 tab 页签 pageId
                var pageId = $(this).parent('ul').attr('aria-controls');

                //请求服务端刷新页签
                refresh(pageId);

                //隐藏右键菜单
                hideContextMenu();
            });

            //关闭页签
            yi_tabs.on('click', 'ul.rightMenu a[data-right=remove]', function () {

                //获取当前要关闭的 tab 页签 pageId 和 formId
                var pageId = $(this).parent('ul').attr('aria-controls');

                //请求服务端关闭页签
                close(pageId);

                //隐藏右键菜单
                hideContextMenu();
            });

            //关闭其他页签
            yi_tabs.on('click', 'ul.rightMenu a[data-right=remove-circle]', function () {

                //当前 tab 页签 id
                var pageId = $(this).parent('ul').attr('aria-controls');

                //找到所有 tab 页签
                yi_tabs.children('ul.nav').find('li').each(function () {

                    //每个 tab 页签 id
                    var id = $(this).attr('id');

                    //如果 id 存在 并且 不等于当前的 tab 页签 id
                    if (id && id !== tabPrefix + pageId) {

                        //获取当前要关闭的 tab 页签 pageId
                        var closePageId = id.replace(tabPrefix, '');

                        //请求服务端关闭页签
                        close(closePageId);
                    }
                });

                //隐藏右键菜单
                hideContextMenu();
            });

            //关闭左侧页签
            yi_tabs.on('click', 'ul.rightMenu a[data-right=remove-left]', function () {

                //当前 tab 页签 id
                var pageId = $(this).parent('ul').attr('aria-controls');

                //找到当前 tab 页签“前面”的所有 tab 页签
                $('#' + tabPrefix + pageId).prevUntil().each(function () {

                    //当前 tab 页签“前面”的每个 tab 页签 id
                    var id = $(this).attr('id');

                    //如果 id 存在 并且 不等于当前的 tab 页签 id
                    if (id && id !== tabPrefix + pageId) {

                        //获取当前要关闭的 tab 页签 pageId
                        var closePageId = id.replace(tabPrefix, '');

                        //请求服务端关闭页签
                        close(closePageId);
                    }
                });

                //隐藏右键菜单
                hideContextMenu();
            });

            //关闭右侧页签
            yi_tabs.on('click', 'ul.rightMenu a[data-right=remove-right]', function () {

                //当前 tab 页签 id
                var pageId = $(this).parent('ul').attr('aria-controls');

                //找到当前 tab 页签“后面”的所有 tab 页签
                $('#' + tabPrefix + pageId).nextUntil().each(function () {

                    //当前 tab 页签“后面”的每个 tab 页签 id
                    var id = $(this).attr('id');

                    //如果 id 存在 并且 不等于当前的 tab 页签 id
                    if (id && id !== tabPrefix + pageId) {

                        //获取当前要关闭的 tab 页签 pageId
                        var closePageId = id.replace(tabPrefix, '');

                        //请求服务端关闭页签
                        close(closePageId);
                    }
                });

                //隐藏右键菜单
                hideContextMenu();
            });

            //关闭所有页签
            yi_tabs.on('click', 'ul.rightMenu a[data-right=remove-all]', function () {

                //找到所有的 tab 页签
                $.each(yi_tabs.find('li[id]'), function () {

                    //获取当前要关闭的 tab 页签 pageId
                    var closePageId = $(this).attr('id').replace(tabPrefix, '');

                    //请求服务端关闭页签
                    close(closePageId);
                });

                //激活“仪表盘”
                enableDsbd();

                //隐藏右键菜单
                hideContextMenu();
            });
        };

        //初始化
        function init () {

            //使 tab 页签支持响应式布局
            $('.nav-pills, .nav-tabs').tabdrop();

            //点击仪表盘的时候
            $('#tabs li[role="presentation"]').click(function () {

                //还原页面滚动条位置
                restoreScroll(dashboardId);
            });

            //初始化页签操作
            initTabOperate();

            //设置 tab 页签内容面板最小高度
            setPaneMinHeight();

            //页面滚动的时候
            pageScroll();
        };

        //单例
        var tabMgrSingle = function () {

            var that = this;

            //打开一个页签
            that.open = function (opts) {

                //合并参数
                opts = $.extend({ isClose: true, title: '', pageId: '', callback: function () { } }, opts || {});

                //创建 tab 页签
                var title = $('<li>', { 'role': 'presentation', 'id': tabPrefix + opts.pageId })

                //tab 页签点击的时候
                .click(function () {

                    //还原页面滚动条位置
                    restoreScroll(opts.pageId);
                })

                //设置页签标题
                .append($('<a>', { 'href': '#' + opts.pageId, 'aria-controls': opts.pageId, 'role': 'tab', 'data-toggle': 'tab' }).html(opts.title));

                //如果允许关闭操作
                if (opts.isClose) {

                    //在页签上面增加一个 X 关闭操作
                    title.append($('<i>', { 'class': 'close-tab glyphicon glyphicon-remove close-tab-icon' }));
                }

                //创建一个新的 tab 内容面板
                var panel = $('<div>', { 'id': opts.pageId, 'class': 'tab-pane', 'role': 'tabpanel' });

                //将页签添加到页签容器中
                $(tabSelector).children('.nav-tabs').append(title);

                //将页签面板添加到面板容器中
                $('#tab-content').append(panel);

                //执行回调函数
                $.isFunction(opts.callback) && opts.callback(panel);

                //打开页签后要执行的一些操作
                opening(opts.pageId);
            };

            //刷新一个页签
            that.refresh = function (pageId) {

                //页签内容滚动到顶部
                Metronic.scrollTo($(Index.getPageSelector(pageId)), -500);

                //先将所有 tab 页签设置为“非激活”状态
                disable();

                //根据 id 激活 tab 页签
                enable(pageId);

                //处理多余的页签
                tabDrop();
            };

            //关闭一个页签
            that.close = function (pageId) {

                //如果是关闭下拉列表中的 tab 页签
                if ($('#' + tabPrefix + pageId).parent().hasClass('dropdown-menu')) {

                    //将下拉列表中的所有页签设置为“非激活”状态
                    $('#' + tabPrefix + pageId).siblings().each(function () {
                        var sblsId = $(this).children('a').attr('aria-controls');
                        if (sblsId) {
                            $('#' + tabPrefix + sblsId).removeClass('active');
                            $('#' + sblsId).removeClass('active');
                        }
                    });

                    //如果没有正常的激活页签
                    var lis = $('.nav-tabs').children('li[role="presentation"]');
                    if (lis.filter('.active').length === 0) {

                        //如果只有一个，那么说明只剩下“仪表盘”页签了
                        if (lis.length === 1) {

                            //激活“仪表盘”
                            enableDsbd();

                        } else {

                            //则激活所有正常页签中的最后一个
                            enable(lis.last().children('a').attr('aria-controls'));
                        }
                    }

                } else {

                    //如果关闭的是当前激活的 tab 页签，则激活他的前一个 tab 页签
                    if ($(tabSelector).find('li.active').attr('id') === tabPrefix + pageId) {

                        //激活关闭 tab 页签 的前一个 tab 页签
                        $('#' + tabPrefix + pageId).prev().addClass('active');
                        $('#' + pageId).prev().addClass('active');
                    }
                }

                //销毁 tab
                dispose(pageId);

                //处理多余的页签
                tabDrop();
            };

            //激活一个页签
            that.activate = function (pageId) {

                //如果指定页签未激活
                if (!$('#' + pageId).is(':visible')) {

                    //则激活指定页签
                    opening(pageId);
                }
            };

            //重命名一个页签
            that.rename = function (pageId, name) {

                $('#' + tabPrefix + pageId).find('a[aria-controls]').text(name);
            };

            //获取一个页签的名称（也就是页签标题）
            that.getName = function (pageId) {

                return $('#' + tabPrefix + pageId).find('a[aria-controls]').text();
            };

            //管理页签
            that.manage = function (pageObj) {

                //如果 tab 页签容器已超过最大限制
                if (tabs.length === maxTab) {

                    //将最开始打开的 tab 页签从列表中清除掉
                    var first = tabs.shift();

                    //请求服务端关闭页签
                    close(first.pageId, first);
                }

                //记录 tab 页签
                tabs.push(pageObj);

                //记录页面对象
                Index.addPage(pageObj);
            };
        };

        //单例实例
        var instance;

        //返回对象
        return {
            getInstance: function () {
                if (instance === undefined) {
                    instance = new tabMgrSingle();
                    init();
                }
                return instance;
            }
        };

    })();

    //如果 window 上面没有该属性，则将该属性扩展到 window 上面
    window.TabMgr = window.TabMgr || TabMgr;

})();