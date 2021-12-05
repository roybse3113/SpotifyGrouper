import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { set } from 'mongoose'
import GroupPage from './group'

const home = () => {
  const [user, setUser] = useState({})
  const [data, setData] = useState([])
  const [currGroup, setCurrGroup] = useState({})
  const [members, setMembers] = useState([])
  const [artists, setArtists] = useState([])
  const [mostPlayed, setMostPlayed] = useState([])
  const [commPlaylist, setCommPlaylist] = useState([])
  const [recSongs, setRecSongs] = useState([])
  const [showGroup, setShowGroup] = useState(false)
  const [inGroup, setInGroup] = useState(false)
  const logOut = async () => {
    const { data: response } = await axios.post('/account/logout')
    if (response === 'user has logged out') {
      console.log('logged out')
      // setLoginStatus(false)
    } else {
      alert('not able to log out')
    }
  }

  const updateAvailability = async () => {
    const { data: response } = await axios.post('/account/available')
    alert(response)
  }

  const displayGroup = async group => {
    console.log(group._id)
    const id = group._id
    const { data: response } = await axios.post('/group/member', {
      id,
    })
    setCurrGroup(group)
    setShowGroup(true)
    console.log('response', response)
    if (response === 'yes') {
      setInGroup(true)
    } else {
      setInGroup(false)
    }
  }

  const join = async () => {
    console.log(currGroup._id)
    const { data: response } = await axios.post('/group/join', {
      id: currGroup._id,
    })
    alert(response)
  }

  const selectedGroup = () => {
    let curr = {}
    data.forEach(g => {
      console.log(currGroup)
      if (g._id === currGroup._id) curr = g
    })
    if (inGroup) {
      return (
        <GroupPage
          currGroup={curr}
          user={user}
          showGroup={showGroup}
          setShowGroup={setShowGroup}
          setInGroup={setInGroup}
        />
      )
    }
    return (
      <div>
        <button type='button' onClick={() => join()}>
          Join
        </button>
        <button type='button' onClick={() => setShowGroup(false)}>
          Close
        </button>
      </div>
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

      const { data: response } = await axios.get('/account/getAvailableCount')
      if (response === 'enough users') {
        await axios.post('/group/match')
      }

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
      <button type='button' onClick={() => updateAvailability()}>
        Want to Match? Click Me
      </button>
      <button className='submit' type='button' onClick={() => logOut()}>
        Log Out
      </button>
    </div>
  )
}

export default home
