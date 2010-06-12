(function($) {
  var twitterHost = "http://iplayer-sync.heroku.com";

  var authToken = function() {
    var token, matches;

    if(matches = /[\?&]twitter_token=([A-Za-z0-9]+)/.exec(window.location.search)) {
      token = matches[1];
      Cookies.create("twitter_sync_token", token, 14);
    }

    if(!token) {
      token = Cookies.read("twitter_sync_token");
    }

    return token;
  }

  var displayTweet = function(data) {
    var img = "<img src=\"" + data.user.profile_image_url.replace(/_normal\./, '_mini.') + "\" alt=\"\" />";
    var userLink = "<a href=\"http://www.twitter.com/" + data.user.screen_name + "\">" + data.user.screen_name + "</a>"
    $tweets.prepend("<li>" + img + userLink + " " + data.text + "</li>");
    $time.html(data.created_at);
  }

  var $time = $("<span class=\"time\"></span>");
  var $tweets = $("<ol class=\"tweets\"></ol>");

  var $copy = $("<div class=\"copy\"><h2>Synchronised tweets:</h2></div>")
    .append($time)
    .append($tweets);

  var $container = $("<div id=\"iplayer-twitter-sync\"></div>");
  var windowWidth = $(window).width();
  var width = windowWidth - $("#emp").width();

  $copy
    .css({
      "height": ($("#emp").height() - 22)+"px"
    });

  $container
    .append($copy)
    .css({
      "width": width+"px"
    });

  $("#emp")
    .prepend($container)
    .css({
      "width": windowWidth+"px",
      "margin-left": -Math.floor((windowWidth - $("#emp-container").width())/2)+"px"
    });

  $("#emp-container").css("overflow", "visible");

  if(!authToken()) {
    var loginURL = twitterHost + "/login?source_url=" + escape(window.location);
    $copy.append("<div class=\"auth\"><a href=\"" + loginURL + "\">Log in to Twitter</a></div>");
    return;
  }

  var startTime = $(".first_broadcast_date span").text(),
      duration = parseInt($(".duration span").text(), 10);

  var tweetsURL = twitterHost + "/tweets?remember_token=" + escape(authToken()) + "&start=" + escape(startTime) + "&duration=" + escape(duration);
  chrome.extension.sendRequest({"action": "loadTweets", "url": tweetsURL}, function(json) {
    var tweets = JSON.parse(json);
    for(var i = 0; i < tweets.length; i++) {
      displayTweet(tweets[i]);
    }
  });

})(jQuery);
