import React, { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Routes,
} from 'react-router-dom'
import axios from 'axios'
import Signup from './components/signup'
import Login from './components/login'
import Home from './components/home'

const App = () => {
  return (
    <Router>
      <div>
        <br />
        <Routes>
          <Route exact path='/' element={<Home />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={<Login />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
