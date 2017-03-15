--add by linus. at 2017/01/03
--添加系统参数预置脚本，前100个内码系统完全占用。
delete from t_sys_systemprofile where fid >='1001' and fid<='1100';
insert into t_sys_systemprofile(fid,FFormId,fcategory,fkey,fvalue,fdesc) values('1001','sys_systemprofile','fw','redis.host','www.jienor.com:6379',N'Redis缓存实例');
insert into t_sys_systemprofile(fid,FFormId,fcategory,fkey,fvalue,fdesc) values('1002','sys_systemprofile','fw','rabbitmq.host','www.jienor.com',N'RabbitMQ消息队列实例');
insert into t_sys_systemprofile(fid,FFormId,fcategory,fkey,fvalue,fdesc) values('1003','sys_systemprofile','fw','rabbitmq.username','jienor',N'RabbitMQ消息队列用户名');
insert into t_sys_systemprofile(fid,FFormId,fcategory,fkey,fvalue,fdesc) values('1004','sys_systemprofile','fw','rabbitmq.password','jienor.com',N'RabbitMQ消息队列密码');
insert into t_sys_systemprofile(fid,FFormId,fcategory,fkey,fvalue,fdesc) values('1005','sys_systemprofile','fw','mail.pop3','pop.exmail.qq.com',N'系统邮箱收信服务器');
insert into t_sys_systemprofile(fid,FFormId,fcategory,fkey,fvalue,fdesc) values('1006','sys_systemprofile','fw','mail.smtp','smtp.exmail.qq.com',N'系统邮箱发信服务器');
insert into t_sys_systemprofile(fid,FFormId,fcategory,fkey,fvalue,fdesc) values('1007','sys_systemprofile','fw','mail.username','register@jienor.com',N'系统邮箱用户名');
insert into t_sys_systemprofile(fid,FFormId,fcategory,fkey,fvalue,fdesc) values('1008','sys_systemprofile','fw','mail.password','Jn@12345',N'系统邮箱用户密码');

insert into t_sys_systemprofile(fid,FFormId,fcategory,fkey,fvalue,fdesc) values('1011','sys_systemprofile','fw','ms.authcode','d2FuZ2xpbg==',N'网关服务验证码');
