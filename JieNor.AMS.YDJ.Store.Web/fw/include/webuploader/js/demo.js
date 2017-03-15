(function( $ ){
    // 当domReady的时候开始初始化
    $(function() {
        var $wrap = $('#uploader'),

            // 图片容器
            $queue = $( '<ul class="filelist"></ul>' )
                .appendTo( $wrap.find( '.queueList' ) ),

            // 状态栏，包括进度和控制按钮
            $statusBar = $wrap.find( '.statusBar' ),

            // 文件总体选择信息。
            $info = $statusBar.find( '.info' ),
            
            //保存按钮
            $save=$('#save'),

            // 没选择文件之前的内容。
            $placeHolder = $wrap.find( '.placeholder' ),

            $progress = $statusBar.find( '.progress' ).hide(),

            // 添加的文件数量
            fileCount = 0,

            // 添加的文件总大小
            fileSize = 0,

            // 优化retina, 在retina下这个值是2
            ratio = window.devicePixelRatio || 1,
			
            // 缩略图大小
            thumbnailWidth = 110 * ratio,
            thumbnailHeight = 110 * ratio,

            // 可能有pedding, ready, uploading, confirm, done.
            state = 'pedding',

            // 所有文件的进度信息，key为file id
            percentages = {},
            //基类方法
            Base,
            // WebUploader实例
            uploader;
        
        // 实例化
        uploader = WebUploader.create({
        	//初始化，指定上传按钮
            pick: '#filePicker',
            paste: '#uploader',
            dnd:'#uploader',
            //本框架是前端控件，该属性仅提供
            server: '/fw/include/webuploader/server/fileupload.php',
            //可以限定上传文件的格式
            accept: '',
            fileNumLimit: 300,
            fileSizeLimit: 0,
            fileSingleSizeLimit: 512 * 1024 * 1024    // 512 M
            
        });
        //将Base的方法合并。
		Base= WebUploader.Base;
		
        // 添加“添加文件”的按钮，
        uploader.addButton('#filePicker2');
        // 当有文件添加进来时执行，负责view的创建
        function addFile( file ) {
        	
            var $li = $( '<li id="' + file.id + '">' +
                    '<p class="title">' + file.name + '</p>' +
                    '<p class="imgWrap"></p>'+
                    '<p class="progress"><span></span></p>' +
                    '</li>' ),

                $btns = $('<div class="file-panel">' +
                    '<span class="cancel">删除</span>' +
                    '<span class="rotateRight">向右旋转</span>' +
                    '<span class="rotateLeft">向左旋转</span></div>').appendTo( $li ),
                $prgress = $li.find('p.progress span'),
                $wrap = $li.find( 'p.imgWrap' ),
                $info = $('<p class="error"></p>'),

                showError = function( code ) {
                    switch( code ) {
                        case 'exceed_size':
                            text = '文件大小超出';
                            break;

                        default:
                            text = '上传失败，请重试';
                            break;
                    }

                    $info.text( text ).appendTo( $li );
                };

            if ( file.getStatus() === 'invalid' ) {
                showError( file.statusText );
            } else {
                // @todo lazyload
                $wrap.text( '预览中' );
                uploader.makeThumb( file, function( error, src ) {
                    if ( error ) {
                        $wrap.text( '不能预览' );
                        return;
                    }

                    var img = $('<img src="'+src+'">');
                    $wrap.empty().append( img );
                }, thumbnailWidth, thumbnailHeight );

                percentages[ file.id ] = [ file.size, 0 ];
                
                file.ratation = 0;
            }

            file.on('statuschange', function( cur, prev ) {
                if ( prev === 'progress' ) {
                    $prgress.hide().width(0);
                } else if ( prev === 'queued' ) {
                    $li.off( 'mouseenter mouseleave' );
                    $btns.remove();
                }

                // 成功
                if ( cur === 'error' || cur === 'invalid' ) {
                    showError( file.statusText );
                    percentages[ file.id ][ 1 ] = 1;
                } else if ( cur === 'queued' ) {
                    percentages[ file.id ][ 1 ] = 0;
                } else if ( cur === 'progress' ) {
                    $info.remove();
                    $prgress.css('display', 'block');
                }

                $li.removeClass( 'state-' + prev ).addClass( 'state-' + cur );
            });
			// $li是图片的容器，通过移入和移除控制着按键功能的显示和隐藏
            $li.on( 'mouseenter', function() {
                $btns.stop().animate({height: 30});
            });

            $li.on( 'mouseleave', function() {
                $btns.stop().animate({height: 0});
            });
			//按键功能
            $btns.on( 'click', 'span', function() {
                var index = $(this).index(),
                    deg;
				
                switch ( index ) {
                	//从序列中移除文件
                    case 0:
                        uploader.removeFile( file );
                        return;
					//使图片向右旋转90度
                    case 1:
                        file.ratation += 90;
                        break;
					//使图片向左旋转90度
                    case 2:
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
			
            $li.appendTo( $queue );
        }

        // 负责view的销毁
        function removeFile( file ) {
            var $li = $('#'+file.id);

            delete percentages[ file.id ];
            updateTotalProgress();
            $li.off().find('.file-panel').off().end().remove();
        }

        function updateTotalProgress() {
        	
            var loaded = 0,
                total = 0,
                spans = $progress.children(),
                percent;

            $.each( percentages, function( k, v ) {
                total += v[ 0 ];
                loaded += v[ 0 ] * v[ 1 ];
            } );

            percent = total ? loaded / total : 0;

            spans.eq( 0 ).text( Math.round( percent * 100 ) + '%' );
            spans.eq( 1 ).css( 'width', Math.round( percent * 100 ) + '%' );
            updateStatus();
        }
		
		//文件和上传显示结果
        function updateStatus() {
            var text = '', stats;
			
            if ( state === 'ready' ) {
                text = '选中' + fileCount + '张图片，共' +
                        Base.formatSize( fileSize ) + '。';
            } else if ( state === 'confirm' ) {
                stats = uploader.getStats();
                if ( stats.uploadFailNum ) {
                    text = '已成功上传' + stats.successNum+ '张照片至XX相册，'+
                        stats.uploadFailNum + '张照片上传失败，<a class="retry" href="#">重新上传</a>失败图片或<a class="ignore" href="#">忽略</a>'
                }

            } else {
            	
                stats = uploader.getStats();
                text = '共' + fileCount + '张（' +
                        Base.formatSize( fileSize )  +
                        '）';

                if ( stats.uploadFailNum ) {
                    text += '，失败' + stats.uploadFailNum + '张';
                }
            }

            $info.html( text );
        }

        uploader.onUploadBeforeSend = function( file, data ) {
            data.md5 = file.md5 || '';
        };
		//上传过程中触发，携带上传进度。
        uploader.onUploadProgress = function( file, percentage ) {
            var $li = $('#'+file.id),
                $percent = $li.find('.progress span');
			
            $percent.css( 'width', percentage * 100 + '%' );
            percentages[ file.id ][ 1 ] = percentage;
            updateTotalProgress();
        };
        
		//当文件加入序列的时候触发
        uploader.onFileQueued = function( file ) {
        	
            var start = Date.now();

            fileCount++;
            fileSize += file.size;
            if ( fileCount === 1 ) {
                $placeHolder.hide();
                $statusBar.show();
            }
			uploader.md5File( file )
	        // 及时显示进度
	        .progress(function(percentage) {
	            
	        })
	
	        // 完成
	        .then(function(val) {
	        	//val为hash值
	            
	        });

            addFile( file );
            save(file);
            updateTotalProgress();
        };
		//当文件移除序列的时候触发
        uploader.onFileDequeued = function( file ) {
            fileCount--;
            fileSize -= file.size;

            if ( !fileCount ) {
                setState( 'pedding' );
            }

            removeFile( file );
            updateTotalProgress();

        };
		//on还可以用来添加一个特殊事件all, 这样所有的事件触发都会响应到。同时此类callback中的arguments有一个不同处， 
		//就是第一个参数为type，记录当前是什么事件在触发。此类callback的优先级比脚低，会再正常callback执行完后触发。
        uploader.on( 'all', function( type ) {
        	
            var stats;
            switch( type ) {
                case 'uploadFinished':
                    setState( 'confirm' );
                    break;

                case 'startUpload':
                    setState( 'uploading' );
                    break;

                case 'stopUpload':
                    setState( 'paused' );
                    break;

            }
        });
		//检测到
        uploader.onError = function( code ) {
            alert( 'Eroor: ' + code );
        };

        uploader.onUploadChunkcontinue = function( file, ret ) {
            if ( ret.exist ) {
                var $li = $( '#'+file.id );

                $li.append( '<p class="log">跳过' + uploader.formatSize( file.size - file.loaded ) + '</p>' );
                return false;
            }
        };
        
        //附件保存
        function save(file){
        	
        	var billData=[],
				data={};
				
				data.id=file.id;
				data.fname=file.name;
				data.ftype=file.type;
				data.ffilesize=file.size;
				
			billData.push(data);
            data={};
        	
        	$save.on('click',function(){
							
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
        };
		//重试上传，重试指定文件，或者从出错的文件开始重新上传。
        $info.on( 'click', '.retry', function() {
            uploader.retry();
        } );
		//点击文件上传失败后出现的忽略按钮。
        $info.on( 'click', '.ignore', function() {
            alert( 'todo' );
        } );

        updateTotalProgress();
    });

})( jQuery );