# SpotifyGrouper

Description: Spotify-Grouper is an application that focuses on allowing users to log in to their Spotify Accounts and gain access to collaborative/group funcionalities in the database of other users. Primarily, based on preferences of artists, music, and etc, users are put into groups which offers a range of functionalities (i.e, recommended artists, playlists, collaborative group playlists, etc)

Milestone #1 (11/22):
I mainly focused on setting the project up, primarily working on the back-end. Specifically, I made to sure first plan out the way in which I wanted to structure the schema (users, groups), in terms of how the database of users would ultimately be put into groups based on music/artist preferences after logging into Spotify accounts. I will focus on implementing this grouping functionality/logic for milestone #2, but I did work on setting up the Spotify API in terms of getting user information after connecting to Spotify, getting top artists, playlists, and etc.
* Set up the routes for requests (account, spotify)
* Set up the models (user and group schema)
* Worked on understanding the Spotify API and getting it connected to the spotify router for requests
  * Specifically utilized the following methods: getting followed artists, user info, playlists, etc
* Structured the express server (server.js) in terms of middlewares, routers, cookie-session, and database (MongoDB)

Milestone #2 (11/30):
For this milestone, I focused on finishing most of the backend. Specifically, I worked on finishing the Spotify API router (containing all the relevant get/post requests for making different types of playlists), updated the user/group/song schema, and updated the group router in terms of get/post requests (i.e. leaving, joining, upvoting/downvoting songs, and making community playlists). I plan on finalizing the back end and connecting it to the front-end for the next week.
* Added the song schema to keep track of a song's title/name and id in Spotify, as well as the voters (id of users who down/up voted this song in order to prevent the same user from voting multiple times on the same song
* Added the recommend post request for users in groups to recommend candidate songs for the community playlist
* Added the upvote/downvote post request for users in groups 
 * Once half of a group upvotes/agrees on a song recommendation, it is added to the community/group playlist
* Updated the group schema to keep track of the recommended songs and community playlists
* Updated the user schema to keep track of the groups they are in
* In adding post/get requests for the Spotify router, I added a way to make different playlists (i.e. most popular songs among the users in the group or the most played tracks among the users in the group)
