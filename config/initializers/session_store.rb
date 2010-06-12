# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_iplayer-sync_session',
  :secret      => '022e19c0794cf775bb7791e8858e26631d097e4f28ff829f65bee47d5a87bec3af4e487fdbff4f5dcf2491eabe5f59792e671addf9e46754149ccf95c4a9ca5f'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
