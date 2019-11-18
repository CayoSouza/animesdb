if (process.env.NODE_ENV !== 'production' ) {
  require('dotenv').config()
}

const express = require('express')
const bcrypt = require('bcrypt')
const db = require('./queries')
const Pool = require('pg').Pool
const request = require('request')
const rp = require('request-promise')
const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')
const initPassport = require('./passport-config.js')

initPassport(passport, 
  async email => {
    return rp('http://localhost:3000/users/email/' + email)
    .then(user => { return user != null && user.length > 0 ? JSON.parse(user) : null }) 
    .catch((err) => {
      console.log(err); 
      return null;
    });
  },
  async id => {
    return rp('http://localhost:3000/users/' + id)
    .then(user => { return user != null && user.length > 0 ? JSON.parse(user) : null }) 
    .catch((err) => {
      console.log(err); 
      return null;
    });
  }
);

const pool = new Pool({
  user: 'me',
  host: 'localhost',
  database: 'animesdb',
  password: 'password',
  port: 5432,
})

// const bodyParser = require('body-parser')
const app = express()
const port = 3000

// app.use(bodyParser.json())
// app.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// )

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
    'url': 'http://localhost:3000/users',
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

// app.get('/users/:id', db.getUserById)

// app.post('/users', db.createUser)

app.post('/users', async (req, res) => {
  const { email, password } = req.body
  console.log(email, password)

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('hashedPw', hashedPassword)
    // const user = { email: req.body.email, password: hashedPassword }
    
    pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashedPassword], (error, results) => {
        if (error) {
          console.log(error)
          throw error
        }
        console.log(results)
        res.status(201).send({ message: 'User successfully created!' });
    })
  } catch {
    res.status(500).send()
  }

})

// app.put('/users/:id', db.updateUser)

// app.delete('/users/:id', db.deleteUser)


app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
