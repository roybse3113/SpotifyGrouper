# SpotifyGrouper

Description: Spotify-Grouper is an application that focuses on allowing users to log in to their Spotify Accounts and gain access to collaborative/group funcionalities in the database of other users. Primarily, based on preferences of artists, music, and etc, users are put into groups which offers a range of functionalities (i.e, recommended artists, playlists, collaborative group playlists, etc)

Milestone #1 (11/22):
I mainly focused on setting the project up, primarily working on the back-end. Specifically, I made to sure first plan out the way in which I wanted to structure the schema (users, groups), in terms of how the database of users would ultimately be put into groups based on music/artist preferences after logging into Spotify accounts. I will focus on implementing this grouping functionality/logic for milestone #2, but I did work on setting up the Spotify API in terms of getting user information after connecting to Spotify, getting top artists, playlists, and etc.
* Set up the routes for requests (account, spotify)
* Set up the models (user and group schema)
* Worked on understanding the Spotify API and getting it connected to the spotify router for requests
* Structured the express server (server.js) in terms of middlewares, routers, cookie-session, and database (MongoDB)
