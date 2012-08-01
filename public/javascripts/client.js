$(document).ready(function () {

  $("#btnTicker").live('click', function () {
    var symbol = $("#tickertxt").val();
	if(symbol ==''){
		alert('Enter Symbol');
	}
	else{
		CheckSymbol(symbol);
	}
  });
  
});

function CreateTweetTemplate(tweet){
//var scrtext = 'src';
 var item = "<li><div class='tweet'><img src='" +tweet.profile_image_url +"'><b><a style='color:black' href='https://twitter.com/"+tweet.from_user+"'>" 
 + tweet.from_user_name +"</a></b>&nbsp;&nbsp;"+ ify.clean(tweet.text)+ "<br/>" + tweet.created_at+"</div></li>";
 return item;
}

function CreateTweetTemplateFromStream(tweet){
//var scrtext = 'src';
 var item = "<li><div class='tweet'><img src='" +tweet.user.profile_image_url +"'><b><a style='color:black' href='https://twitter.com/"+tweet.user.screen_name+"'>" 
 + tweet.user.name +"</a></b>&nbsp;&nbsp;"+ ify.clean(tweet.text)+ "<br/>" + tweet.created_at+"</div></li>";
 return item;
}

 var ify  = {
      link: function(tweet) {
        return tweet.replace(/\b(((https*\:\/\/)|www\.)[^\"\']+?)(([!?,.\)]+)?(\s|$))/g, function(link, m1, m2, m3, m4) {
          var http = m2.match(/w/) ? 'http://' : '';
          return '<a class="twtr-hyperlink" target="_blank" href="' + http + m1 + '">' + ((m1.length > 25) ? m1.substr(0, 24) + '...' : m1) + '</a>' + m4;
        });
      },
 
      at: function(tweet) {
        return tweet.replace(/\B[@@]([a-zA-Z0-9_]{1,20})/g, function(m, username) {
          return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/intent/user?screen_name=' + username + '">@' + username + '</a>';
        });
      },
 
      list: function(tweet) {
        return tweet.replace(/\B[@@]([a-zA-Z0-9_]{1,20}\/\w+)/g, function(m, userlist) {
          return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/' + userlist + '">@' + userlist + '</a>';
        });
      },
 
      hash: function(tweet) {
        return tweet.replace(/(^|\s+)#(\w+)/gi, function(m, before, hash) {
          return before + '<a target="_blank" class="twtr-hashtag" href="http://twitter.com/search?q=%23' + hash + '">#' + hash + '</a>';
        });
      },
 
      clean: function(tweet) {
        return this.hash(this.at(this.list(this.link(tweet))));
      }
    } // ify

var socket = io.connect('http://127.0.0.1:81');
	
function ConnectIO(symbol,access_token,access_token_secret)
{
	
	socket.on('tweet', function (data) {
		var maxAllowed = $("#tweetsList li").size();
		$("#tweetsList").prepend( CreateTweetTemplateFromStream(data));
		
		$( 'li:gt(' + ( maxAllowed-1 ) + ')' ).remove();
		//console.log(JSON.stringify(data));
	});
    socket.emit('startStreaming', { symbol: symbol, access_token : access_token, access_token_secret : access_token_secret });
}	
	
function CheckSymbol(symbol){
	$.ajax({
	   type: "GET",
	   dataType: "jsonp",
	   url: '/dashboard_matchticker/'+symbol,
	   dataType: "json",
	   error: function (xhr, ajaxOptions, thrownError) {
		   
		   alert(xhr.status);
		   alert(thrownError);
	   }, //end error
	   success: function (jObject) {
		 
		 console.log(jObject.error);
		 var error = jObject.error;
		 if(error=="")
		 {
		    var tweets = jObject.tweets;
			var count = tweets.length;
			
			$("#tweetsList").html('');
			for (var i = 0; i < tweets.length; i++) { 
			   $("#tweetsList").append( CreateTweetTemplate(tweets[i]));
			}
			ConnectIO(symbol,jObject.access_token,jObject.access_token_secret);
		 }
		 else
		 {
		   $("#errorDiv").html(error);
		 }
	     
	   } // end success
   });
}