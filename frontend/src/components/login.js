/* eslint-disable no-alert */
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/form.css'

const login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const logOut = async () => {
    const { data: response } = await axios.post('/account/logout')
    if (response === 'user has logged out') {
      // setLoginStatus(false)
    } else {
      alert('not able to log out')
    }
  }

  const logIn = async () => {
    const { data } = await axios.post('/account/login', { username, password })
    if (data === 'user logged in successfully') {
      navigate('/spotify/login')
      window.location.reload()
    } else {
      alert('user was not able to log in')
    }
  }

  return (
    <div className="login">
      <h1>Log In page</h1>
      <div className="username">
        <i className="fas fa-address-card" />
        <input
          placeholder="Enter username"
          onChange={e => setUsername(e.target.value)}
        />
      </div>
      <div className="password">
        <i className="fas fa-credit-card" />
        <input
          placeholder="Enter password"
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      <br />
      <button className="login" type="button" onClick={logIn}>
        Log In
      </button>
      <h5 className="horizontalP">
        <span className="horizontalP">or</span>
      </h5>
      <button
        className="signup"
        type="button"
        onClick={() => navigate('/signup')}
      >
        Sign up
      </button>
    </div>
  )
}

export default login
