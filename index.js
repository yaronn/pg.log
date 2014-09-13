var fs = require('fs')
var express = require('express')
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var events = require('events');
var Tail = require('tail').Tail;
var argv = require('optimist').argv;
var lib = argv.d || "/var/lib/postgresql/9.3/main/pg_log/"
var port = argv.p || 3000


function getNewestFile(dir, files, callback) {
    if (!callback) return;
    if (!files || (files && files.length === 0)) {
        callback();
    }
    if (files.length === 1) {
        callback(files[0]);
    }
    var newest = { file: files[0] };
    var checked = 0;
    fs.stat(dir + newest.file, function(err, stats) {
        newest.mtime = stats.mtime;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            (function(file) {
                fs.stat(file, function(err, stats) {
                    ++checked;
                    if (stats.mtime.getTime() > newest.mtime.getTime()) {
                        newest = { file : file, mtime : stats.mtime };
                    }
                    if (checked == files.length) {
                        callback(err, newest);
                    }
                });
            })(dir + file);
        }
    });
 }

function getLogFile(cba) {
	var files = fs.readdirSync(lib).filter(function(f) {
		return f.match(/.log$/)})
	getNewestFile(lib, files, function(err, res) {
		cba(err, res.file)
	})
}



getLogFile(init)


function init(err, file) {
	var tail = new Tail(file);
	var last = null;
	
	tail.on("line", function(data) {  	  
	  var m;
	  if (m = data.match(/^LOG:\s*(statement|execute <unnamed>):(.*)/)) {
	  	logEmitter.emit("new")	  	
	  	logEmitter.emit("query", m[2].trim())
	  	last = "query"
	  }

	  else if ((m = data.match(/^LOG:\s*duration:(.{1,16})$/)) && (last==="query" || last==="partial")) { 
	  	logEmitter.emit("duration", m[1].trim())
	  	last="duration"
	  }

	  else if (!data.match(/^(LOG|DETAIL):/)) {
	  	logEmitter.emit("partial", data)
	  	last = "partial"
	  }

	});

	var logEmitter = new events.EventEmitter();

	app.use(express.static(__dirname + '/public'));
	
	app.get('/', function(req, res){	  
	  res.sendfile('./public/index.html');
	});

	http.listen(3000, function(){
	  console.log('listening on *:3000');
	});

	var log_cba = function(type, data) {
			 		console.log(type)
			 		console.log(data)
					if (type=="query") {
						
						io.emit("log", new Date()+ " " + data)
					}
					else if (type=="duration") io.emit("log", data)		
					else if (type=="partial") io.emit("log",data)
	 			  }

	logEmitter.on("new", function() {
		io.emit("new")
		io.emit("date", new Date())
	})

	logEmitter.on("query", function(data) {		
		io.emit("query", data)
	})

	logEmitter.on("partial", function(data) {		
		io.emit("partial", data)
	})

	logEmitter.on("duration", function(data) {		
		io.emit("duration", data)
	})	
}
