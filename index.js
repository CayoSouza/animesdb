const express = require('express')
const bcrypt = require('bcrypt')
const Pool = require('pg').Pool

const pool = new Pool({
  user: 'me',
  host: 'localhost',
  database: 'animesdb',
  password: 'password',
  port: 5432,
})

// const bodyParser = require('body-parser')
const app = express()
const db = require('./queries')
const port = 3000

// app.use(bodyParser.json())
// app.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// )

app.use(express.json())

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})


app.get('/users', db.getUsers)

// app.get('/users/:id', db.getUserById)

// app.post('/users', db.createUser)

app.post('/users', async (req, res) => {
  const { username, password } = req.body
  console.log(username, password)

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('hashedPw', hashedPassword)
    // const user = { username: req.body.username, password: hashedPassword }
    
    pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword], (error, results) => {
        if (error) {
          console.log(error)
          throw error
        }
        console.log(results)
        res.status(201).send(`User successfully created!`)
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
