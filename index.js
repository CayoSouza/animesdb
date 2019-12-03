require('dotenv').config()
const express = require('express')
const db = require('./db/queries')
const request = require('request')
const rp = require('request-promise')
const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')
const initPassport = require('./configs/passport-config')
const methodOverride = require('method-override')

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
app.use('/assets', express.static('assets'))
app.use(methodOverride('_method'))

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
  const { username, email, password } = req.body;
  request.post({
    'headers': { 'content-type': 'application/json' },
    'url': process.env.REST_BASE_URL + '/users',
    'body': JSON.stringify({ username, email, password })
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

app.get('/animes/:id', checkAuthenticated, async (req, res) => {
  const anime = await rp(process.env.REST_BASE_URL + '/animes/' + req.params.id)
    .then(animes => { return JSON.parse(animes) }) 
    .catch((err) => {
      console.log(err); 
      return null;
    });

  console.log('req.user =', req.user)
  const uri = process.env.REST_BASE_URL 
  + '/ratings/anime/' + req.params.id + '/user/' + req.user.user_id;
  console.log('uri =', uri)
  const userRating = await rp(uri)
    .then(userRating => { 
      return userRating != null && userRating.length > 0 ? 
        JSON.parse(userRating) : null
    }) 
    .catch((err) => {
      console.log(err); 
      return null;
    });
  
  console.log('anime =', anime);
  console.log('userRating =', userRating);
  res.render('anime.ejs', {
    user: req.user,
    anime: anime,
    userRating: userRating
  })
});

app.post('/animes/:id', checkAuthenticated, async (req, res) => {
  const { score } = req.body;
  const { user_id } = req.user;
  const { id } = req.params;
  console.log('id==',req.params.id)
  const uri = `/user/${user_id}/rate/anime/${id}/score/${score}`;
  console.log('uri =', uri);
  let options = {
    method: 'POST',
    uri: process.env.REST_BASE_URL + uri,
    json: true
  }
  await rp(options)
    .then(res.redirect('/')) 
    .catch(err => console.log);

    // res.redirect('/');
})

app.get('/anime/create', checkAuthenticated, (req, res) => {
  res.render('new.ejs', { user: req.user })
})

app.delete('/animes', async(req, res) => {
  const { anime_id } = req.body;
  const uri = `/animes/${anime_id}`;

  let options = {
    method: 'DELETE',
    uri: process.env.REST_BASE_URL + uri,
    json: true
  }

  await rp(options)
    .then(res.redirect('/')) 
    .catch(err => console.log);
})

app.post('/anime/create', async(req, res) => {
  const { name, sinopse, season } = req.body;
  const uri = '/animes';

  let options = {
    method: 'POST',
    uri: process.env.REST_BASE_URL + uri,
    json: true,
    body: {
      name: name,
      sinopse: sinopse,
      season: season
    }
  }

  await rp(options)
    .then(res.redirect('/')) 
    .catch(err => console.log);
})

//===================== REST API =====================//

//USERS
app.get('/rest/users', db.getUsers)
app.get('/rest/users/:id', db.getUserById)
app.get('/rest/users/email/:email', db.getUserByEmail)
app.post('/rest/users', db.createUser)

//ANIMES
app.get('/rest/animes', db.getAnimes)
app.post('/rest/animes', db.createAnime)
app.get('/rest/animes/:id', db.getAnimeById)
app.delete('/rest/animes/:id', db.deleteAnimeById)

//RATINGS
app.get('/rest/ratings/user/:id', db.getRatingsByUserId)
app.get('/rest/ratings/anime/:anime_id/user/:user_id', db.getRatingsByAnimeIdAndUserId)
app.post('/rest/user/:user_id/rate/anime/:anime_id/score/:score', db.rate)
app.get('/rest/ratings', db.getRatings)

// app.put('/users/:id', db.updateUser)
// app.delete('/users/:id', db.deleteUser)


app.listen(process.env.PORT, () => {
  console.log(`App running on port ${process.env.PORT}`)
})
