--菜单预置脚本 linus.
--业务模块
delete from t_sys_bizmodule where fmoduleid in ('A283A211-5005-4F14-9C33-D2B7F606A80F',
												'7B1A3C47-B968-4D40-A927-B31D98FB7D0D',
												'73DDCA00-B0EA-4112-A995-DC5C85396F8E',
												'1FF7333D-5202-4087-A594-D5F8C5F6B036');
insert into t_sys_bizmodule(fmoduleid,fformid,fname,ficon,forder) values('A283A211-5005-4F14-9C33-D2B7F606A80F','sys_bizmodule','系统管理','',10);
insert into t_sys_bizmodule(fmoduleid,fformid,fname,ficon,forder) values('7B1A3C47-B968-4D40-A927-B31D98FB7D0D','sys_bizmodule','销售管理','',20);
insert into t_sys_bizmodule(fmoduleid,fformid,fname,ficon,forder) values('73DDCA00-B0EA-4112-A995-DC5C85396F8E','sys_bizmodule','采购管理','',30);
insert into t_sys_bizmodule(fmoduleid,fformid,fname,ficon,forder) values('1FF7333D-5202-4087-A594-D5F8C5F6B036','sys_bizmodule','库存管理','',40);

select * from t_sys_menugroup order by fmoduleid,forder

--系统管理
delete from t_sys_menugroup where fgroupid in ('C59BE2ED-A29E-48BB-A09F-DBB57B593B5C',
											   '06B4C3E6-550A-494B-81ED-86FB09A6F2B4',
											   '17CCE809-0AEC-4CED-83E1-02B8C0926DB8',
											   '15A52316-E773-4473-946E-924D218F021D');
insert into t_sys_menugroup(fgroupid,fformid,fname,ficon,fmoduleid,forder) values('C59BE2ED-A29E-48BB-A09F-DBB57B593B5C','sys_menugroup','用户权限','','A283A211-5005-4F14-9C33-D2B7F606A80F',10);
insert into t_sys_menugroup(fgroupid,fformid,fname,ficon,fmoduleid,forder) values('06B4C3E6-550A-494B-81ED-86FB09A6F2B4','sys_menugroup','系统参数','','A283A211-5005-4F14-9C33-D2B7F606A80F',20);
insert into t_sys_menugroup(fgroupid,fformid,fname,ficon,fmoduleid,forder) values('17CCE809-0AEC-4CED-83E1-02B8C0926DB8','sys_menugroup','审计日志','','A283A211-5005-4F14-9C33-D2B7F606A80F',30);
insert into t_sys_menugroup(fgroupid,fformid,fname,ficon,fmoduleid,forder) values('15A52316-E773-4473-946E-924D218F021D','sys_menugroup','缓存管理','','A283A211-5005-4F14-9C33-D2B7F606A80F',40);

--销售管理
delete from t_sys_menugroup where fgroupid in ('5A5DD595-D161-4DAD-AE64-A78626ADC328',
											   '150D799D-1555-43E6-80ED-AD89D5655F29',
											   'DED6190D-2A3B-44B6-BCA9-DF460C7A1B64',
											   '494D01EB-7A6E-416C-B4A9-96D354156189');
insert into t_sys_menugroup(fgroupid,fformid,fname,ficon,fmoduleid,forder) values('5A5DD595-D161-4DAD-AE64-A78626ADC328','sys_menugroup','销售业务','','7B1A3C47-B968-4D40-A927-B31D98FB7D0D',10);
insert into t_sys_menugroup(fgroupid,fformid,fname,ficon,fmoduleid,forder) values('150D799D-1555-43E6-80ED-AD89D5655F29','sys_menugroup','基础数据','','7B1A3C47-B968-4D40-A927-B31D98FB7D0D',20);
insert into t_sys_menugroup(fgroupid,fformid,fname,ficon,fmoduleid,forder) values('DED6190D-2A3B-44B6-BCA9-DF460C7A1B64','sys_menugroup','报表分析','','7B1A3C47-B968-4D40-A927-B31D98FB7D0D',30);
insert into t_sys_menugroup(fgroupid,fformid,fname,ficon,fmoduleid,forder) values('494D01EB-7A6E-416C-B4A9-96D354156189','sys_menugroup','其他功能','','7B1A3C47-B968-4D40-A927-B31D98FB7D0D',40);

