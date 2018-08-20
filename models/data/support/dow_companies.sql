DROP DATABASE IF EXISTS stocks_db;
-- Creates the "blogger" database --
CREATE DATABASE stocks_db;

use stocks_db;
select * from americanexpress
UNION
select * from apple
UNION
select * from boeing
UNION
select * from caterpillar
UNION
select * from chevron
UNION
select * from cisco
UNION
select * from cocacola
UNION
select * from dowdupont
UNION
select * from pg
UNION
select * from homedepot
UNION
select * from ibm
UNION
select * from intel
UNION
select * from jnj
UNION
select * from jpm
UNION
select * from mcd
UNION
select * from mmm
UNION
select * from mrk
UNION
select * from msft
UNION
select * from pfe
UNION
select * from xom;

create table companys as 
select * from (
select * from americanexpress
UNION
select * from apple
UNION
select * from boeing
UNION
select * from caterpillar
UNION
select * from chevron
UNION
select * from cisco
UNION
select * from cocacola
UNION
select * from dowdupont
UNION
select * from pg
UNION
select * from homedepot
UNION
select * from ibm
UNION
select * from intel
UNION
select * from jnj
UNION
select * from jpm
UNION
select * from mcd
UNION
select * from mmm
UNION
select * from mrk
UNION
select * from msft
UNION
select * from pfe
UNION
select * from xom
)comp;

select * from companys where company ="Amex" and date = "8/3/2018";

ALTER TABLE companys add COLUMN Date_transformed date;

UPDATE companys
SET date_transformed = STR_TO_DATE(Date,"%m/%d/%Y");

select company, min(date_transformed) from companys group by company; 
-- all have a start date of Aug 3 1998

select * from companys where company = "Amex"  and id=5044;

select * from companys where id=5045;

Alter table companys add column Day int;

update companys set Day = null  where company = "Amex";

alter table companys drop column company_id;
alter table companys add column id int unsigned primary KEY AUTO_INCREMENT;

CREATE TABLE users (
    id INT(11) AUTO_INCREMENT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    
    PRIMARY KEY (id)
);

select * from users;

CREATE TABLE portfolios (
	id INT(11) AUTO_INCREMENT NOT NULL,
   user_id INT(11),
   company_id INT,
   stock_quantity INT(11),
   buy_price DECIMAL(10,2),
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id),
     FOREIGN KEY (company_id) REFERENCES companys(id)
);

create table companys_2 as select * from companys;

select * from companys_2 ;

alter table companys_2 drop column Volume;

alter table companys_2 change column `Adj Close` Close float;

alter table companys_2 change column `Date_transformed` Date date