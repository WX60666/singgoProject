/// <reference path="/fw/js/basepage.js" />
; (function () {

    var Index_SysMenu = (function () {

        return function () {

            var that = this;

            that.init = function () {

                that.renderMenu(function (data) {

                    var res = data.operationResult.srvData;

                    //一级导航渲染
                    that.renderClassOne(res);

                    //二级导航渲染，且可判断数据的多少进行展示;
                    for (var i = 0, l = res.length; i < l; i++) {//将排列好的数据放入执行函数当中。

                        that.renderClassTwo(res[i], i);
                    }

                    that.renderComplete();
                });

                that.dropHideMenu();
            };

            that.renderMenu = function (callback) {

                var ListMenuUrl = '/dynamic/sys_mainfw?operationno=listmenu&format=json';

                yiAjax.p(ListMenuUrl, null,
                    function (r) {
                        $.isFunction(callback) && callback(r);
                    }, null, undefined, $("body")
                )
            };

            that.renderComplete = function () {//当数据加载并渲染完后,取消loading状态

                //监控每个菜单，在点击每个菜单的时候，打开对于的 tab 页签
                $('.navbar-nav').on('click', '[url]', function () {

                    //隐藏下拉导航菜单
                    $(this).closest('.menu-dropdown').removeClass('open');

                    //打开页签
                    Index.openForm({
                        formId: $(this).attr('formId'),
                        domainType: $(this).attr('domainType')
                    });
                });
            };

            that.renderClassOne = function (res) {//一级导航的渲染

                var firstOrder = '';
                res = res.sort(yiCommon.sortby('order'));//排序后的数组

                for (var i = 0, l = res.length; i < l; i++) {
                    firstOrder += '<li class="menu-dropdown classic-menu-dropdown"><a data-hover="megamenu-dropdown" data-close-others="true" data-toggle="dropdown" href="javascript:;" class="hover-initialized">' + res[i]['name'] + '<i class="fa fa-angle-down"></i></a></li>';
                }
                $('.page-header-menu .container .hor-menu ul.nav').append(firstOrder);
            };

            that.renderClassTwo = function (obj, index) {//二级导航的渲染， 这是根据加载标签的数据数量，和下级的导航数量进行的适配

                var doubleFlag = false;
                var s1 = '', s2 = '';//s1是二级导航临时存储空间，s2是三级导航临时存储空间；
                var num = 0;

                for (var i = 0, l = obj['menuGroups'].length; i < l; i++) {

                    //for(var j=0,k=obj["menuGroups"][i]["menuItems"].length;j<k;j++){
                    if (obj['menuGroups'][i]['menuItems'].length > 0) {
                        doubleFlag = true;
                    }
                    //}

                }

                if (doubleFlag) {//多列

                    var doubleLie = '';//为多列进行准备的空间;
                    var doubleLieBranch = '';//为每个列中的元素准备的空间
                    s1 = obj['menuGroups'];
                    s1 = s1.sort(yiCommon.sortby('order'));//对二级导航进行排序;

                    num = Math.floor(12 / s1.length);
					
                    for (var i = 0, l = s1.length; i < l; i++) {

                        doubleLieBranch = '<li><h3>' + s1[i]['name'] + '</h3></li>';
                        s2 = s1[i]['menuItems'].sort(yiCommon.sortby('order'));//对第三级导航进行排序;

                        for (var j = 0, k = s2.length; j < k; j++) {//里面执行的是，根据要求对数据进行提取和拼接

                            doubleLieBranch +=
                                '<li><a href="###" class="iconify" url="{0}" domainType="{1}" formId="{2}"><i class="fa fa-angle-right"></i>{3}</a></li>'
                                .format(s2[j].url, s2[j].domainType, s2[j].billFormId, s2[j].name);
                        }

                        doubleLieBranch = '<ul class="mega-menu-submenu">' + doubleLieBranch + '</ul>';
                        doubleLie += '<div class="col-md-' + num + '">' + doubleLieBranch + '</div>';
                    };

                    doubleLie = '<div class="row">' + doubleLie + '</div>';
                    doubleLie = '<div class="mega-menu-content">' + doubleLie + '</div>';
                    doubleLie = '<li>' + doubleLie + '</li>';
                    doubleLie = '<ul class="dropdown-menu">' + doubleLie + '</ul>';
					
                    $('.page-header-menu .container .hor-menu ul.nav>li').eq(index + 1).attr('class', 'menu-dropdown mega-menu-dropdown').append(doubleLie);
					//当超过三列的时候，让菜单占全屏。
					if(num<4){
						$('.page-header-menu .container .hor-menu ul.nav>li').eq(index + 1).addClass('mega-menu-full');
					}
					
					if (s1.length == 2) {
                        $('.page-header-menu .container .hor-menu ul.nav>li:eq(' + (index + 1) + ')>ul').css('min-width', '360px')
                    	
					}
                    else if (s1.length > 2) {
                        $('.page-header-menu .container .hor-menu ul.nav>li:eq(' + (index + 1) + ')>ul').css('min-width', '710px')
                    }
                    
					
                } else {//一列

                    //for(var i=1,l=res.length;i<l;i++){//对于只有一列数据，进行一下操作

                    s1 = obj['menuGroups'];
                    s1 = s1.sort(yiCommon.sortby('order'));//对二级导航进行排序

                    for (var i = 0, l = s1.length; i < l; i++) {
                        s2 += '<li><a href="###" class="iconify"><i class="icon-briefcase"></i> ' + s1[i]['name'] + '</a></li>';
                    }
                    s2 = '<ul class="dropdown-menu">' + s2 + '</ul>';
                    $('.page-header-menu .container .hor-menu ul.nav>li').eq(index + 1).append(s2);
                    //}
                }
            };

            that.dropHideMenu = function () {//通过hover显示隐藏下拉菜单
                $(document).on('mouseover', '.page-header-menu .container .hor-menu ul.nav>li', function () {
                    $(this).addClass("open")
                })
                $(document).on('mouseout', '.page-header-menu .container .hor-menu ul.nav>li', function () {
                    $(this).removeClass('open')
                })
            };
        };

    })();

    $(document).ready(function () {

        new Index_SysMenu().init();
    });

})();