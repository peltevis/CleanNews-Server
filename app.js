const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const mysql = require('mysql');
const port = 8080; //TODO: env.port?

const db = mysql.createConnection ({
    host: 'localhost',
    user: 'cleannews',
    password: 'cleannews',
    database: 'cleannews'
});


// Db connection
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database: Ok');
});

global.db = db;
global.functions = {
    formatDate: (date) => {
        return date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();
    }
}
const {index, signup, loginRequest, error, logout} = require('./routes/index');
const {profile} = require('./routes/profile');

// Setting up express
app.set('port', port); // Set port
app.set('views', path.join(__dirname, 'views')); // views location for renderer
app.set('view engine', 'ejs'); // rendrer engine
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // incoming data format
app.use(express.static(path.join(__dirname, 'public'))); // set home location for express
app.use(session({
    secret: 'cleannews platform',
    resave: true,
    saveUninitialized: false
  }));



function requiresLogin(req, res, next) {
    if (req.session && req.session.userId) {
      return next();
    } else {
      var err = new Error('You must be logged in to view this page.');
      err.status = 401;
      return res.render('error', {error: err});
    }
}

// Requests
app.get('/', index);
app.get('/profile', requiresLogin, profile);
app.get('/error', error)
app.get('/logout', logout);
app.post('/signup', signup);
app.post('/login', loginRequest);

// Start app
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

