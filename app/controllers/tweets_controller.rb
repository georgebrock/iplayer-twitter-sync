class TweetsController < ApplicationController
  before_filter :login_required
  def index
    start_time = Time.parse(params[:start])
    if params[:end]
      end_time = Time.parse(params[:end])
    else
      end_time = start_time + params[:duration].to_i.minutes
    end

    range = start_time...end_time
    RAILS_DEFAULT_LOGGER.info range.inspect

    set = []
    Tweenumerator.new(current_user.twitter).each do |tweet|
      time = Time.parse(tweet["created_at"])
      break if time < range.first
      set << tweet if range.include?(time)
    end
    render :json => set, :callback => params[:callback]
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
