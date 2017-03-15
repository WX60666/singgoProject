/*本脚本主要用于添加框架非业务的表结构
**init by linus. at 2016-10-29
*/

--业务机构定义：目的是一个业务机构相当于一个独立数据库，未来站点上线后，用户切换不同机构时，对应的服务端处理的db连接切换要根据这里的配置来
if not exists (select 1 from sysobjects where name = 't_sys_bizorganization' and xtype='u')
	create table t_sys_bizorganization(
		fid varchar(36) not null,
		fnumber nvarchar(30) not null default '',
		fname nvarchar(50) not null default '',
		furl nvarchar(255) not null default '',
		fapiurl nvarchar(255) not null default '',		--相对furl的路径
		fdbhost nvarchar(36) not null default '',
		fdbuser nvarchar(30) not null default '',
		fdbpassword nvarchar(50) not null default '');