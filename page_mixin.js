(function($) {

  var $time = $("<span class=\"time\">{current time}</span>");
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

  var startTime = $(".first_broadcast_date span").text(),
      duration = $(".duration span").text();
})(jQuery);
