(function($) {
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
  var $time = $("<span class=\"time\"></span>");
  var $tweets = $("<ul class=\"tweets\"></ul>");

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
    var loginURL = "http://iplayer-sync.heroku.com/login?source_url=" + escape(window.location);
    $copy.append("<div class=\"auth\"><a href=\"" + loginURL + "\">Log in to Twitter</a></div>");
    return;
  }

  var startTime = $(".first_broadcast_date span").text(),
      duration = $(".duration span").text();
})(jQuery);
