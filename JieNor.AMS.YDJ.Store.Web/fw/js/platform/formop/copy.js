; (function () {
    var Copy = (function () {
        return function (args) {

            if (!args.pkids || args.pkids.length <= 0) {
                yiDialog.a('请选择一行数据！');
                return;
            }

            if (args.pkids.length > 1) {
                yiDialog.a('只允许选择一行数据！');
                return;
            }

        };
    })();
    window.Copy = window.Copy || Copy;
})();