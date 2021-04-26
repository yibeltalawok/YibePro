// 'use strict';

// 	const loopback = require('loopback'); const boot = require('loopback-boot');

// 	const http = require('http'); const https = require('https'); const sslConfig = require('./ssl-config');

// 	const app = module.exports = loopback();

// 	// boot scripts mount components like REST API
// 	boot(app, __dirname);

// 	app.start = function(httpOnly) { if (httpOnly === undefined) { httpOnly = process.env.HTTP;
// 	  }
// 	  let server = null; if (!httpOnly) { const options = { key: sslConfig.privateKey, cert: sslConfig.certificate,
// 	    };
// 	    server = https.createServer(options, app);
// 	  } else {
// 	    server = http.createServer(app);
// 	  }
// 	  server.listen(app.get('port'), function() { const baseUrl = (httpOnly ? 'http://' : 'https://') + app.get('host') + ':' + app.get('port'); 
// 	    app.emit('started', baseUrl); console.log('LoopBack server listening @ %s%s', baseUrl, '/'); if (app.get('loopback-component-explorer')) {
// 	      const explorerPath = app.get('loopback-component-explorer').mountPath; console.log('Browse your REST API at %s%s', baseUrl, 
// 	      explorerPath);
// 	    }
// 	  });
// 	  return server;
// 	};

// 	// start the server if `$ node server.js`
// 	if (require.main === module) { app.start();
// 	}


// "swagger":{
// 	"protocol": "https"
//    },
//   "url": "https://localhost:7000/",


/* eslint no-console:0 */

const loopback = require("loopback");
const boot = require("loopback-boot");
// load env vars
const result = require("dotenv").config();

if (result.error) {
  throw result.error;
}

const app = loopback();
require("loopback-row-count-mixin")(app);
require("loopback-disable-method-mixin")(app);

app.start = function() {
  // start the web server
  return app.listen(() => {
    app.emit("started");
    console.log("Server started ");
    const baseUrl = app.get("url").replace(/\/$/, "");
    if (app.get("loopback-component-explorer")) {
      const explorerPath = app.get("loopback-component-explorer").mountPath;
      console.log("Browse your REST API at %s%s", baseUrl, explorerPath);
    }
  });
};

boot(app, __dirname, err => {
  if (err) throw err;
  if (require.main === module) {

    var options={
      cors: {
        origin: '*',
      },
      // origins:["http://localhost:8080"],
     }
      app.io = require('socket.io')(app.start(), options);

      require('socketio-auth')(app.io, {
        authenticate: function (socket, value, callback) {
          callback(null, true);
         
          } //authenticate function..
      });

      app.io.on('connection', function(socket){
        console.log('a user connected');
        socket.on('disconnect', function(){
            console.log('user disconnected');
        });
      });


  }
});

module.exports = app;
