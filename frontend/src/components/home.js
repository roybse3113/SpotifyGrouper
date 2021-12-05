/* eslint-disable no-alert */
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { Link, useNavigate } from 'react-router-dom'
import { set } from 'mongoose'
import GroupPage from './group'
import NavigationBar from './navigationBar'
import '../styles/home.css'

const home = () => {
  const [loginStatus, setLoginStatus] = useState(false)
  const [username, setUsername] = useState('')
  const [user, setUser] = useState({})
  const [data, setData] = useState([])
  const [currGroup, setCurrGroup] = useState({})
  const [members, setMembers] = useState([])
  const [showGroup, setShowGroup] = useState(false)
  const [showUserGroups, setShowUserGroups] = useState(false)
  const [showUserFollowedArtists, setShowUserFollowedArtists] = useState(false)
  const [showUserTopTracks, setShowUserTopTracks] = useState(false)
  const [inGroup, setInGroup] = useState(false)
  const [available, setAvailable] = useState(false)
  const navigate = useNavigate()

  const checkStatus = async () => {
    const { data: currUser } = await axios.get('/account/status')
    if (currUser !== 'not logged in') {
      setUsername(currUser.username)
      setLoginStatus(true)
    }
  }

  const updateAvailability = async () => {
    const { data: response } = await axios.post('/account/available')
    if (response === 'made available') setAvailable(true)
    else setAvailable(false)
  }

  const displayGroup = async group => {
    const id = group._id
    const { data: response } = await axios.post('/group/member', {
      id,
    })
    setCurrGroup(group)
    setShowGroup(true)
    if (response === 'yes') {
      setInGroup(true)
    } else {
      setInGroup(false)
    }
  }

  const join = async () => {
    const { data: response } = await axios.post('/group/join', {
      id: currGroup._id,
    })
    setShowGroup(false)
    alert(response)
  }

  const selectedGroup = () => {
    let curr = {}
    data.forEach(g => {
      if (g._id === currGroup._id) curr = g
    })
    if (loginStatus) {
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
        <div className="groupForm">
          <button className="join" type="button" onClick={() => join()}>
            Join
          </button>
          <button type="button" onClick={() => setShowGroup(false)}>
            Close
          </button>
        </div>
      )
    }
    return ''
  }

  const preForm = () => {
    if (loginStatus) {
      return (
        <div className="groupForm">
          <h5>
            Your Spotify Stats
            {' '}
            <i className="fab fa-spotify" />
          </h5>
          <div>
            <button
              className="formButton"
              type="button"
              onClick={() => setShowUserFollowedArtists(!showUserFollowedArtists)}
            >
              Followed Artists
            </button>
            {showUserFollowedArtists
              ? user.artistList.map(artist => (
                <p key={uuidv4()}>
                  <i className="fas fa-microphone" />
                  {' '}
                  {artist.name}
                </p>
              ))
              : ''}
          </div>
          <div>
            <button
              className="formButton"
              type="button"
              onClick={() => setShowUserGroups(!showUserGroups)}
            >
              Your Groups
            </button>
            {showUserGroups
              ? user.groups.map(group => (
                <p key={uuidv4()}>
                  <i className="fas fa-users" />
                  {' '}
                  {group}
                </p>
              ))
              : ''}
          </div>
          <div>
            <button
              className="formButton"
              type="button"
              onClick={() => setShowUserTopTracks(!showUserTopTracks)}
            >
              Your Top Tracks
            </button>
            {showUserTopTracks
              ? user.topTracks.map(track => (
                <div key={uuidv4()}>
                  <p>
                    <i className="fas fa-music" />
                    {' '}
                    {track.name}
                  </p>
                </div>
              ))
              : ''}
          </div>
          <h5>Group Match Availability</h5>
          <button
            className="availability"
            type="button"
            onClick={() => updateAvailability()}
          >
            {available ? (
              <i className="fas fa-user-friends" />
            ) : (
              <i className="fas fa-user-alt-slash" />
            )}
          </button>
        </div>
      )
    }
    return ''
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
      checkStatus()

      // navigate('/spotify/login')
      // window.location.reload()
    }, 2000)
    return () => clearInterval(intervalID)
  }, [members])

  return (
    <div>
      <NavigationBar
        loginStatus={loginStatus}
        setLoginStatus={setLoginStatus}
        username={username}
      />
      <ul>
        <li>
          <div className="groups">
            <div key={uuidv4()}>
              <button
                type="button"
                className="sample"
                key={uuidv4()}
              >
                Groups
              </button>
            </div>
            {data.map(group => (
              <div key={uuidv4()}>
                <button
                  type="button"
                  className="first"
                  key={uuidv4()}
                  onClick={() => displayGroup(group)}
                >
                  Group:
                  {' '}
                  {group._id}
                </button>
              </div>
            ))}
          </div>
        </li>
        <li>
          <div className="currGroup">
            {showGroup ? selectedGroup() : preForm()}
          </div>
        </li>
      </ul>
    </div>
  )
}

export default home
