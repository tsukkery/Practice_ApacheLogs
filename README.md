# Practice_ApacheLogs
Требования для программы:
Для работы программы в питон необходимо установить 2 библиотеки: 
- flask (встроенный веб-сервер) и 
- psycopg2 (драйвер для доступа к базе данных postgres).
- 
Подготовка базы данных:
- СУБД postgres должно быть развёрнуто и там должна быть создана БД "dariya", этот параметр изменяется в файле конфигурации.
- 
Развёртывание программы: 
- копируем в необходимую папку наш архив, 
- извлекаем из него файлы, переходим в папку.
- 
Запуск программы:
- открываем терминал
- переходим в заданную папку
- запускаем приложение (web-server): python run.py, 
чтобы flask мог принимать REST API запросы.

Известные запросы для работы программы: 
- curl http://127.0.0.1:5000/db_create' - создание таблицы базы данных
- curl http://127.0.0.1:5000/db_load' - загрузка логов apache в таблицу базы данных
- curl http://127.0.0.1:5000/db_select_all' - получение всех логов из таблицы базы данных
- curl http://127.0.0.1:5000/db_select_ip_grp' - группировка по IP
- curl http://127.0.0.1:5000/db_select_dt_grp' - группировка по дате
- curl http://127.0.0.1:5000/db_select_dt_period' (dt_from=(?)&dt_to=(?)) - получение логов по необходимому временному промежутку
В терминал ввести 'crontab -e' - открытие постановки на расписание.
открывается файл, в нём написать '*/5 * * * * curl http://127.0.0.1:5000/db_load'
сохраняем файл, дозагрузка логов поставлена на расписание и каждые 5 минут запрос db_load запускает дозагрузку файлов логов.


Для запуска интерфейса (по желанию) открываем браузер и вводим адрес http://127.0.0.1:5000
