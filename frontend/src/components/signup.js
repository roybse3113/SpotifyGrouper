/* eslint-disable no-alert */
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

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
      // if sign up, also log in simultaneously
      await axios.post('/account/login', { username, password })
      navigate('/')
    } else {
      alert('user was not created')
    }
  }
  return (
    <div className='signup'>
      <h1>Sign up page</h1>
      <div className='username'>
        <p>username:</p>
        <input onChange={e => setUsername(e.target.value)} />
      </div>
      <div className='password'>
        <p>password:</p>
        <input onChange={e => setPassword(e.target.value)} />
      </div>
      <br />
      <button className='submit' type='button' onClick={createUser}>
        Sign Up
      </button>
      <p>
        Already have an account? <Link to='/login'>login</Link>{' '}
      </p>
    </div>
  )
}

export default signup
