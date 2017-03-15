/**
 * Website: http://git.oschina.net/hbbcs/bootStrap-addTabs
 *
 * Version : 1.0
 *
 * Created by joe on 2016-2-4.
 */

$.fn.addtabs = function (options) {
    obj = $(this);
    Addtabs.options = $.extend({
        content: '', //直接指定所有页面TABS内容
        close: true, //是否可以关闭
        monitor: 'body', //监视的区域
        iframeUse: false, //使用iframe还是ajax
        iframeHeight: $(document).height() - 107, //固定TAB中IFRAME高度,根据需要自己修改
        method: 'init',
        callback: function () { //关闭后回调函数
        }
    }, options || {});


    $(Addtabs.options.monitor).on('click', '[data-addtab]', function () {
        //隐藏下拉导航菜单
        $(this).closest('.menu-dropdown').removeClass('open');
        //添加一个tab页签
        Addtabs.add({
            id: $(this).attr('data-addtab'),
            title: $(this).attr('title') ? $(this).attr('title') : $(this).html(),
            content: Addtabs.options.content ? Addtabs.options.content : $(this).attr('content'),
            url: $(this).attr('url'),
            ajax: $(this).attr('ajax') ? true : false
        });
    });

    obj.on('click', '.close-tab', function () {
        var id = $(this).prev("a").attr("aria-controls");
        Addtabs.close(id);
    });
    //obj上禁用右键菜单
    obj.on('contextmenu', 'li[role=presentation]', function () {
        var id = $(this).children('a').attr('aria-controls');
        if (id === 'dashboard') {
            return false;
        }
        var url = $(this).attr('aria-url');
        var ajax = $(this).attr('ajax') ? true : false;
        Addtabs.pop(id, $(this), url, ajax);
        return false;
    });

    //刷新页面
    obj.on('click', 'ul.rightMenu a[data-right=refresh]', function () {
        var ul = $(this).parent('ul');
        var id = ul.attr("aria-controls").substring(4);
        var url = ul.attr('aria-url') + '?r=' + Math.random();
        var ajax = ul.attr('ajax');
        Addtabs.add({ 'id': id, 'url': url, 'ajax': ajax });
        $('#popMenu').fadeOut();
    });

    //关闭自身
    obj.on('click', 'ul.rightMenu a[data-right=remove]', function () {
        var id = $(this).parent("ul").attr("aria-controls");
        Addtabs.close(id);
        Addtabs.drop();
        $('#popMenu').fadeOut();
    });

    //关闭其他
    obj.on('click', 'ul.rightMenu a[data-right=remove-circle]', function () {
        var tab_id = $(this).parent('ul').attr("aria-controls");
        obj.children('ul.nav').find('li').each(function () {
            var id = $(this).attr('id');
            if (id && id != 'tab_' + tab_id) {
                Addtabs.close($(this).children('a').attr('aria-controls'));
            }
        });
        Addtabs.drop();
        $('#popMenu').fadeOut();
    });

    //关闭左侧
    obj.on('click', 'ul.rightMenu a[data-right=remove-left]', function () {
        var tab_id = $(this).parent('ul').attr("aria-controls");
        $('#tab_' + tab_id).prevUntil().each(function () {
            var id = $(this).attr('id');
            if (id && id != 'tab_' + tab_id) {
                Addtabs.close($(this).children('a').attr('aria-controls'));
            }
        });
        Addtabs.drop();
        $('#popMenu').fadeOut();
    });

    //关闭右侧
    obj.on('click', 'ul.rightMenu a[data-right=remove-right]', function () {
        var tab_id = $(this).parent('ul').attr("aria-controls");
        $('#tab_' + tab_id).nextUntil().each(function () {
            var id = $(this).attr('id');
            if (id && id != 'tab_' + tab_id) {
                Addtabs.close($(this).children('a').attr('aria-controls'));
            }
        });
        Addtabs.drop();
        $('#popMenu').fadeOut();
    });

    //obj.on('mouseover', 'li[role = "presentation"]', function () {
    //    $(this).find('.close-tab').show();
    //});

    //obj.on('mouseleave', 'li[role = "presentation"]', function () {
    //    $(this).find('.close-tab').hide();
    //});

    $(window).resize(function () {
        obj.find('iframe').attr('height', Addtabs.options.iframeHeight);
        Addtabs.drop();
    });

};

