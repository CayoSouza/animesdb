require('dotenv').config()
const express = require('express')
const db = require('./db/queries')
const request = require('request')
const rp = require('request-promise')
const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')
const initPassport = require('./passport-config.js')

initPassport(passport, 
  async email => {
    return rp(process.env.BASE_URL + '/users/email/' + email)
    .then(user => { return user != null && user.length > 0 ? JSON.parse(user) : null }) 
    .catch((err) => {
      console.log(err); 
      return null;
    });
  },
  async id => {
    return rp(process.env.BASE_URL + '/users/' + id)
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

app.get('/', (req, res) => {
  res.render('index.ejs');
})

app.get('/login', (req, res) => {
  res.render('login.ejs');
})

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', (req, res) => {
  res.render('register.ejs');
})

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  request.post({
    'headers': { 'content-type': 'application/json' },
    'url': process.env.BASE_URL + '/users',
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



//REST API

app.get('/users', db.getUsers)
app.get('/users/:id', db.getUserById)
app.get('/users/email/:email', db.getUserByEmail)
app.post('/users', db.createUser)

// app.put('/users/:id', db.updateUser)
// app.delete('/users/:id', db.deleteUser)


app.listen(process.env.PORT, () => {
  console.log(`App running on port ${process.env.PORT}`)
})
