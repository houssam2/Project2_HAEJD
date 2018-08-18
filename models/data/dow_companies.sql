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
select * from goldmansachs
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

create table companies as 
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
select * from goldmansachs
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

select * from companies


