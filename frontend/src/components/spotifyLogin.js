/* eslint-disable no-alert */
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

const login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const logIn = async () => {
    const { data } = await axios.post('/account/login', { username, password })
    if (data === 'user logged in successfully') {
      navigate('/')
    } else {
      alert('user was not able to log in')
    }
  }

  useEffect(async () => {
    const { data } = await axios.get('/spotify/login')
  }, [])

  return (
    <div className='signup'>
      <h1>Log In page</h1>
      <div className='username'>
        <p>username:</p>
        <input onChange={e => setUsername(e.target.value)} />
      </div>
      <div className='password'>
        <p>password:</p>
        <input onChange={e => setPassword(e.target.value)} />
      </div>
      <br />
      <button className='submit' type='button' onClick={logIn}>
        Log In
      </button>
      <p>
        Do not already have an account? <Link to='/signup'>Sign up</Link>{' '}
      </p>
    </div>
  )
}

export default login
