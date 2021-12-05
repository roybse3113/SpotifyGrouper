/* eslint-disable no-alert */
import React, { useState } from 'react'
import axios from 'axios'

const group = ({ currGroup, user, setShowGroup, setInGroup }) => {
  const [artist, setArtist] = useState('')
  const [track, setTrack] = useState('')
  const [songs, setSongs] = useState([])

  const upVote = async song => {
    console.log('currGroup', currGroup._id)
    console.log(song.id)
    const { data: response } = await axios.post('/group/upvoteSong', {
      groupId: currGroup._id,
      songId: song.id,
    })
    alert(response)
  }

  const downVote = async song => {
    console.log('currGroup', currGroup._id)
    const { data: response } = await axios.post('/group/downvoteSong', {
      groupId: currGroup._id,
      songId: song.id,
    })
    alert(response)
  }

  const leave = async () => {
    console.log(currGroup._id)
    const { data: response } = await axios.post('/group/leave', {
      id: currGroup._id,
    })
    setInGroup(false)
    alert(response)
  }

  const displayGroup = () => {
    let contains = false
    currGroup.members.forEach(member => {
      if (member._id === user._id) contains = true
    })
    if (contains) {
      return (
        <div>
          <h4>Members</h4>
          {currGroup.members.map(member => (
            <p>{member.username}</p>
          ))}
          <h4>Artists</h4>
          {currGroup.artists.map(currArtist => (
            <p>{currArtist.name}</p>
          ))}
          <h4>Most Played Songs</h4>
          {currGroup.mostPlayed.map(song => (
            <p>{song.name}</p>
          ))}
          <h4>Recommended Songs</h4>
          {currGroup.recommendedSongs.map(song => (
            <div>
              <p>{song.name}</p>
              <p>{song.numVotes}</p>
              <button type='button' onClick={() => upVote(song)}>
                Up Vote
              </button>
              <button type='button' onClick={() => downVote(song)}>
                Down Vote
              </button>
            </div>
          ))}
          <h4>Community Playlist</h4>
          {currGroup.communityPlaylist.map(song => (
            <p>{song.name}</p>
          ))}
        </div>
      )
    }
    return ''
  }

  const popularPlaylist = async () => {
    const { data: response } = await axios.post(
      '/spotify/makePopularPlaylist',
      {
        groupID: currGroup._id,
      }
    )
    if (response !== 'created playlist') alert('error making playlist')
    else alert('made playlist')
  }

  const recommendedPlaylist = async () => {
    const { data: response } = await axios.post(
      '/spotify/makeRecommendedPlaylist',
      {
        groupID: currGroup._id,
      }
    )
    if (response !== 'created playlist') alert('error making playlist')
    else alert('made playlist')
  }

  const communityPlaylist = async () => {
    const { data: response } = await axios.post(
      '/spotify/useCommunityPlaylist',
      {
        groupID: currGroup._id,
      }
    )
    alert(response)
  }

  const mostPlayedPlaylist = async () => {
    const { data: response } = await axios.post(
      '/spotify/makeMostPlayedPlaylist',
      {
        groupID: currGroup._id,
      }
    )
    if (response !== 'created playlist') alert('error making playlist')
    else alert('made playlist')
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
    console.log('group', groupID)
    const songName = song.name
    console.log('name', song.name)
    const songID = song.id
    console.log(song.id)
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
    <div>
      {displayGroup()}
      <div className='search'>
        <div className='track'>
          <p>Track:</p>
          <input onChange={e => setTrack(e.target.value)} />
        </div>
        <br />
        <div className='artist'>
          <p>Artist:</p>
          <input onChange={e => setArtist(e.target.value)} />
        </div>
      </div>
      {songs.length > 0
        ? songs.map(song => (
            <button type='button' onClick={() => recommend(song)}>
              <div>
                <p>{song.name}</p>
                {song.artists.map(a => (
                  <p>{a}</p>
                ))}
              </div>
            </button>
          ))
        : ''}
      <br />
      <button type='button' onClick={() => mostPlayedPlaylist()}>
        Make Most Played Playlist
      </button>
      <button type='button' onClick={() => popularPlaylist()}>
        Make Popular Playlist
      </button>
      <button type='button' onClick={() => communityPlaylist()}>
        Make Community Playlist
      </button>
      <button type='button' onClick={() => recommendedPlaylist()}>
        Make Recommended Playlist
      </button>
      <button type='button' onClick={() => search()}>
        Search
      </button>
      <button type='button' onClick={() => leave()}>
        Leave
      </button>
      <button type='button' onClick={() => setShowGroup(false)}>
        Close
      </button>
    </div>
  )
}

export default group
