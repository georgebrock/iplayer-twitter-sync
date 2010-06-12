# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  helper :all # include all helpers, all the time
  protect_from_forgery # See ActionController::RequestForgeryProtection for details

  before_filter :load_remember_token
  def load_remember_token
    cookies[:remember_token] = params[:remember_token] if params[:remember_token]
  end
end
