/* eslint-disable no-alert */
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/form.css'

const signup = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const createUser = async () => {
    const { data } = await axios.post('/account/signup', {
      username,
      password,
    })
    if (data === 'user created') {
      navigate('/login')
    } else {
      alert('user was not created')
    }
  }
  return (
    <div className="login">
      <h1>Sign up page</h1>
      <div className="username">
        <i className="fas fa-address-card" />
        <input
          placeholder="username"
          onChange={e => setUsername(e.target.value)}
        />
      </div>
      <div className="password">
        <i className="fas fa-credit-card" />
        <input
          placeholder="password"
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      <br />
      <button className="login" type="button" onClick={createUser}>
        Sign Up
      </button>
      <h5 className="horizontalP">
        <span className="horizontalP">or</span>
      </h5>
      <button
        className="signup"
        type="button"
        onClick={() => navigate('/login')}
      >
        Login
      </button>
    </div>
  )
}

export default signup
