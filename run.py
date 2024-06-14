import os
import os.path
import sys
import requests
import json
import re	
from flask import Flask, render_template, render_template_string, request, redirect, url_for, flash, make_response, jsonify, send_from_directory, send_file
from flask_cors import CORS, cross_origin
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, jwt_required, JWTManager, set_access_cookies, set_refresh_cookies

import psycopg2
from psycopg2 import sql
from psycopg2.extras import NamedTupleCursor
from psycopg2.extras import RealDictCursor


app = Flask(__name__)



# формат данных для отправки клиенту
js_init = {
	'code':		400,
	'total':	0,
	'message':	'error',
	'data':		[]
}


# перенаправление на страницу index.html
@app.route('/')
def index():
        response = make_response ( render_template('/index.html') )     
        return response 

# функция получает компонент подключения к БД Postgres
def get_connection():
	try:
		conn = psycopg2.connect ( pg_conn_string )
		print ('connection postgres ok')
	except Exception as ex:
		print ("I am unable to connect to the database")                
		print (ex)
	return conn

# функция для выполнения запросов select и возвращения результата клиенту
def db_select ( stmt ):
	print ('xxxxxxxxxxxxxxxxxx ============== db_select')
	print (stmt)	

	# выполнение запроса	
	conn	= get_connection()         
	c 		= conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) 
	c.execute(stmt)
	rows	= c.fetchall()
	
	# возвращение пакета данных
	js = { 'items': [] }	
	for row in rows:		
		js['items'].append ( dict(row) )
	c.close()       
	conn.close()

	return jsonify(js)

# создание таблицы логов в БД
@app.route ( '/db_create', methods=['GET'] )
def db_create ():
	print ('xxxxxxxxxxxxxxxxxx ============== db_create')
	
	conn	= get_connection()         
	c 		= conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) 	
	c.execute('DROP TABLE IF EXISTS it_hub.log')
	conn.commit()
	print('table log dropped')		

	# Создаем таблицу Log, если она еще не существует
	c.execute('''
	CREATE TABLE IF NOT EXISTS it_hub.log (
		id 			SERIAL NOT NULL,
		host 		text,
		dt		 	timestamp,
		request 	text,
		status	 	integer,
		size		integer,
		browser		text
	)
	''')
	conn.commit()	
	conn.close()
	print('table log created')	

	js = js_init
	js['code']		= 200
	js['message']	= 'ok'

	return jsonify(js)

# загрузка логов в таблицу log БД	
@app.route ( '/db_load', methods=['GET'] )
def db_load ():		
	print ('xxxxxxxxxxxxxxxxxx ============== db_load')		
	
	conn	= get_connection()         
	c 		= conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) 
	
	# открываем файл логов Apache для чтения
	#f = open('apache_access_log.txt')
	f = open(log_file)	
	#i = 1
	for log_line in f:			# читаем файл логов построчно
		#print (log_line)		
		# разбираем строку лога Apache на отдельные поля с помощью компонента регулярных выражение "re", правила разбора заданы в строке REGEX
		match   = re.search ( REGEX, log_line )
		
		host    = match.group ('host'   )
		time    = match.group ('time'   ) 
		request = match.group ('request')
		status  = match.group ('status' )
		size    = match.group ('size'   )
		browser = match.group ('browser')		

		# на основе полученных полей формируем запрос на вставку в таблицу БД полученных значений полей очередной строки файла логов Apache 
		stmt = f" insert into it_hub.log ( host, dt, request, status, size, browser ) values ( '{host}', '{time}', '{request}', {status}, {size}, '{browser}' )"		
		#print(stmt)
		c.execute(stmt)		
		#i = i + 1
	conn.commit()	
	conn.close()	
	f.close()
	print('loaded ok')		
	js = {
		'code':		200,
		'total':	0,
		'message':	'ok',
		'data':		[]
	}	
	return js

# выгрузка всех логов
@app.route ( '/db_select_all', methods=['GET'] )
def db_select_all():
	print ('xxxxxxxxxxxxxxxxxx ============== db_select_all')	
	stmt = 'select host as ip_address, dt as date_time, request, status, size, browser from it_hub.log'
	return db_select(stmt)	

# выгрузка 
@app.route ( '/db_select_ip_grp', methods=['GET'] )
def db_select_ip_grp():
	print ('xxxxxxxxxxxxxxxxxx ============== db_select_ip_grp')	
	stmt = 'select host as ip_address, count(*) as count from it_hub.log group by host order by host'
	return db_select(stmt)	

# выгрузка 
@app.route ( '/db_select_dt_grp', methods=['GET'] )
def db_select_dt_grp():
	print ('xxxxxxxxxxxxxxxxxx ============== db_select_dt_grp')	
	stmt = 'select dt::date as date_time, count(*) as count from it_hub.log group by dt::date order by dt::date'
	return db_select(stmt)	

# выгрузка 
@app.route ( '/db_select_dt_period', methods=['GET'] )
def db_select_dt_period():
	print ('xxxxxxxxxxxxxxxxxx ============== db_select_dt_period')	
	dt_from = request.args.get('dt_from')
	dt_to   = request.args.get('dt_to')
	stmt = f"select host as ip_address, dt as date_time, request, status, size, browser from it_hub.log where dt >= '{dt_from}' and dt <= '{dt_to}'"
	return db_select(stmt)	


# читаем параметры из файла конфигурации 
file = 'config.json'
f = open(file)
# читаем содержимое файла конфигурации как JSON-объект
data = json.load(f)
# в JSON-объекте находим нужные параметры
for key in data['flask_server']:
    pg_conn_string 	= key['pg_conn_string']		# строка подключения к БД Postgres
for key in data['apache']:
	log_file 	= key['apache_log_file']		# расположение файла логов запросов Apache
for key in data['reg_exp']:	
	re_host  	= key['host']					# файл логов Apache - regexp выражение для распознавания ip_adress клиента
	re_space 	= key['space']					# файл логов Apache - regexp выражение для распознавания пробела
	re_identity = key['identity']				# файл логов Apache - regexp выражение для распознавания идентити
	re_user  	= key['user']					# файл логов Apache - regexp выражение для распознавания пользователя
	re_time  	= key['time']					# файл логов Apache - regexp выражение для распознавания даты запроса
	re_request  = key['request']				# файл логов Apache - regexp выражение для распознавания тела запроса
	re_status  	= key['status']					# файл логов Apache - regexp выражение для распознавания статуса запроса
	re_size  	= key['size']					# файл логов Apache - regexp выражение для распознавания размера переданных данных
	re_sep  	= key['sep']					# файл логов Apache - regexp выражение для распознавания разделителя
	re_browser  = key['browser']				# файл логов Apache - regexp выражение для распознавания броузера	
f.close()

# компоновка единого regexp-выражения на основе выражений для отдельных полей 	
REGEX = re_host + re_space + re_identity + re_space + re_user + re_space + re_time + re_space + re_request + re_space + re_status + re_space + re_size + re_space + re_sep + re_space + re_browser

# запускаем web-server flask нп 5000 порту  
if __name__ == '__main__':    
    #app.run ( host='0.0.0.0', port=5000 )
    app.run ( host='127.0.0.1', port=5000 )	
