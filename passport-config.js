const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function init(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const user = await getUserByEmail(email)
    console.log('loggin user:', user);
    if (user == null) {
      return done(null, false, {message: 'User not found'})
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password' });
      }
    } catch (e) {
      return done(e);
    }
  }

  passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.user_id))
  passport.deserializeUser(async (id, done) => done(null,  await getUserById(id)))
}

module.exports = init;