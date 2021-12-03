import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { set } from 'mongoose'
import GroupPage from './group'

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
  const [currGroup, setCurrGroup] = useState({
    _id: '',
    members: '',
    artists: '',
    mostPlayed: '',
    communityPlaylist: '',
    recommendedSongs: '',
    __v: '',
    mapTracks: '',
  })
  const [members, setMembers] = useState([])
  const [artists, setArtists] = useState([])
  const [mostPlayed, setMostPlayed] = useState([])
  const [commPlaylist, setCommPlaylist] = useState([])
  const [recSongs, setRecSongs] = useState([])
  const [showGroup, setShowGroup] = useState(false)
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
    setCurrGroup(group)
    setShowGroup(true)
  }

  const selectedGroup = () => {
    let curr = {}
    data.forEach(g => {
      if (g._id === currGroup._id) curr = g
    })
    return (
      <GroupPage
        currGroup={curr}
        user={user}
        showGroup={showGroup}
        setShowGroup={setShowGroup}
      />
    )
  }

  useEffect(() => {
    const intervalID = setInterval(async () => {
      // update user information as necessary
      // await axios.get('/spotify/refresh')
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
    }, 2000)
    return () => clearInterval(intervalID)
  }, [members])

  return (
    <div>
      {data.map(group => (
        <button
          type='button'
          key={group._id}
          onClick={() => displayGroup(group)}
        >
          {group._id}
        </button>
      ))}
      {showGroup ? selectedGroup() : ''}
      <h1>Title</h1>
      <button className='submit' type='button' onClick={logOut}>
        Log Out
      </button>
    </div>
  )
}

export default home
