(function($) {
  var twitterHost = "http://iplayer-sync.heroku.com";

  var startTimeString = $(".first_broadcast_date span").text(),
      duration = parseInt($(".duration span").text(), 10),
      tweets = null;

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

  var formatTime = function(seconds) {
    var hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    var minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    return hours + ":" + (minutes < 10 ? "0"+minutes : minutes) + ":" + (seconds < 10 ? "0"+seconds : seconds);
  }

  var displayTweet = function(data) {
    var img = "<img src=\"" + data.user.profile_image_url.replace(/_normal\./, '_mini.') + "\" alt=\"\" />";
    var userLink = "<a href=\"http://www.twitter.com/" + data.user.screen_name + "\">" + data.user.screen_name + "</a>"
    $tweets.append("<li>" + img + userLink + " " + data.text + "</li>");
  }

  var drawTimeline = function(){
    var canvas = $canvas.get(0);
    var mduration = duration * 60000;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "white";
    tweets.forEach(function(e){
      var pos = $canvas.width() * e.iplayer_time / mduration;
      ctx.fillRect(pos, 0, 1, 3);
    });
  }

  var $time = $("<span class=\"time\"></span>");
  var $tweets = $("<ol class=\"tweets\"></ol>");

  var $copy = $("<div class=\"copy\"><h2>Synchronised tweets:</h2></div>")
    .append($time)
    .append($tweets);

  var $container = $("<div id=\"iplayer-twitter-sync\"></div>");
  var windowWidth = $(window).width();
  var playerWidth = $("#emp").width();
  var width = windowWidth - playerWidth;

  $copy
    .css({
      "height": ($("#emp").height() - 22)+"px"
    });

  $container
    .append($copy)
    .css({
      "width": width+"px"
    });

  var $slider = $("<input type=\"range\" value=\"0\" min=\"0\" max=\"" + (duration * 60) + "\" id=\"iplayer-twitter-sync-slider\" />")
    .hide()
    .css({
      "float": "right",
      "clear": "right",
      "width": playerWidth + "px"
    })
    .bind("increment", function() {
      this.value = parseInt(this.value, 10) + 1;
      $(this).trigger("change");
    })
    .change(function() {
      var seconds = parseInt(this.value, 10),
          mseconds = seconds * 1000;
      $time.html(formatTime(seconds));
      $tweets.html("");
      tweets.forEach(function(tweet) {
        if(tweet.iplayer_time < mseconds) {
          displayTweet(tweet);
        }
      });
    });

  var $canvas = $("<canvas width=\"" + playerWidth + "\" height=\"10\"></canvas>")
    .hide()
    .css({
      height: "10px",
      float: "right",
      width: playerWidth + "px",
      margin: "-2px -8px 0 0"
    });

  $("#emp")
    .prepend($container)
    .css({
      "width": windowWidth+"px",
      "margin-left": -Math.floor((windowWidth - $("#emp-container").width())/2)+"px"
    })
    .append($slider)
    .append($canvas);

  $("#emp-container")
    .css({"overflow": "visible", "margin-bottom": "50px"});

  if(!authToken()) {
    var loginURL = twitterHost + "/login?source_url=" + escape(window.location);
    $copy.append("<div class=\"action\"><a href=\"" + loginURL + "\">Log in to Twitter</a></div>");
    return;
  }

  var matches, startTime;
  if(matches = /^[^,]+, (\d{1,2}):(\d{2})([ap]m) ([A-Za-z]+), (\d+) ([A-Za-z]+) (\d{4})$/.exec(startTimeString)) {
    var year = parseInt(matches[7], 10),
        month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(matches[6]),
        day = parseInt(matches[5], 10),
        hours = parseInt(matches[1], 10) + (matches[3] == "pm" ? 12 : 0),
        minutes = parseInt(matches[2], 10);

    startTime = new Date(year, month, day, hours, minutes, 0, 0);
  }

  var loadTweets = function() {
    $copy.append("<div class=\"loading\" style=\"background-image:url(" + chrome.extension.getURL("loading.gif") + ");\"></div>");
    var tweetsURL = twitterHost + "/tweets?remember_token=" + escape(authToken()) + "&start=" + escape(startTimeString) + "&duration=" + escape(duration);

    chrome.extension.sendRequest({"action": "loadTweets", "url": tweetsURL}, function(json) {
      try {
        tweets = JSON.parse(json);
      } catch(e) {
        var $retryButton = $("<a>Retry</a>").click(function(){
          $retryContainer.fadeOut(function() { $(this).remove(); });
          loadTweets();
        });
        var $retryContainer = $("<div class=\"action\"><p>You know how Twitter doesn't work sometimes?<br/>This is one of those times.</p></div>").append($retryButton);
        $copy
          .find(".loading").remove().end()
          .append($retryContainer);
        return;
      }

      if(tweets.length === 0) {
        $copy
          .append("<div class=\"action\">No one tweeted while this programme was on.</div>")
          .find(".loading").remove();
        return;
      }

      tweets = tweets.map(function(tweet) {
        tweet.created_at = new Date(Date.parse(tweet.created_at));
        tweet.iplayer_time = tweet.created_at - startTime;
        return tweet;
      });

      drawTimeline();

      var $playButton = $("<a>Play</a>").click(function() {
        $slider.show();
        $canvas.show();
        setInterval(function() {
          $slider.trigger("increment");
        }, 1000);
        $playButtonWrapper.fadeOut(function() { $(this).remove(); });
      });
      var $playButtonWrapper = $("<div class=\"action\"></div>").append($playButton);
      $copy
        .append($playButtonWrapper)
        .find(".loading").remove();
    });
  }

  loadTweets();

})(jQuery);
