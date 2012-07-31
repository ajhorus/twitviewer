
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');
  
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'keyboard cat', key: 'sid'}));
  //app.use(require('express/node_modules/connect').bodyParser());
  
  
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);
  
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


app.get('/', routes.index);


app.get('/dashboard',  routes.dashboard_Get);
app.post('/dashboard', routes.dashboard_Post);



//**************************** twiter oauth   ********************************

var OAuth= require('oauth').OAuth;

var oa = new OAuth(
    "https://api.twitter.com/oauth/request_token",
	"https://api.twitter.com/oauth/access_token",
	"U9GKXZfJMRru0ibAXMwog",
	"bMuit8gE9fgTp58Hi4dXHQw1kucZQPDx00JJWPRCU",
	"1.0",
	"http://127.0.0.1:3000/auth/twitter/callback",
	"HMAC-SHA1"
);

app.get('/auth/twitter', function(req, res){
    oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
		if (error) {
			console.log(error);
			res.send("yeah no. didn't work.")
		}
		else {
            req.session.idtemp = "999";
			req.session.oauth = {};
			req.session.oauth.token = oauth_token;
			console.log('oauth.token: ' + req.session.oauth.token);
			req.session.oauth.token_secret = oauth_token_secret;
			console.log('oauth.token_secret: ' + req.session.oauth.token_secret);
			res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token)
	}
	});
});

app.get('/auth/twitter/callback', function(req, res, next){
    if (req.session.oauth) {
        
		req.session.oauth.verifier = req.query.oauth_verifier;
		var oauth = req.session.oauth;

		oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier, 
		function(error, oauth_access_token, oauth_access_token_secret, results){
			if (error){
				console.log(error);
				res.send("yeah something broke.");
			} else {
			    var user_data = results;
				console.log(user_data.screen_name);
				req.session.oauth.access_token = oauth_access_token;
				req.session.oauth.access_token_secret = oauth_access_token_secret;
				req.session.oauth.scren_name = user_data.screen_name;
				res.render('dashboard.jade', {title: user_data.screen_name});
				
			}
		}
		);
	} else
		next(new Error("you're not supposed to be here."))
});
//******************************************************************************





http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
