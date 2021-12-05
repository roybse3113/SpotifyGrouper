/* eslint-disable no-alert */
import React, { useState } from 'react'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import '../styles/home.css'
import '../styles/group.css'

const group = ({
  currGroup, user, setShowGroup, setInGroup,
}) => {
  const [artist, setArtist] = useState('')
  const [track, setTrack] = useState('')
  const [songs, setSongs] = useState([])
  const [showMembers, setShowMembers] = useState(false)
  const [showArtists, setShowArtists] = useState(false)
  const [showMostPlayedSongs, setShowMostPlayedSongs] = useState(false)
  const [showRecommendedSongs, setShowRecommendedSongs] = useState(false)
  const [showCommunityPlaylist, setShowCommunityPlaylist] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  let i = 0

  const upVote = async song => {
    const { data: response } = await axios.post('/group/upvoteSong', {
      groupId: currGroup._id,
      songId: song.id,
    })
    alert(response)
  }

  const downVote = async song => {
    const { data: response } = await axios.post('/group/downvoteSong', {
      groupId: currGroup._id,
      songId: song.id,
    })
    alert(response)
  }

  const leave = async () => {
    const { data: response } = await axios.post('/group/leave', {
      id: currGroup._id,
    })
    setInGroup(false)
    alert(response)
  }

  const popularPlaylist = async () => {
    const { data: response } = await axios.post(
      '/spotify/makePopularPlaylist',
      {
        groupID: currGroup._id,
      },
    )
    if (response !== 'created playlist') alert('error making playlist')
    else alert('made playlist')
  }

  const recommendedPlaylist = async () => {
    const { data: response } = await axios.post(
      '/spotify/makeRecommendedPlaylist',
      {
        groupID: currGroup._id,
      },
    )
    if (response !== 'created playlist') alert('error making playlist')
    else alert('made playlist')
  }

  const communityPlaylist = async () => {
    const { data: response } = await axios.post(
      '/spotify/useCommunityPlaylist',
      {
        groupID: currGroup._id,
      },
    )
    alert(response)
  }

  const mostPlayedPlaylist = async () => {
    const { data: response } = await axios.post(
      '/spotify/makeMostPlayedPlaylist',
      {
        groupID: currGroup._id,
      },
    )
    if (response !== 'created playlist') alert('error making playlist')
    else alert('made playlist')
  }

  const displayGroup = () => {
    let contains = false
    currGroup.members.forEach(member => {
      if (member._id === user._id) contains = true
    })
    if (contains) {
      return (
        <div className="mainForm">
          <h5>
            Group:
            {' '}
            {currGroup._id}
          </h5>
          <div className="members">
            <button
              className="formButton"
              type="button"
              onClick={() => setShowMembers(!showMembers)}
            >
              Members
            </button>
            {showMembers
              ? currGroup.members.map(member => (
                <p key={uuidv4()} className="content">
                  {member.username}
                </p>
              ))
              : ''}
          </div>
          <div className="artists">
            <button
              className="formButton"
              type="button"
              onClick={() => setShowArtists(!showArtists)}
            >
              Artists
            </button>
            {showArtists ? (
              <div>
                {currGroup.artists.map(currArtist => (
                  <p key={uuidv4()} className="content">
                    <i className="fas fa-microphone" />
                    {' '}
                    {currArtist.name}
                  </p>
                ))}
                <button type="button" onClick={() => recommendedPlaylist()}>
                  Make Recommended Playlist
                </button>
                <button type="button" onClick={() => popularPlaylist()}>
                  Make Popular Playlist
                </button>
              </div>
            ) : (
              ''
            )}
          </div>
          <div className="mostPlayedSongs">
            <button
              className="formButton"
              type="button"
              onClick={() => setShowMostPlayedSongs(!showMostPlayedSongs)}
            >
              Most Played Songs
            </button>
            <div className="scrollable">
              {showMostPlayedSongs ? (
                <div>
                  {currGroup.mostPlayed.map(song => (
                    <p key={uuidv4()} className="content">
                      {++i}
                      {' '}
                      -
                      {' '}
                      <i className="fas fa-music" />
                      {' '}
                      {song.name}
                    </p>
                  ))}
                  <button type="button" onClick={() => mostPlayedPlaylist()}>
                    Make Most Played Playlist
                  </button>
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
          <div className="recommendedSongs">
            <button
              className="formButton"
              type="button"
              onClick={() => setShowRecommendedSongs(!showRecommendedSongs)}
            >
              Recommended Songs
            </button>
            <div className="scrollable">
              {showRecommendedSongs
                ? currGroup.recommendedSongs.map(song => (
                  <div key={uuidv4()} className="recommendedSong">
                    <p className="content">
                      <i className="fas fa-music" />
                      {' '}
                      {song.name}
                    </p>
                    <p className="content">
                      <i className="fab fa-gratipay" />
                      {song.numVotes}
                    </p>
                    <button
                      className="vote"
                      type="button"
                      onClick={() => upVote(song)}
                    >
                      <i className="fas fa-thumbs-up" />
                    </button>
                    <button
                      className="vote"
                      type="button"
                      onClick={() => downVote(song)}
                    >
                      <i className="fas fa-thumbs-down" />
                    </button>
                  </div>
                ))
                : ''}
            </div>
          </div>
          <div className="communityPlaylist">
            <button
              className="formButton"
              type="button"
              onClick={() => setShowCommunityPlaylist(!showCommunityPlaylist)}
            >
              Community Playlist
            </button>
            {showCommunityPlaylist ? (
              <div>
                {currGroup.communityPlaylist.map(song => (
                  <p key={uuidv4()} className="content">
                    <i className="fas fa-music" />
                    {song.name}
                  </p>
                ))}
                <button type="button" onClick={() => communityPlaylist()}>
                  Make Community Playlist
                </button>
              </div>
            ) : (
              ''
            )}
          </div>
        </div>
      )
    }
    return ''
  }

  const search = async () => {
    const { data: response } = await axios.post('/spotify/search', {
      track,
      artist,
    })
    if (response === 'no results found') {
      alert('no results found')
    } else {
      const uniqueSongs = []
      response.forEach(song => {
        if (uniqueSongs.length > 0) {
          let unique = true
          uniqueSongs.forEach(curr => {
            if (curr.name === song.name) {
              if (curr.artists.length === song.artists.length) {
                let diff = false
                curr.artists.forEach(a => {
                  if (!song.artists.includes(a)) diff = true
                })
                if (!diff) unique = false
              }
            }
          })
          if (unique) uniqueSongs.push(song)
        } else {
          uniqueSongs.push(song)
        }
      })
      setSongs(uniqueSongs)
    }
  }

  const recommend = async song => {
    const groupID = currGroup._id
    const songName = song.name
    const songID = song.id
    const { data: response } = await axios.post('/spotify/recommendSong', {
      songName,
      songID,
      groupID,
    })
    if (response !== 'recommended to group') {
      alert('error reccomending song')
    }
  }

  return (
    <div className="groupForm">
      {displayGroup()}
      <button className="searchButton" type="button" onClick={() => setShowSearch(!showSearch)}>
        <i className="fas fa-search" />
        {' '}
        Search
      </button>
      {showSearch ? (
        <div className="searchForm">
          <div className="searchInput">
            <h5>
              Spotify Search
              {' '}
              <i className="fas fa-eye" />
            </h5>
            <div className="search">
              <div className="track">
                <input
                  className="track"
                  placeholder="Track"
                  onChange={e => setTrack(e.target.value)}
                />
              </div>
              <div className="artist">
                <input
                  placeholder="Artist"
                  onChange={e => setArtist(e.target.value)}
                />
              </div>
            </div>
            <br />
            <button className="look" type="button" onClick={() => search()}>
              Search
            </button>
          </div>
          <div className="results">
            {songs.length > 0
              ? songs.map(song => (
                <button
                  key={uuidv4()}
                  className="songOption"
                  type="button"
                  onClick={() => recommend(song)}
                >
                  <div>
                    <p>
                      {' '}
                      <i className="fas fa-music" />
                      {' '}
                      {song.name}
                    </p>
                    <hr />
                    {song.artists.map(a => (
                      <p key={uuidv4()}>
                        <i className="fas fa-microphone" />
                        {a}
                      </p>
                    ))}
                  </div>
                </button>
              ))
              : ''}
          </div>
        </div>
      ) : ''}
      <br />
      <button className="leave" type="button" onClick={() => leave()}>
        Leave Group
      </button>
      <button className="closer" type="button" onClick={() => setShowGroup(false)}>
        Close
      </button>
    </div>
  )
}

export default group
