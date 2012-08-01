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
 var item = "<li><div class='tweet'>" + tweet.from_user +"&nbsp;"+ tweet.text+ "</div></li>";
 console.log(item);
 return item;
}

function CheckSymbol(symbol){
	$.ajax({
	   type: "GET",
	   dataType: "jsonp",
	   url: '/dashboard_matchticker/'+symbol,
	   dataType: "json",
	   error: function (xhr, ajaxOptions, thrownError) {
		   //En caso de error (incluye timeout error)
		   alert(xhr.status);
		   alert(thrownError);
	   }, //end error
	   success: function (jObject) {
		 //console.log(jObject[error]);
		 console.log(jObject.error);
		 var error = jObject.error;
		 if(error=="")
		 {
		    var tweets = jObject.tweets;
			var count = tweets.length;
			//$("#tweetsHeader").html('Tweets for: '+symbol +'('+ count +')');
			for (var i = 0; i < tweets.length; i++) { 
			   $("#tweetsList").append( CreateTweetTemplate(tweets[i]));
			}
		 }
		 else
		 {
		   $("#errorDiv").html(error);
		 }
	     
	   } // end success
   });
}