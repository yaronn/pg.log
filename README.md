## pg.log
Postgres query log inside your browser.
Great to see how UI steps affect DB.

Created by Yaron Naveh ([twitter](https://twitter.com/YaronNaveh)).

<img src="https://raw.githubusercontent.com/yaronn/pg.log/master/public/pg.log.png"  width="420px" />

## Install

    npm install pg.log -g

(you can also install locally)

## Configuration
You need to configure Postgres to emit queries to log files.

Find your postgresql.conf. You can find its location by issuing the query "SHOW config_file;".

Find the following settings, uncomment them, and set them as follows:

`````
   logging_collector = on
   ...
   log_statement = 'all'
`````

Now restart postgres, issue some query, and see that it is written to the log.
By default, logs will be written to PGDATA/pg_log. You can query for your PGDATA folder location with "show data_directory;".


You can find more information on configuring postgres logs [here](http://stackoverflow.com/questions/722221/how-to-log-postgres-sql-queries) and [here](http://www.postgresql.org/docs/9.3/static/runtime-config-logging.html).


## Running the server

Run:

`````
   $> pg.log -p 3000 -d /var/lib/postgresql/9.3/main/pg_log/  
`````
-p is an arbitrary port you want pg.log to run on 

-d is the postgres logs directory (PGDATA/pg_log if you have not changed it. 

Defaults are in the sample above.

**Note**: pg.log needs access to the postgres log folder or you will get a "permision denied" error. You should grant required permissions or use sudo (though less recomemnded in general).


## Viewing queries

Surf to http://localhost:3000/ and once new queries arrive you will see them in the browser.

<img src="https://raw.githubusercontent.com/yaronn/pg.log/master/public/pg.log.png"  width="420px" />
