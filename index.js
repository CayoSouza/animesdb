require('dotenv').config()
const express = require('express')
const db = require('./db/queries')
const request = require('request')
const rp = require('request-promise')
const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')
const initPassport = require('./configs/passport-config')

initPassport(passport, 
  async email => {
    return rp(process.env.REST_BASE_URL + '/users/email/' + email)
    .then(user => { return user != null && user.length > 0 ? JSON.parse(user) : null }) 
    .catch((err) => {
      console.log(err); 
      return null;
    });
  },
  async id => {
    return rp(process.env.REST_BASE_URL + '/users/' + id)
    .then(user => { return user != null && user.length > 0 ? JSON.parse(user) : null }) 
    .catch((err) => {
      console.log(err); 
      return null;
    });
  }
);

const app = express()

app.set('view-engine', 'ejs');
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.get('/', checkAuthenticated, async(req, res) => {
  const user = req.user;
  const animes = await rp(process.env.REST_BASE_URL + '/animes')
    .then(animes => { return JSON.parse(animes) }) 
    .catch((err) => {
      console.log(err); 
      return null;
    });
  console.log('req.user =', req.user)
  console.log('animes =', animes)
  res.render('index.ejs', {
    user: user, 
    animes: animes
  })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs');
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/login');
})

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs');
})

app.post('/register', checkNotAuthenticated, (req, res) => {
  const { name, email, password } = req.body;
  request.post({
    'headers': { 'content-type': 'application/json' },
    'url': process.env.REST_BASE_URL + '/users',
    'body': JSON.stringify({ name, email, password })
  }, (error, response, body) => {
    if (error) {
      console.dir(error);
      res.redirect('/register');
    }
    console.dir(JSON.parse(body));
    res.redirect('/login');
  });
});


function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  console.log('User must be logged in!')
  return res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  return next();
}

app.get('/animes/:id', async (req, res) => {
  const anime = await rp(process.env.REST_BASE_URL + '/animes/' + req.params.id)
    .then(animes => { return JSON.parse(animes) }) 
    .catch((err) => {
      console.log(err); 
      return null;
    });
  
  console.log('anime =', anime);
  res.render('anime.ejs', {anime: anime})
});


//REST API

//USERS
app.get('/rest/users', db.getUsers)
app.get('/rest/users/:id', db.getUserById)
app.get('/rest/users/email/:email', db.getUserByEmail)
app.post('/rest/users', db.createUser)

//ANIMES
app.get('/rest/animes', db.getAnimes)
app.get('/rest/animes/:id', db.getAnimeById)


// app.put('/users/:id', db.updateUser)
// app.delete('/users/:id', db.deleteUser)


app.listen(process.env.PORT, () => {
  console.log(`App running on port ${process.env.PORT}`)
})
