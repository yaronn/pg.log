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


function getLatestFile(dir, files, callback) {
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

function PgEmitter() {	
	
   var emitter = new events.EventEmitter();

   var files = fs.readdirSync(lib).filter(function(f) {
      return f.match(/.log$/)
   })

   getLatestFile(lib, files, function(err, res) {

      var tail = new Tail(res.file);
      var last = null;

      tail.on("line", function(data) {  	  
         var m;
         if (m = data.match(/^LOG:\s*(statement|execute <unnamed>):(.*)/)) {
            pgEmitter.emit("new")	  	
            emitter.emit("query", m[2].trim())
            last = "query"
         }

         else if ((m = data.match(/^LOG:\s*duration:(.{1,16})$/)) && (last==="query" || last==="partial")) { 
            emitter.emit("duration", m[1].trim())
            last="duration"
         }

         else if (!data.match(/^(LOG|DETAIL):/)) {
            emitter.emit("partial", data)
            last = "partial"
         }
      });	
   })

   return emitter;
}

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){	  
   res.sendfile('./public/index.html');
});

http.listen(port, function(){
   console.log('listening on *:' + port);
});

var pgEmitter = new PgEmitter()

pgEmitter.on("new", function() {	
   io.emit("new")
   var d = new Date()
   console.log(d)
   io.emit("date", d)
})

pgEmitter.on("query", function(data) {		
   console.log(data)
   io.emit("query", data)
})

pgEmitter.on("partial", function(data) {		
   console.log(data)
   io.emit("partial", data)
})

pgEmitter.on("duration", function(data) {
   console.log(data)
   io.emit("duration", data)
})	
