class TweetsController < ApplicationController
  before_filter :login_required
  def index
    range = Time.parse(params[:start])...Time.parse(params[:end])
    p range.to_s
    set = []
    Tweenumerator.new(current_user.twitter).each do |tweet|
      time = Time.parse(tweet["created_at"])
      break if time < range.first
      if range.include?(time)
        p time, range
        set << tweet
      end
    end
    render :json => set
  end

  class Tweenumerator
    def initialize(twitter, url = "/statuses/friends_timeline")
      @twitter, @url = twitter, url
    end

    def each(&block)
      page = 1
      while (tweets = @twitter.get("#{@url}?page=#{page}&count=200&skip_user=true")).any?
        page += 1
        break unless tweets.each(&block)
        puts "Hello"
      end
    end
  end
end
