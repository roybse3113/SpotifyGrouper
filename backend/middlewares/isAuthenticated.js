const isAuthenticated = (req, res, next) => {
  console.log(req.session.user)
  if (req.session.user && req.session.username.length !== 0) {
    next()
  } else {
    next(new Error('un-authenticated'))
  }
}

module.exports = isAuthenticated
