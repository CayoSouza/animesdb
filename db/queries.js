require('dotenv').config()
const Pool = require('pg').Pool
const bcrypt = require('bcrypt')

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
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
    res.status(200).json(results.rows[0])
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

const createUser = async (req, res) => {
  const { email, password } = req.body
  console.log(req.body)

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    pool.query('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
    [email, hashedPassword], (error, results) => {
        if (error) {
          throw error
        }
        res.status(201).send({
          message: 'User successfully created',
          created : results.rows[0]
        })
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

//ANIMES

const getAnimes = (req, res) => {
  pool.query('SELECT * FROM animes ORDER BY anime_id ASC', (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).json(results.rows)
  })
}

const getAnimeById = async (req, res) => {
  const { id } = req.params
  pool.query('SELECT * FROM animes WHERE anime_id = $1', 
  [id], (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).json(results.rows[0])
  })
}


//RATINGS
const getRatingsByUserId = async (req, res) => {
  const { id } = req.params
  pool.query('SELECT * FROM ratings WHERE user_id = $1', 
  [id], (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).json(results.rows[0])
  })
}

const getRatingsByAnimeIdAndUserId = async (req, res) => {
  const { anime_id, user_id } = req.params;
  pool.query('SELECT * FROM ratings WHERE anime_id = $1 and user_id = $2', 
  [anime_id, user_id], (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).json(results.rows[0])
  })
}

const rate = async (req, res) => {
  const { anime_id, user_id, score } = req.params;

  //TODO: should also be database wise
  const allowedRatings = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]
  if (!allowedRatings.find((s) => s == score)){
    return res.status(400).json({message: 'Score not allowed.'});
  }

  pool.query('INSERT INTO ratings(anime_id, user_id, score) VALUES($1, $2, $3)',
  [anime_id, user_id, score], (error, results) => {
    if (error) {
      console.log(error)
    }
    res.status(200);
  })
}

const getRatings = (req, res) => {
  pool.query('SELECT * FROM ratings ORDER BY user_id ASC', (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).json(results.rows)
  })
}


module.exports = {
  getUsers,
  getUserById,
  getUserByEmail,
  createUser,
  getAnimes,
  getAnimeById,
  getRatingsByUserId,
  getRatingsByAnimeIdAndUserId,
  rate,
  getRatings,
  // updateUser,
  // deleteUser,
}
