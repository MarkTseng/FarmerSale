
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
//  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var settings = require('./settings');
//var MongoStore = require('connect-mongodb');
var MongoStore = require('connect-mongo')(express);
var flash = require('connect-flash');


var app = express();

// all environments
app.set('port', process.env.PORT || 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('my secret'));
app.use(express.session({
  key: 'session_id',
  cookie: {maxAge: 60000},
  secret: settings.cookieSecret,
  store: new MongoStore({
    db: settings.db
  })
}));

//connect-flash
app.use(flash());

//Express 3.x
app.use(function(req, res, next){
  res.locals.user = req.session.user;
  var err = req.flash('error');
  if(err.length)
    res.locals.error = err;
  else
    res.locals.error = null;
  var succ = req.flash('success');
  if(succ.length)
    res.locals.success = succ;
  else
    res.locals.success = null;
  next();
});


app.use(app.router);
//app.use(express.router(routes));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

routes(app);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
