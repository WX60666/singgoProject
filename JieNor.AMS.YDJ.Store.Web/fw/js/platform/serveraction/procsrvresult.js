//此函数主要负责处理服务端通用返回对象m.data.operationResult
//遇到htmlaction，分别将数据传入对应的serveraction目录下的js文件中处理
//此文件的处理过程，将由yiajax.p的success返回函数统一处理
//针对页面相关的数据m.data.operationResult.SrvData通过获得页面实例类，交由页面实例的processSrvData方法处理。

; (function () {
    var ProcSrvResult = (function () {
        return function () {

            //统一的公开处理方法
            this.proc = function (response, extra) {

                //如果操作结果不存在，则无需处理
                if (!response || !response.operationResult) { return; }

                procAction(response, extra);

                procMessage(response.operationResult);
            };

            //处理前端操作指令：result.htmlActions
            function procAction(response, extra) {

                //操作结果，指令代码，指令数据，js文件路径
                var result = response.operationResult, actionId, actionParams, acfile;

                if (result.htmlActions && result.htmlActions.length > 0) {

                    //循环处理各个操作指令
                    for (var i = 0; i < result.htmlActions.length; i++) {

                        actionId = result.htmlActions[i].actionId;

                        //如果指令代码不存在，则无需处理
                        if (!actionId) { continue }

                        //为了与各个 js 操作类的类名一致，actionId 首字母大写，其他小写
                        actionId = actionId.toLowerCase().replace(/(\w)/, function (v) { return v.toUpperCase() });

                        actionParams = result.htmlActions[i].actionParams;

                        //创建操作实例并执行操作
                        acfile = '/fw/js/platform/serveraction/{0}.js'.format(actionId);
                        yiCacheScript.g(acfile, function () {
                            return new window[actionId](response, actionParams, extra);
                        });
                    }
                }
            }

            //处理服务端返回的消息：result.simpleMessage 和 result.complexMessage
            function procMessage(result) {
                
                if (result.isShowMessage) {

                    //消息汇总，简单交互信息，复杂消息
                    var message = '', sm = result.simpleMessage, cm = result.complexMessage;
                    
                    if (sm) {
                        message += '<div>{0}</div></br>'.format(sm);
                    }

                    if (cm) {

                        //成功消息
                        if (cm.successMessages && cm.successMessages.length > 0) {
                            message += '<div>{0}</div></br>'.format(cm.successMessages.join(''));
                        }

                        //错误消息
                        if (cm.errorMessages && cm.errorMessages.length > 0) {
                            message += '<div>{0}</div></br>'.format(cm.errorMessages.join(''));
                        }

                        //警告消息
                        if (cm.warningMessages && cm.warningMessages.length > 0) {
                            message += '<div>{0}</div></br>'.format(cm.warningMessages.join(''));
                        }
                    }

                    //如果消息汇总不为空，则说明有消息，那么需要弹窗提示消息
                    if (message) {

                        //弹窗提示消息
                        yiDialog.a(message, null, '系统提示', 'large');
                    }
                }
            }
        };
    })();
    window.ProcSrvResult = window.ProcSrvResult || new ProcSrvResult();
})();