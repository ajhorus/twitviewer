var http = require('http')
    , url = require('url')
	, xml2js = require('xml2js')
	, Twit = require('twit')
	, io = require('socket.io').listen(81)
	, request = require('request');
	



io.sockets.on('connection', function (socket) {

  console.log('connection started');
  socket.on('startStreaming', function (data) {
    console.log('stratStreamReceive');
	
    if(data.symbol)
	{
		var access_token = data.access_token;
		var access_token_secret = data.access_token_secret;
		var T = new Twit({
							consumer_key:         'U9GKXZfJMRru0ibAXMwog'
						  , consumer_secret:      'bMuit8gE9fgTp58Hi4dXHQw1kucZQPDx00JJWPRCU'
						  , access_token:         access_token
						  , access_token_secret:  access_token_secret
						});
						
		var stream = T.stream('statuses/filter', { track: data.symbol })

		stream.on('tweet', function (tweet) {
		    var dataClient = {};
			dataClient.tweet = tweet;
			dataClient.symbol = data.symbol;
			 socket.emit('tweet',dataClient);
		 
		});
		
	}
	
  });
});

	
	
	
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Dashboard twitter test' });
};

exports.dashboard_Get = function(req, res){
  var titleText ="";
  if(req.session.oauth)
     titleText = req.session.oauth.screen_name;
  res.render('index', { title: titleText });
};



exports.dashboard_matchticker = function (req,res) {
   console.log(req.params.value);
   var ticker = req.params.value;
   if(ticker)
   {
      var urlAddr = 'http://www.google.com/ig/api?stock='+ticker; //live
	  //urlAddr = 'http://127.0.0.1:3000/unkwonsymbol.xml';//unkwon 
	  //urlAddr = 'http://127.0.0.1:3000/goodsymbol.xml';//good symbol
	  
	    request(urlAddr, function (error, response, body) {
		  var dataToReturn = {};
		  if (!error && response.statusCode == 200) {
		     var parser = new xml2js.Parser({explicitRoot : false, explicitCharkey :true, mergeAttrs :true, explicitArray :false});
			 
			 parser.parseString(body, function (err, result) {
				if(err)
				{
					console.log("Error parsing data from Google Api. " + err);
					dataToReturn.error = "Error parsing data from Google Api. " + err;
					res.writeHead(200, {'content-type': 'text/json' });
					res.write( JSON.stringify(dataToReturn) );
					res.end('\n');
				}
				else
				{
					//console.log( JSON.stringify(result) );
					if(result.finance)
					{
						var exchange = result.finance.exchange.data;
						console.log('exchange is: ' + exchange);
						if(exchange == "UNKNOWN EXCHANGE")
						{
							console.log("bad symbol " + exchange);
							dataToReturn.error = "Invalid symbol";
							res.writeHead(200, {'content-type': 'text/json' });
							res.write( JSON.stringify(dataToReturn) );
							res.end('\n');
						}
						else
						{
							console.log("good symbol " + exchange);
							
							var T = new Twit({
												consumer_key:         'U9GKXZfJMRru0ibAXMwog'
											  , consumer_secret:      'bMuit8gE9fgTp58Hi4dXHQw1kucZQPDx00JJWPRCU'
											  , access_token:         req.session.oauth.access_token
											  , access_token_secret:  req.session.oauth.access_token_secret
											});
							T.get('search', { q: ticker, since: '2011-11-11' }, function(err, reply) {
							
								if(err){
								   dataToReturn.error = err;
								}
								else
								{
									var replyJson = JSON.stringify(reply.results);
									console.log('reply twitter: ' +reply.results.length);
									dataToReturn.error = "";
									dataToReturn.access_token = req.session.oauth.access_token;
									dataToReturn.access_token_secret = req.session.oauth.access_token_secret;
									dataToReturn.tweets = reply.results;
								}
								res.writeHead(200, {'content-type': 'text/json' });
								res.write( JSON.stringify(dataToReturn) );
								res.end('\n');
							});
						}
					}
					else
					{
						dataToReturn.error = "Invalid result from GOOGlE Api";
						res.writeHead(200, {'content-type': 'text/json' });
						res.write( JSON.stringify(dataToReturn) );
						res.end('\n');
					}
				}
			});
			 
		  }
		  else
		  {
		    console.log("Error parsing data from Google Api. " + err);
			dataToReturn.error = "Error parsing data from Google Api. " + err;
			res.writeHead(200, {'content-type': 'text/json' });
			res.write( JSON.stringify(dataToReturn) );
			res.end('\n');
		  }
		});
		

   }
   
};


exports.dashboard_Post = function(req, res){
  var ticker = req.body.ticker;   
   if(ticker)
   {
      var urlAddr = 'http://www.google.com/ig/api?stock='+ticker; //live
	  urlAddr = 'http://127.0.0.1:3000/unkwonsymbol.xml';//unkwon 
	  urlAddr = 'http://127.0.0.1:3000/goodsymbol.xml';//good symbol
	  
		urlReq(urlAddr, function(body, dataXml){
		console.log(req.session.oauth.access_token);
		console.log(req.session.oauth.access_token_secret);
		console.log(req.session.oauth.screen_name);
		console.log('data length: ' + body.length);

				var parser = new xml2js.Parser({explicitRoot : false, explicitCharkey :true, mergeAttrs :true, explicitArray :false});
				parser.parseString(body, function (err, result) {

				if(err)
				{
					console.log("Error parsing data from Google Api. " + err);
					var emptyArray = [ ];
					 
					res.render('dashboard.jade',{title:req.session.oauth.screen_name, ErrorMsg: err, TwitCollection: emptyArray});
				}
				else
				{
					var exchange = result.finance.exchange.data;
					console.log('exchange is: ' + exchange);
					if(exchange == "UNKNOWN EXCHANGE")
					{
						console.log("bad symbol " + exchange);
						var emptyArray = [ ];
						
						res.render('dashboard.jade',{ ErrorMsg: exchange, title:req.session.oauth.screen_name, TwitCollection: emptyArray });
					}
					else
					{
						console.log("good symbol " + exchange);
						
						var T = new Twit({
											consumer_key:         'U9GKXZfJMRru0ibAXMwog'
										  , consumer_secret:      'bMuit8gE9fgTp58Hi4dXHQw1kucZQPDx00JJWPRCU'
										  , access_token:         req.session.oauth.access_token
										  , access_token_secret:  req.session.oauth.access_token_secret
										});
						T.get('search', { q: ticker, since: '2011-11-11' }, function(err, reply) {
						
						console.log('Error:' + err);
						if(err==null || err ==""){
							var replyJson = JSON.stringify(reply.results);
							console.log('reply twitter: ' +replyJson);
							//console.log('reply twitter: ' + reply.results.length);
							res.render('dashboard.jade',{title:req.session.oauth.screen_name, ErrorMsg: 'Todo Cool' + exchange, TwitCollection: reply.results});
							}
						
						});
					}
				}
			});
		});
   }
   else
   {
      res.send('parameter missing');
	  console.log('Parameter not present');
   }
};

var twitHelper = function(symbol,cb)
{
	if(typeof options === "function"){ cb = options; options = {}; }// incase no options passed in
	
}

