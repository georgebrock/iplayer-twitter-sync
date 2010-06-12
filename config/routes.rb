ActionController::Routing::Routes.draw do |map|
  map.resources :tweets, :only => [:index]
  map.root :controller => "welcome"
end
