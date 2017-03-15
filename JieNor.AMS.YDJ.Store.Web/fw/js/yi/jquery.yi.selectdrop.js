/*
    1.插件用途：用于表头下拉框查询
    
    2.使用方法：$(selector).selectdrop();
*/

; (function ($, window, document, undefined) {
	//默认参数
    var defaults = { domainType: '', formId: '', pageId: '' };
	
    //插件代码
    $.fn.selectdrop = function (options) {

        //遍历当前所选择的 Dom 元素，并提供链式操作
        return this.each(function () {
			//合并默认参数，但是不影响默认参数（保护好默认参数）
            var settings = $.extend({}, defaults, options),
            //获取当前的select元素
        		$selectThis=$(this),
        	//获取状态$('select[data]')
        		status=$selectThis.attr('data'),
        	//获取fieldkey
        		key=$selectThis.attr('name'),
        	//地址拼接
        		url = '/{0}/{1}?operationno=querycombo'.format(settings.domainType, settings.formId),
        		//获得的参数以simpledata形式，post传向后台。
				param={
					simpledata:{
						fieldkey:key
					}
				};
				
			//数据请求
        	yiAjax.p(url, param,
	            function (r) {
	            	
					//通过返回的数据进行数据渲染
					dataDrop($selectThis,r)
					
	            }, null, null, null
	        );
	        
	        //为下拉框绑定事件
	        $selectThis.on('change',function(){
	        	// $(this).val() 当前选中的id值
	        	// $(this).find('option:selected').text() 当前选中的name值
	        })
			
        });
    };
    
    function dataDrop($select,r){
    	var srvRes=r.operationResult.srvData,
    		dataSave='';//下拉数据储存空间
    	
    	if(srvRes.data||srvRes.data.length>0){
    		
    		for(var i=0,l=srvRes.data.length;i<l;i++){
    			//构建选择数据option
    			dataSave += '<option '+(srvRes.data[i].disable==undefined?'':'disabled')+' value="{0}">{1}</option>'.format(srvRes.data[i].id,srvRes.data[i].name);
    		}
    	}
    	//如果没有数据
    	else{
    		dataSave+='<option value="">无相关数据</option>'
    	}
    	
        //后台数据显示
    	$select.append(dataSave)
    	//后台选择显示
    	.select2('val', $.trim($select.attr('renid')));
    	
    }
    
	
    $(document).ready(function () {
		
		var $select=$('select[data]',this.pageSelector);
    	//如果有data这个属性的select元素和功能,就进行数据渲染
        if($.isFunction($select.selectdrop)){
        	//$select.selectdrop();
        }

    });

})(jQuery, window, document);

