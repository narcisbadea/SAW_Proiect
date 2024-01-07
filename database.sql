create database if not exists magazin_saw
 default character set utf8 
 default collate utf8_general_ci;

use magazin_saw;

-- -------------------------------------------------------------------

drop table if exists telefoane;
create table telefoane(
 id bigint auto_increment primary key,
 producator varchar(20) not null default 'fara_producator',
 model varchar(20) not null default 'fara_model',
 pret int not null default '0',
 creation_date timestamp not null default current_timestamp
);

insert into telefoane (producator, model, pret) values
('samsung','note 10',4000),
('huawei','P40 pro',5000),
('xiaomi','Note 9 Pro',1000);

-- -------------------------------------------------------------------
