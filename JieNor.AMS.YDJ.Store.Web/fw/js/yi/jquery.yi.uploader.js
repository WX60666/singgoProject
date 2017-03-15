/*
    1.插件用途：用于基础资料控件文件上传
    
    2.使用方法：$(selector).uploader();
*/

; (function ($, window, document, undefined) {
    //默认参数
    var defaults = {
        //初始化，指定上传按钮
        pick: '',
        //本框架是前端控件，该属性仅提供
        server: '../upload/sys_mainfw?format=json',
        //可以限定上传文件的格式
        accept: null,
        //限制文件的数量  产品需要，在选取的时候就自动上传，所以只能限制一个
        //fileNumLimit: 1,
        fileSizeLimit: 0,
        fileSingleSizeLimit: 512 * 1024 * 1024,    // 512 M
        compress: null

    }
    //插件代码
    $.fn.uploader = function (options) {

        //遍历当前所选择的 Dom 元素，并提供链式操作
        return this.each(function () {
			
            //合并默认参数，但是不影响默认参数（保护好默认参数）
            var settings = $.extend({}, defaults, options),
           	//每次在队列中的文件只有一个
				numList = 0,
			//在一个控件实现多个文件同时上传的时候的标志
				numstart=0,
			//在一个控件实现多个文件同时上传的时候，只需要初始化一次第二个上传按钮
				buttonTwoStart=0,
				billData=[],
				timer,    //延时事件
            //当前文本框控件（后续所有操作都是围绕这个文本框控件展开的）
            	$inputFile = $(this),
            	//该文件上传的最外层容器
            	$par = $inputFile.parents('.uploader-style').parent().parent(),
            	//该文件上传的次外层容器
            	$parChild=$inputFile.parent().parent(),
            	//文件的信息显示位置
            	$info = $('#'+settings.pageId).find('.statusBar .info'),
            	//总文件的信息
            	numMes={fileCount:0, fileSize:0,numSave:[]},
            	//基类方法
            	Base,
            	uploader,
            	//$queue=$inputFile.parent().parent().prev();
            	//文件上传后缩略图的位置
            	$queue = $('<ul class="filelist clearfix"></ul>').prependTo($inputFile.parent().parent());
				
			//将Base的方法合并。
			Base= WebUploader.Base;
			//因为文件上传的id标识只能有一个，而在系统中，一个页面被重复使用，所以必须把id变成不固定，这样就不会让文件上传功能冲突
			$inputFile.attr('id',$inputFile.attr('id')+parseInt(Math.random()*10000));
            //文件上传的id
            settings.pick = '#' + $inputFile.attr('id');
            //文件上传组件初始化
            uploader = WebUploader.create(settings);
            
            //如果是多个文件上传，就在上传按钮的上层二级父节点加上mul-type的class名。
            //如果是一个文件，就不加
			settings.mulType=$parChild.hasClass('mul-type');
			//settings.mulType为true 该控件实现多个文件上传功能，否则实现单个文件上传功能
			if(settings.mulType){
				
				numstart=1;
				//启用多个文件同时上传的按钮
				$('#'+settings.pageId).find('#save').on('click',function(){
					uploader.upload();
					//将对象转为字符串的形式
					billdataStr=JSON.stringify(billData);
							
					params={billdata:billdataStr};
						
		            yiAjax.p('/bill/sys_attachment?operationno=save', params,
		            	
		                function () {
		                    //执行回调函数
		                    yiDialog.m('提交成功！', 'success');
		                },
		                function (m) {
		                    //提示错误信息
		                    yiDialog.m('显示页面出错！');
		                }
		           );
		       });
			}
            //附件保存
	        function save(file,type){
	        	
				switch (type) {
		                //从序列中移除文件
		                case 'add':
		                
		                	var	data={};
					
								data.id=file.id;
								data.fname=file.name;
								data.ftype=file.type;
								data.ffilesize=file.size;
								
							billData.push(data);
				            data={};
		                	break;
		                case 'delete':
		                    //点击图片上的回收按钮
		                    for(var i=0,l=billData.length;i<l;i++){
		                    	//因为在显示的时候，如果大小和名字都一样，基本就可以确定是同一个文件了
		                        if (billData[i].fname == file.name && billData[i].ffilesize == file.size) {
                                    //把已经加入到上传空间的文件数据给删除
		                    		billData.splice(i,1);
		                    		
		                    	}
		                    }
		                    break;
		            }
	        	 //billData=[],
				
	        };
            
            //在文件加入队列前触发的事件
            uploader.on('beforeFileQueued', function (file) {
            	
                //  1、选择完文件，自动上传，上传前请使用/dynamic/sys_mainfw?operationno=uploadfile 
                //post体，提供{simpledata:{filehash:343432020-2-4949ddldkkksslslsls}}，返回值为true表示，
                //文件已存在，然后你客户端提示文件上传完成，并且将返回值的srvdata.fileid，记录下来，未来用于打包。
                //文件传输地址
                var url = '/dynamic/sys_mainfw?operationno=isfileexist',
                	hash,//hash值
	        		post;
	        	
	        	//如果是多个选择
	        	if(settings.mulType){
	        		var flag=true;
	        		
	        		for(var i=0,l=numMes.numSave.length;i<numMes.numSave.length;i++){
		        		if(numMes.numSave[i].size==file.size&&numMes.numSave[i].name==file.name){
		        			//如果加入队列的是同一个文件，则标注是同一文件，即将flag变成false。
		        			flag=false;
		        		}
	        		}
                    //如果是同一文件，就不进入序列。
	        		if(flag){
	        			save(file,'add');
		        		numMes.numSave[numMes.fileCount]=file;
		        		numMes.fileCount++;
		        		numMes.fileSize += file.size;
	        		}
	        		
	        		//显示当前队列中的文件数据
	        		updateStatus(numMes);
	        		// 添加“添加文件”的按钮，
	        		if(buttonTwoStart==0){
	        			uploader.addButton('#'+settings.pageId+' #filePicker2');
	        			buttonTwoStart=1;
	        		}
	        		queueIsNull(numMes.fileCount);
	        	}
	        	//如果是单个选择
	        	else{
	        		
	                //保证在session中 webuploader的图片队列只有一个
	                if (numList == 1) {
	                    uploader.removeFile(fileLast[0]);
	                    $queue.empty();
	                    numList = 0;
	                }
	                fileLast = { 0: file };
	
	                numList++;
	                //因为在选择多个文件后上传，必须要经过多次的beforeFileQueued事件，
	                //而暂时来说这个公司营业执照只有一个，所以必须考虑到用户不小心选多个照片，
	                //为此，设定了一个延时事件，在进行多个文件上传的时候，只处理最后一个，即把最后一个文件按规定传给后台。
	                clearTimeout(timer);
	                timer = setTimeout(function () {
	                    //获取文件的hash值
	                    uploader.md5File(file)
				        // 完成
				        .then(function (val) {
				            //val为hash值
				            hash = val;
				            post = { simpledata: { filehash: val } };
				            
				            yiAjax.p(url, post,
			                    function (r) {
			                    	
			                        //返回值成功，文件已存在，你客户端提示文件上传完成，并且将返回值的srvdata.fileid，记录下来，未来用于打包。
			                        if (r.operationResult.srvData.fileId != '') {
			                        	
			                        	//为了让结构整齐，将获取的fileId元素放在div.placeholder元素上
			                        	$par.find('div.placeholder').attr('fileId', r.operationResult.srvData.fileId);
			                            
	                                    //标注文件上传成功  后台已经有的图片
			                            $par.find('div.placeholder span').attr('class','help-block success').text('文件上传成功');
			                        }
			                        else {
			                        	//如果后台没有上传的文件,就进行文件上传
			                        	uploader.upload();
			                        }
			                    },
			                    null, null, null
			                );
				        });
	                    //return false;
	                }, 100)
	            }
            })

            //当文件成功加入到序列中的时候
            uploader.onFileQueued = function (file) {
            	//启用一个控件实现多个文件上传 numstart=1；
            	
                addFile(file, $queue,$par,numstart,numMes);
                //上传进度
                //updateTotalProgress();
            };
            
            //在文件上传成功后触发的事件
            uploader.onUploadSuccess = function( file, response ) {
            	
            	var res=JSON.parse(response._raw);
                //标注文件上传成功，并且将后台返回的fileId绑定在div.placeholder元素上
                $par.find('div.placeholder').attr('fileId', res.fileId);
                //在提示语句上标注文件上传成功
                $par.find('div.placeholder span').attr('class','help-block success').text('上传图片成功');
	        };
	       //在文件上传失败后触发的事件
	        uploader.onUploadError = function(code) {
            	console.log(code);
	        };
            
            //当检测到功能出错的时候，触发该事件
            uploader.onError = function (code) {
            	
                // 当上传的图片超过一个以上就报出Q_EXCEED_NUM_LIMIT
               // console.log(code);
                //yiDialog.a('一次只能选一个，并且不是相同的一个', null, '系统提示', 'large');
            };
			
			//序列的文件是否为空时出现的状态
			function queueIsNull(num){
				//序列中有文件就显示第二个上传按钮
				if(num>0){
					$('#'+settings.pageId).find('.placeholder').hide();
	    			$('#'+settings.pageId).find('.statusBar').show();
	    			
	    			
				}else{//否则就只显示第一个按钮
					$('#'+settings.pageId).find('.placeholder').show();
	    			$('#'+settings.pageId).find('.statusBar').hide();
				}
    			
			}
			 
			//文件显示结果
		    function updateStatus(numMes){
		    	var text = '选中' + numMes.fileCount + '张图片，共' +
		            Base.formatSize( numMes.fileSize ) + '。';
		        if(numMes.fileCount==0){
		        	$('#'+settings.pageId).find('.placeholder').show();
	        		$('#'+settings.pageId).find('.statusBar').hide()
		        	text='';
		        }
				$info.text(text);
		    }
       
		    function addFile(file, thumer,$par,numstart,numMes) {
		        var $li = $('<li id="' + file.id + '">' +
			            '<p class="imgWrap"></p>' +
			            '<p class="progress"><span></span></p>' +
			            '</li>'),
		
			        $btns = $('<div class="file-panel">' +
			        	'<p class="title">' + file.name + '</p>' +
			            '<span class="cancel">删除</span>' +
			            '<span class="rotateRight">向右旋转</span>' +
			            '<span class="rotateLeft">向左旋转</span></div>').appendTo($li),
			        $prgress = $li.find('p.progress span'),
			        $wrap = $li.find('p.imgWrap'),
			        $info = $('<p class="error"></p>');
		        if (file.getStatus() === 'invalid') {
		            //文件出错
		        } else {
		            // @todo lazyload
		            $wrap.text('预览中');
		            uploader.makeThumb(file, function (error, src) {
		                if (error) {
		                    $wrap.text('不能预览');
		                    return;
		                }
		
		                var img = $('<img src="' + src + '">');
		                $wrap.empty().append(img);
		            }, 150, 150);//设置图片的宽和高
		
		
		            file.ratation = 0;
		        }
		
		        // $li是图片的容器，通过移入和移除控制着按键功能的显示和隐藏
		        $li.on('mouseenter', function () {
		            $btns.stop().animate({ height: 30 });
		        });
		
		        $li.on('mouseleave', function () {
		            $btns.stop().animate({ height: 0 });
		        });
		        //按键功能
		        $btns.on('click', 'span', function () {
		            var index = $(this).index(),
			            deg;
		
		            switch (index) {
		                //从序列中移除文件
		                case 1:
		                	if(numstart==1){//控件实现多个文件上传
		                		$(this).parents('li').remove();
		                		numMes.fileCount--;
			        			numMes.fileSize -= file.size;
			        			
			        			save(file,'delete');
			        			//显示当前文件的数据
			        		 	updateStatus(numMes)
			        		 	
			        		 	queueIsNull(numMes.fileCount);
		                	}else{//控件实现一个文件上传
		                		//在显示队列中将文件清除
			                    thumer.empty();
			                    //把原来已经在队列中的fileid删除
			                    $par.find('.queueList>.placeholder').attr('fileid','');
			                    //标注文件上传不成功
			                    $par.find('.placeholder span').attr('class', 'help-block error').text('上传营业执照');
		                	}
		                	//在后台中将文件清除
			                uploader.removeFile(file);
			                //文件显示结果
			               
		                    return;
		
		                    //使图片向右旋转90度
		                case 2:
		                    file.ratation += 90;
		                    break;
		                    //使图片向左旋转90度
		                case 3:
		                    file.ratation -= 90;
		                    break;
		            }
		
		            // -webkit-transform: rotate(90deg);
		            index && (deg = 'rotate(' + file.ratation + 'deg)', $wrap.css({
		                '-webkit-transform': deg,
		                '-mos-transform': deg,
		                '-o-transform': deg,
		                'transform': deg
		            }));
		        });
		
		        $li.appendTo(thumer);
		    }
	 	});
    };
    $(document).ready(function () {
        
        //$('div.uploader-file').uploader();

    });

})(jQuery, window, document);

