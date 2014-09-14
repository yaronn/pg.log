## pg.log
Postgres query log inside your browser.
Great to the DB affect of UI steps side-by-side.

Created by Yaron Naveh ([twitter](https://twitter.com/YaronNaveh)).

## Install

    npm install pg.log -g

(you can also install locally if you prefer)

## Configuration
You need to configure Postgres to emit queries to log files.

Find your postgresql.conf. You can find its location by issuing the query "SHOW config_file;".

Set the following:

`````
   logging_collector = on
   ...
   log_statement = 'all'
`````

now restart postgres, issue some query, and see that it is written to the log.
by default logs will be written to PGDATA/pg_log where you can query for PGDATA with "show data_directory;".
You can find more information on this [here](http://stackoverflow.com/questions/722221/how-to-log-postgres-sql-queries) and [here](http://www.postgresql.org/docs/9.3/static/runtime-config-logging.html).


## Running the server

Run:

`````
   $> pg.log -p 3000 -d /var/lib/postgresql/9.3/main/pg_log/  
`````
-p is an arbitrary port you want pg.log to run on (default 3000)
-d is the postgres logs directory (PGDATA/pg_log if you have not changed it. default is /var/lib/postgresql/9.3/main/pg_log/  ).

Note: pg.log needs access to the postgres log folder or you will get "permision denied". You should grant required permissions or use sudo (though less recomemnded in general).

Now surf to http://localhost:3000/. Once new queries arrive you will see them in the browser.

<img src="https://raw.githubusercontent.com/yaronn/pg.log/master/public/pg.log.png"  width="420px" />
