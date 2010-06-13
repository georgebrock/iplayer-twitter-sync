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

  var displayNextTweet = function(tweets, now) {
    var nextTweet = tweets.pop();
    var wait = nextTweet.created_at - now;
    console.log("Wait " + (wait/1000) + "s until next tweet");
    setTimeout(function() {
      displayTweet(nextTweet);
      if(tweets.length > 0) {
        displayNextTweet(tweets, nextTweet.created_at);
      }
    }, wait);
  }

  var displayTweet = function(data) {
    var img = "<img src=\"" + data.user.profile_image_url.replace(/_normal\./, '_mini.') + "\" alt=\"\" />";
    var userLink = "<a href=\"http://www.twitter.com/" + data.user.screen_name + "\">" + data.user.screen_name + "</a>"
    $tweets.hide().prepend("<li>" + img + userLink + " " + data.text + "</li>").slideDown();
    $time.html(data.created_at.toLocaleTimeString());
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

  var startTimeString = $(".first_broadcast_date span").text(),
      duration = parseInt($(".duration span").text(), 10);

  var matches, startTime;
  if(matches = /^[^,]+, (\d{1,2}):(\d{2})([ap]m) ([A-Za-z]+), (\d+) ([A-Za-z]+) (\d{4})$/.exec(startTimeString)) {
    var year = parseInt(matches[7], 10),
        month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(matches[6]),
        day = parseInt(matches[5], 10),
        hours = parseInt(matches[1], 10) + (matches[3] == "pm" ? 12 : 0),
        minutes = parseInt(matches[2], 10);

    startTime = new Date(year, month, day, hours, minutes, 0, 0);
  }

  var tweetsURL = twitterHost + "/tweets?remember_token=" + escape(authToken()) + "&start=" + escape(startTimeString) + "&duration=" + escape(duration);
  chrome.extension.sendRequest({"action": "loadTweets", "url": tweetsURL}, function(json) {
    var tweets = JSON.parse(json);
    tweets = tweets.map(function(tweet) {
      tweet.created_at = new Date(Date.parse(tweet.created_at));
      return tweet;
    });
    displayNextTweet(tweets, startTime);
  });

})(jQuery);