--采购管理
delete from t_sys_menugroup where fgroupid in ('FC22A2CF-A9D6-4C45-A9C1-AA256CC7B228',
											   '74681E83-B8F4-42A8-9C96-6196A4EF4D82',
											   '7C7B49B7-5F53-435C-88C4-9E34B5CED296',
											   '59B28BB2-ED1E-4043-BCF9-BDBFBF13DD82');
insert into t_sys_menugroup(fgroupid,fformid,fname,ficon,fmoduleid,forder) values('FC22A2CF-A9D6-4C45-A9C1-AA256CC7B228','sys_menugroup','采购业务','','73DDCA00-B0EA-4112-A995-DC5C85396F8E',10);
insert into t_sys_menugroup(fgroupid,fformid,fname,ficon,fmoduleid,forder) values('74681E83-B8F4-42A8-9C96-6196A4EF4D82','sys_menugroup','基础数据','','73DDCA00-B0EA-4112-A995-DC5C85396F8E',20);
insert into t_sys_menugroup(fgroupid,fformid,fname,ficon,fmoduleid,forder) values('7C7B49B7-5F53-435C-88C4-9E34B5CED296','sys_menugroup','报表分析','','73DDCA00-B0EA-4112-A995-DC5C85396F8E',30);
insert into t_sys_menugroup(fgroupid,fformid,fname,ficon,fmoduleid,forder) values('59B28BB2-ED1E-4043-BCF9-BDBFBF13DD82','sys_menugroup','其他功能','','73DDCA00-B0EA-4112-A995-DC5C85396F8E',40);

--库存管理
delete from t_sys_menugroup where fgroupid in ('5908BE0D-9261-4380-9FC4-A7078AA44769',
											   '6355D907-842C-4F18-9F3A-F768950B652E',
											   '819D3AFF-F0C1-458D-A4F0-C788BD448829',
											   'FCA31BA4-E28B-4B22-ACCC-6F89DE7C1E74');
insert into t_sys_menugroup(fgroupid,fformid,fname,ficon,fmoduleid,forder) values('5908BE0D-9261-4380-9FC4-A7078AA44769','sys_menugroup','库存业务','','1FF7333D-5202-4087-A594-D5F8C5F6B036',10);
insert into t_sys_menugroup(fgroupid,fformid,fname,ficon,fmoduleid,forder) values('6355D907-842C-4F18-9F3A-F768950B652E','sys_menugroup','基础数据','','1FF7333D-5202-4087-A594-D5F8C5F6B036',20);
insert into t_sys_menugroup(fgroupid,fformid,fname,ficon,fmoduleid,forder) values('819D3AFF-F0C1-458D-A4F0-C788BD448829','sys_menugroup','报表分析','','1FF7333D-5202-4087-A594-D5F8C5F6B036',30);
insert into t_sys_menugroup(fgroupid,fformid,fname,ficon,fmoduleid,forder) values('FCA31BA4-E28B-4B22-ACCC-6F89DE7C1E74','sys_menugroup','其他功能','','1FF7333D-5202-4087-A594-D5F8C5F6B036',40);

--用户权限功能
delete from t_sys_menuitem where fmenuid in ('sec_userlist',
											   'sec_rolelist',
											   'sec_permitem',
											   'EDF0112F-617D-4BCA-9F3A-10C37644AFBA');
insert into t_sys_menuitem(fmenuid,FFormId,fname,ficon,furl,fgroupid,fhelpcode,forder) values('sec_userlist','sys_menuitem','用户列表','','/views/list.html?formid=sec_user','C59BE2ED-A29E-48BB-A09F-DBB57B593B5C','yhlb','10');
insert into t_sys_menuitem(fmenuid,FFormId,fname,ficon,furl,fgroupid,fhelpcode,forder) values('sec_rolelist','sys_menuitem','角色列表','','/views/list.html?formid=sec_role','C59BE2ED-A29E-48BB-A09F-DBB57B593B5C','jslb','20');
insert into t_sys_menuitem(fmenuid,FFormId,fname,ficon,furl,fgroupid,fhelpcode,forder) values('sec_permitem','sys_menuitem','权限项列表','','/views/list.html?formid=sec_permitem','C59BE2ED-A29E-48BB-A09F-DBB57B593B5C','qxxlb','30');
insert into t_sys_menuitem(fmenuid,FFormId,fname,ficon,furl,fgroupid,fhelpcode,forder) values('EDF0112F-617D-4BCA-9F3A-10C37644AFBA','sys_menuitem','角色授权','','/views/sys/sec_assignright.html','C59BE2ED-A29E-48BB-A09F-DBB57B593B5C','jssq','40');

