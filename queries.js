const Pool = require('pg').Pool
const bcrypt = require('bcrypt')

const pool = new Pool({
  user: 'me',
  host: 'localhost',
  database: 'animesdb',
  password: 'password',
  port: 5432,
})

const getUsers = (req, res) => {
  pool.query('SELECT * FROM users ORDER BY user_id ASC', (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).json(results.rows)
  })
}

const getUserById = async (req, res) => {
  const { id } = req.params
  pool.query('SELECT * FROM users WHERE user_id = $1', 
  [id], (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).json(results.rows)
  })
}

const getUserByEmail = async (req, res) => {
  const { email } = req.params
  pool.query('SELECT * FROM users WHERE email = $1', 
  [email], (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).json(results.rows[0])
  })
}

// const getUserById = (req, res) => {
//   const id = parseInt(req.params.user_id)

//   pool.query('SELECT * FROM users WHERE user_id = $1', [id], (error, results) => {
//     if (error) {
//       throw error
//     }
//     res.status(200).json(results.rows)
//   })
// }

const createUser = async (req, res) => {
  const { email, password } = req.body
  console.log(req.body)

  try {
    const hashedPassword = await bcrypt.hash(password)
    console.log('hashedPw', hashedPassword)
    // const user = { email: req.body.email, password: hashedPassword }
    
    pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashedPassword], (error, results) => {
        if (error) {
          throw error
        }
        res.status(201).send(`User added with ID: ${results}`)
    })
  } catch {
    res.status(500).send()
  }

}

// const updateUser = (req, res) => {
//   const id = parseInt(req.params.user_id)
//   const { email, password } = req.body

//   pool.query(
//     'UPDATE users SET email = $1, password = $2 WHERE user_id = $3',
//     [email, password, id],
//     (error, results) => {
//       if (error) {
//         throw error
//       }
//       res.status(200).send(`User modified with ID: ${id}`)
//     }
//   )
// }

// const deleteUser = (req, res) => {
//   const id = parseInt(req.params.user_id)

//   pool.query('DELETE FROM users WHERE user_id = $1', [id], (error, results) => {
//     if (error) {
//       throw error
//     }
//     res.status(200).send(`User deleted with ID: ${id}`)
//   })
// }

module.exports = {
  getUsers,
  getUserById,
  getUserByEmail,
  // getUserById,
  createUser,
  // updateUser,
  // deleteUser,
}
