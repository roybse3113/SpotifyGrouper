import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { set } from 'mongoose'

const home = () => {
  const [user, setUser] = useState({
    username: '',
    password: '',
    followedArtists: [],
    topTracks: [],
    topArtists: [],
    groups: [],
    _id: '',
    __v: '',
  })
  const [data, setData] = useState([])
  const [members, setMembers] = useState([])
  const [artists, setArtists] = useState([])
  const [mostPlayed, setMostPlayed] = useState([])
  const [commPlaylist, setCommPlaylist] = useState([])
  const [recSongs, setRecSongs] = useState([])
  const logOut = async () => {
    const { data: response } = await axios.post('/account/logout')
    if (response === 'user has logged out') {
      console.log('logged out')
      // setLoginStatus(false)
    } else {
      alert('not able to log out')
    }
  }

  // const displayGroups = groups => {
  //   const listMembers = []
  //   const listArtists = []
  //   const listMostPlayed = []
  //   const listCommPlaylist = []
  //   const listRecSongs = []
  //   groups.forEach(group => {
  //     group.members.forEach(member => {
  //       listMembers.push(member)
  //     })
  //     setMembers(listMembers)
  //     group.artists.forEach(artist => {
  //       listArtists.push(artist)
  //     })
  //     setArtists(listArtists)
  //     group.mostPlayed.forEach(song => {
  //       listMostPlayed.push(song)
  //     })
  //     setMostPlayed(listMostPlayed)
  //     group.communityPlaylist.forEach(song => {
  //       listCommPlaylist.push(song)
  //     })
  //     setCommPlaylist(listCommPlaylist)
  //     group.recommendedSongs.forEach(song => {
  //       listRecSongs.push(song)
  //     })
  //     setRecSongs(listRecSongs)
  //   })
  // }

  const displayGroup = group => {
    let contains = false
    group.members.forEach(member => {
      if (member._id === user._id) contains = true
    })
    if (contains) {
      return (
        <div>
          <h4>Members</h4>
          {group.members.map(member => (
            <p>{member.username}</p>
          ))}
          <h4>Artists</h4>
          {group.artists.map(artist => (
            <p>{artist}</p>
          ))}
          <h4>Most Played Songs</h4>
          {group.mostPlayed.map(song => (
            <p>{song}</p>
          ))}
          <h4>Recommended Songs</h4>
          {group.recommendedSongs.map(song => (
            <p>{song.name}</p>
          ))}
          <h4>Community Playlist</h4>
          {group.communityPlaylist.map(song => (
            <p>{song.name}</p>
          ))}
        </div>
      )
    }
    return ''
  }

  useEffect(() => {
    const intervalID = setInterval(async () => {
      // update user information as necessary
      await axios.get('/spotify/playlists')
      await axios.get('/spotify/topArtists')
      await axios.get('/spotify/topTracks')
      await axios.get('/spotify/followedArtists')
      const { data: curr } = await axios.get('/account/currentUser')
      setUser(curr)
      const { data: groups } = await axios.get('/group/groups')
      // displayGroups(groups)
      // console.log(members)
      setData(groups)
    }, 5000)
    return () => clearInterval(intervalID)
  }, [members])

  return (
    <div>
      {data.map(group => displayGroup(group))}
      <h1>Title</h1>
      <button className='submit' type='button' onClick={logOut}>
        Log Out
      </button>
    </div>
  )
}

export default home
