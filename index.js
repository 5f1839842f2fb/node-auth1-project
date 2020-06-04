const express = require('express');
const server = express();
const db = require('./data/dbaccess.js')

const bcrypt = require('bcrypt');
const saltRounds = 10;

const session = require('express-session');

server.use(
  session({
    name: 'node-auth1-project',
    secret: 'banana-man',
    cookie: {
      maxAge: false
    },
    httpOnly: true,
    resave: false,
    saveUninitialized: false,
  })
);

server.use(express.json());

server.post('/api/register', (req, res) => {
  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    db.register(req.body.username, hash)
    .then(response => res.status(200).send(response))
    .catch(error => console.log(error))
  });
})

server.post('/api/login', (req, res) => {
  db.login(req.body.username).then(response => {
    bcrypt.compare(req.body.password, response.password, (err, result) => {
      if (result) {
        req.session.name = req.body.username;
        console.log(`${req.body.username} logged in`)
        res.status(200).send("Logged in!")
      }
      else {
        res.status(401).send("Invalid credentials")
      }
    })
  })
})

server.get('/logout', (req, res) => {
  if (req.session) {
    console.log(`${req.session.name} logged out`)
    req.session.destroy()
    res.status(200).send("Logged out!")
  }
})

server.get('/greet', (req, res) => {
  console.log(req.session)
  res.send(`hello ${req.session.name}`)
})

const protecc = (req, res, next) => {
  if (req.session.name) {
    next()
  }
  else {
    res.status(401).send("Not logged in")
  }
}

server.get('/api/users', protecc, (req, res) =>{
  db.users().then(response => res.status(200).send(response))
})

server.listen(3000, () => {
  console.log('listening on 3000');
});