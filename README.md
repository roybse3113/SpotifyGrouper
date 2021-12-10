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
For this final iteration, I worked on mainly connecting the front-end to the back-end. Having already implemented most of the backend, I found a few flaws with the backend. Specifically, I had initially set out to use a separate Song schema for the mongoose (MongoDB) in order to keep track of each song's id, name, and artists. However, this became a bit complicated when trying to iterate through each song to either update an attribute like the song's number of votes, or adding songs to a list to send through a HTTP request. I modified the song schema simply into the notion of an object which had the same attributes as a song (numVotes, voters, name, id, artists) in order to prevent asynchronous programming issues. I also reworked the logic behind group matching between users. I utilized a k-combinations algorithm to get all groups of k members to check if they all shared at least 3 followed artists. This particular threshold could be altered, however, to better represent matchmatching to group users more accurately. Ideally, I would set a threshold on the shared top artists, which better indicates the music a user listens to, but with limited spotify accounts with sufficient data, I simplified this for the working demo to depend on shared following artists.
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

Utilizing the specified group matchmaking algorithm, if there are at least 3 users who ready to match, then the algorithm checks to see if there are at least some threshold number of users who share at least 3 followed artists on Spotify. If so, the group can be made.

![image](https://user-images.githubusercontent.com/79131282/144791638-91bcaa95-2824-479f-ad45-cf63776ab84c.png)
![image](https://user-images.githubusercontent.com/79131282/144791670-efbfe291-7416-48be-9dce-843181013df9.png)

In terms of the shared artists within the group, there are two main functions. First to make a recommended playlist means to utilize the Spotify API request to take some array of artists and some minimum level of popularity and create a playlist of recommended songs based off of these specifications. The other is to make a popular playlist which takes the most popular songs from these shared artists and creates a playlist in your account. Both of these functions are ways for the user to add playlists based off of artists they share with other users.

![image](https://user-images.githubusercontent.com/79131282/144791831-ad9e9eca-cd2d-491e-8ecc-5fde5b8dea7d.png)

For the group's most played songs, this is kept track of my using a map to store the occurrences of the songs from the top tracks from each user in the group. This way, there is a functionality for each user to make a playlist based off of the most played songs in the group.

![image](https://user-images.githubusercontent.com/79131282/144791924-579fd5b8-3578-4c5c-893e-72a7b2e3b88c.png)

This map is part of the group schema in the database

![image](https://user-images.githubusercontent.com/79131282/144792001-74849bfe-2b83-4ffb-9045-2641f80cdc78.png)

When users join or leave a group, the members and the top tracks map in the group schema reflects these changes and updates the occurences of the songs also accounting for the added or dropped user's top tracks.

![image](https://user-images.githubusercontent.com/79131282/144792185-e4668809-d35e-472a-9bf7-1d5a8afd31a1.png)
![image](https://user-images.githubusercontent.com/79131282/144792276-55e4cecc-cce8-47c3-a582-32fe66447bae.png)

Once a user leaves the group, they can join, if compatible. That is, if they share at least the shared followed artists as stored in the group schema among the users that are already in that group.

![image](https://user-images.githubusercontent.com/79131282/144792202-9fb754f3-bbb2-4815-b27b-bba9a13bf3ec.png)

Alas, the recommendation feature!

![image](https://user-images.githubusercontent.com/79131282/144792421-0bd7299a-4e47-46b8-9ea1-5d7724bd5103.png)

1. Search for songs

![image](https://user-images.githubusercontent.com/79131282/144792472-e82bfebf-1c2d-4d86-90c0-d72a43b02cf3.png)

2. Recommend it to the group!

![image](https://user-images.githubusercontent.com/79131282/144792521-91be181e-037e-43a0-98a7-0b200cc534e8.png)

3. If the other members of the group like it, it'll be added to the community playlist!

![image](https://user-images.githubusercontent.com/79131282/144792565-6e0eac51-5ead-473e-8483-625728386225.png)

4. Otherwise, the song will be removed from the recommended playlist if enough users downvote it.

Finally, what if there are multiple groups? Can they have the same exact users? No. The backend was designed to prevent from groups being made if the same exact users in a group are already part of another group. Hence, so long as there is at least one unique/different user who share the threshold number of followed artists with the others, another group can be made!























