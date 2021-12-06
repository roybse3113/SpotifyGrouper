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

Demo (12/5):
For this final iteration, I worked on mainly connecting the front-end to the back-end. Having already implemented most of the backend, I found a few flaws with the backend. Specifically, I had initially set out to use a separate Song schema for the mongoose (MongoDB) in order to keep track of each song's id, name, and artists. However, this became a bit complicated when trying to iterate through each song to either update an attribute like the song's number of votes, or adding songs to a list to send through a HTTP request. I modified the song schema simply into the notion of an object which had the same attributes as a song (numVotes, voters, name, id, artists) in order to prevent asynchronoug programming issues. I also reworked the logic behind group matching between users. I utilized a k-combinations algorithm to get all groups of k members to check if they all shared at least 3 followed artists. This particular threshold could be altered, however, to better represent matchmatching to group users more accurately. Ideally, I would set a threshold on the shared top artists, which better indicates the music a user listens to, but with limited spotify accounts with sufficient data, I resorted to simplified the working demo to depend on shared following artists.
* Worked on the front-end components (group, form for login/signup, home page, router to different pages, and connecting the log in to the spotify authentication)
* Specify that groups can only be matched if the users in the group do not exactly match the members of another group (must be a proper subset of another group, or any other group must be a proper subset of it).
* Group matching algorithm was revised to get all k-combinations (k = 3) and check whether any specified group of users shared at least a threshold number of followed artists in order to determine whether there was a matched group to be made.
* Revised most of backend to use song JS objects instead of song schemas.
* Revised Group artist list to hold artist JS objects (id, name) instead of just string id in most of backend
* Developed front-end with react to implement the back-end features/requests with user input on the browser website application
* Styled with HTML, CSS, bootstrap, and font awesome icons

Logging in requires authentication/connection with Spotify in order to keep track of data (top tracks, top artists, followed artists, making playlists, playing songs, etc)

![image](https://user-images.githubusercontent.com/79131282/144791133-eafad156-e152-471d-bcb6-493a51e88cfb.png)

With access to such spotify information, users can be added as schema to the mongoose DB.

![image](https://user-images.githubusercontent.com/79131282/144790994-16a98ce7-2825-48dc-b5c5-1d3e372e7bb8.png)

![image](https://user-images.githubusercontent.com/79131282/144791257-b35a04d7-da87-43ae-8ab8-89e39a74c9d6.png)

The main way for users to indicate that they want to join or are ready to matchmake with other users is the match availability state.
![image](https://user-images.githubusercontent.com/79131282/144791338-391975f8-8f42-4a03-9a6a-de4abc84a18b.png)
![image](https://user-images.githubusercontent.com/79131282/144791350-7625702e-31a9-40ff-9524-d058724cd562.png)