window.Addtabs = {
    options: {},
    add: function (opts) {
        var id = 'tab_' + opts.id;
        $('li[role = "presentation"].active').removeClass('active');
        $('div[role = "tabpanel"].active').removeClass('active');
        var content = null;
        //如果TAB不存在，创建一个新的TAB
        if (!$("#" + id)[0]) {
            //创建新TAB的title

            var title = $('<li>', {
                'role': 'presentation',
                'id': 'tab_' + id,
                'aria-url': opts.url
            }).append(
                $('<a>', {
                    'href': '#' + id,
                    'aria-controls': id,
                    'role': 'tab',
                    'data-toggle': 'tab'
                }).html(opts.title)
            );

            //是否允许关闭
            if (Addtabs.options.close) {
                title.append(
                    $('<i>', { 'class': 'close-tab glyphicon glyphicon-remove close-tab-icon' })
                );
            }
            //创建新TAB的内容
            content = $('<div>', {
                'class': 'tab-pane',
                'id': id,
                'role': 'tabpanel'
            });
            //加入TABS
            obj.children('.nav-tabs').append(title);
            $("#tab-content").append(content);
        } else {
            content = $('#' + id);
            content.html('');
        }

        //是否存在 url
        if (opts.url) {

            //是否指定是 ajax 异步加载 html 页面内容
            if (opts.ajax) {

                //通过 ajax 异步加载指定 url 页面内容
                $.get(opts.url, function (data) {
                    content.append(data);
                });

            }else {
                //否则使用 iframe 打开 url
                content.append(
                    $('<iframe>', {
                        'class': 'iframeClass',
                        'height': Addtabs.options.iframeHeight,
                        'frameborder': "no",
                        'border': "0",
                        'src': opts.url
                    })
                );
            }
        } else {

            //是否存在要显示的指定内容
            if (opts.content) {

                content.append(opts.content);
            } else {

                content.append('没有指定要显示的内容！');
            }
        }

        //激活TAB
        $('#tab_' + id).addClass('active');
        $('#' + id).addClass('active');
        Addtabs.drop();
    },
    pop: function (id, e, url, ajax) {
        $('body').find('#popMenu').remove();
        var pop = $('<ul>', { 'aria-controls': id, 'class': 'rightMenu list-group', id: 'popMenu', 'aria-url': url, 'ajax': ajax })
            .append(
            '<a href="javascript:void(0);" class="list-group-item" data-right="refresh"><i class="glyphicon glyphicon-refresh"></i> 刷新此页签</a>' +
            '<a href="javascript:void(0);" class="list-group-item" data-right="remove"><i class="glyphicon glyphicon-remove"></i> 关闭此页签</a>' +
            '<a href="javascript:void(0);" class="list-group-item" data-right="remove-circle"><i class="glyphicon glyphicon-remove-circle"></i> 关闭其他页签</a>' +
            '<a href="javascript:void(0);" class="list-group-item" data-right="remove-left"><i class="glyphicon glyphicon-chevron-left"></i> 关闭左侧页签</a>' +
            '<a href="javascript:void(0);" class="list-group-item" data-right="remove-right"><i class="glyphicon glyphicon-chevron-right"></i> 关闭右侧页签</a>'
        );
        pop.css({
            'top': e.context.offsetHeight - 0 + 'px',
            'left': e.context.offsetLeft + 15 + 'px'
        });
        pop.appendTo(obj).fadeIn('slow');
        pop.mouseleave(function () {
            $(this).fadeOut('slow');
        });
    },
    close: function (id) {
        //如果关闭的是当前激活的TAB，激活他的前一个TAB
        if (obj.find("li.active").attr('id') === "tab_" + id) {
            $("#tab_" + id).prev().addClass('active');
            $("#" + id).prev().addClass('active');
        }
        //关闭TAB
        $("#tab_" + id).remove();
        $("#" + id).remove();
        Addtabs.drop();
        Addtabs.options.callback();
    },
    closeAll: function () {
        $.each(obj.find('li[id]'), function () {
            var id = $(this).children('a').attr('aria-controls');
            $("#tab_" + id).remove();
            $("#" + id).remove();
        });
        obj.find('li[role = "presentation"]').first().addClass('active');
        var firstID = obj.find('li[role = "presentation"]').first().children('a').attr('aria-controls');
        $('#' + firstID).addClass('active');
        Addtabs.drop();
    },
    drop: function () {
        element = obj.find('.nav-tabs');
        //创建下拉页签
        var dropdown = $('<li>', {
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
        )

        //检测是否已增加
        if (!$('.tabdrop').html()) {
            dropdown.prependTo(element);
        } else {
            dropdown = element.find('.tabdrop');
        }
        //检测是否有下拉样式
        if (element.parent().is('.tabs-below')) {
            dropdown.addClass('dropup');
        }
        var collection = 0;

        //检查超过一行的页签页
        element.append(dropdown.find('li'))
            .find('>li')
            .not('.tabdrop')
            .each(function () {
                if (this.offsetTop > 0 || element.width() - $(this).position().left - $(this).width() < 83) {
                    dropdown.find('ul').append($(this));
                    collection++;
                }
            });

        //如果有超出的，显示下拉页签
        if (collection > 0) {
            dropdown.removeClass('hide');
            if (dropdown.find('.active').length == 1) {
                dropdown.addClass('active');
            } else {
                dropdown.removeClass('active');
            }
        } else {
            dropdown.addClass('hide');
        }
    }
}