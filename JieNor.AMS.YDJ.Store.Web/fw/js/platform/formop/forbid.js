; (function () {
    var Forbid = (function () {
        return function (args) {

            if (!args.pkids || args.pkids.length <= 0) {
                yiDialog.a('请选择一行或多行数据！');
                return;
            }


        };
    })();
    window.Forbid = window.Forbid || Forbid;
})();