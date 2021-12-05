import React from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/form.css'

const navigationBar = ({ loginStatus, setLoginStatus, username }) => {
  const logOut = async () => {
    const { data: response } = await axios.post('/account/logout')
    if (response === 'user has logged out') {
      setLoginStatus(false)
    }
  }

  return (
    <nav className="navbar navbar-default">
      <div className="container-fluid">
        <div className="navbar-header">
          <a className="navbar-brand" href="/">
            <i className="fab fa-spotify" />
            {' '}
            Spotify Grouper
          </a>
        </div>
        <ul className="nav navbar-nav">
          <li className="active">
            <a href="/">Home</a>
          </li>
        </ul>
        <ul className="nav navbar-nav navbar-right">
          {loginStatus ? (
            <li>
              <a className="navbar-brand" href="/">
                <span className="glyphicon glyphicon-user" />
                {' '}
                Welcome,
                {' '}
                {username}
              </a>
            </li>
          ) : (
            <li>
              <Link to="/signup">
                <span className="glyphicon glyphicon-user" />
                {' '}
                Sign Up
              </Link>
            </li>
          )}
          {loginStatus ? (
            <li>
              <button
                type="button"
                className="navLogOut"
                onClick={() => logOut()}
              >
                <span className="glyphicon glyphicon-log-in" />
                {' '}
                Log out
              </button>
            </li>
          ) : (
            <li>
              <Link to="/login">
                <span className="glyphicon glyphicon-log-in" />
                {' '}
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default navigationBar
