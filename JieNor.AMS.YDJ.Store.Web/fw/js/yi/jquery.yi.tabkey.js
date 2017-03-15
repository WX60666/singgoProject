$(document).ready(function () {
    //获取所有的可见的 input
    var $inputs = $('input:visible'), beginIndex = 9900;
    //给每个 input 都设置 tabIndex 属性值
    $inputs.each(function () {
        if ($(this).attr('tabIndex') === undefined) {
            $(this).attr('tabIndex', beginIndex);
            beginIndex += 1;
        }
    });
    //将所有的 input 按照设置好的 tabIndex 顺序排序
    $inputs.sort(function (a, b) {
        var aIndex = Number($(a).attr('tabIndex'));
        var bIndex = Number($(b).attr('tabIndex'));
        return aIndex > bIndex;
    });
    //给每个 input 都绑定 keydown 事件
    $inputs.each(function (index) {
        //即使出现异常，也不要影响其他功能的正常使用
        try {
            var tabIndex = $(this).attr('tabIndex');
            if (tabIndex === undefined) {
                $(this).attr('tabIndex', index);
            }
            //绑定 keydown 事件
            $(this).on('keydown', function (e) {
                //如果当前按下是 tab 键
                if (e.which === 9) {
                    //则将当前焦点移到下一个 input 上面
                    $inputs.eq($(this).attr('tabIndex') + 1).focus();
                }
                //不影响其他功能
                return true;
            });
            //不影响其他功能
            return true;
        } catch (e) {
            //不影响其他功能
            return true;
        }
    });
});