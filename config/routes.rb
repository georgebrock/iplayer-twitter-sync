ActionController::Routing::Routes.draw do |map|
  map.resources :tweets, :only => [:index]
end
