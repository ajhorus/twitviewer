var http = require('http')
    , url = require('url')
	, xml2js = require('xml2js');


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

exports.dashboard_Post = function(req, res){
  var ticker = req.body.ticker;   
   if(ticker)
   {
      var urlAddr = 'http://www.google.com/ig/api?stock='+ticker;
	  //urlAddr = 'http://smallbusiness.aol.com/category/five-things-you-need-to-know/rss.xml';
		    urlReq(urlAddr, function(body, dataXml){
			console.log(req.session.oauth.access_token);
			console.log(req.session.oauth.access_token_secret);
			console.log('data length: ' + body.length);
			res.send("Invalid request to Google API");
			var parser = new xml2js.Parser();
			parser.parseString(body, function (err, result) {

			if(err)
			{
				res.send("Error parsing data from google API");
			}
			else
			{
				var jsonStr = JSON.stringify(result);
				//console.log(jsonStr + ' Done');
				res.send('after parsing:    ' +jsonStr);
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

var urlReq = function(reqUrl, options, cb){
    if(typeof options === "function"){ cb = options; options = {}; }// incase no options passed in

    // parse url to chunks
    reqUrl = url.parse(reqUrl);

    // http.request settings
    var settings = {
        host: reqUrl.hostname,
        port: reqUrl.port || 80,
        path: reqUrl.pathname,
        headers: options.headers || {},
        method: options.method || 'GET'
    };

    // if there are params:
    if(options.params){
        options.params = JSON.stringify(options.params);
        settings.headers['Content-Type'] = 'application/json';
        settings.headers['Content-Length'] = options.params.length;
    };

    // MAKE THE REQUEST
    var req = http.request(settings);

    // if there are params: write them to the request
    if(options.params){ req.write(options.params) };

    // when the response comes back
    req.on('response', function(res){
        res.body = '';
        res.setEncoding('utf-8');

        // concat chunks
        res.on('data', function(chunk){ res.body += chunk });

        // when the response has finished
        res.on('end', function(){
            
            // fire callback
            cb(res.body, res);
        });
    });

    // end the request
    req.end();
}