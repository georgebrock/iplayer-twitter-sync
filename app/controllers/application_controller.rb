# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  helper :all # include all helpers, all the time
  protect_from_forgery # See ActionController::RequestForgeryProtection for details

  def authentication_succeeded(message = nil)
    redirect_to( (session[:source_url] || "/") + "?twitter_token=#{cookies[:remember_token]}" )
  end

  before_filter :store_location
  def store_location
    session[:source_url] = params[:source_url] if params[:source_url]
  end

  before_filter :load_remember_token
  def load_remember_token
    cookies[:remember_token] = params[:remember_token] if params[:remember_token]
  end
end
