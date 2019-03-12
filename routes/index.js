function index(req, res){
    res.render('login-form.ejs');
}

function loginRequest(req, res){
    if (req.body.username && req.body.password) {
        const username = req.body.username;
        const password = req.body.password;
        return login(username, password, req, res);
    }
}

function error(req, res, message){
    console.log("Error: " + message);
    var error = new Error(message);
    res.render('error', {error: error});
}

function login(username, password, req, res){
    if(validPassword(password) && validUsername(username)){
        return db.query(`SELECT id, password FROM users WHERE username = '${username}'`, (err, rows) => {
            if(err){
                console.log(err);
                return error(req, res, "Database error")
            }
            console.log("Starting log in:")
            if(rows.length > 0){
                if(rows[0].password === password){
                    //Login successful
                    req.session.userId = rows[0].id;
                    return res.redirect('/profile');
                }
                //Wrong password
                return error(req, res, "Wrong password");
            }
            //User not found
            return error(req, res, "User not found");
        });
        return 
    }
    //Invalid input
    return error(req, res, "Invalid input");
}

function logout(req, res, next) {
    if (req.session) {
      // delete session object
      req.session.destroy(function(err) {
        if(err) {
          return next(err);
        } else {
          return res.redirect('/');
        }
      });
    }
  }

function signup(req, res){
    if (req.body.email &&
        req.body.username &&
        req.body.password &&
        req.body.passwordConf) {
            const username = req.body.username;
            const password = req.body.password;
            const email = req.body.email;
        if(password === req.body.passwordConf && validEmail(email) && validUsername(username) && validPassword(password)){
            db.query(`INSERT INTO users (username, password, email) VALUES ('${username}', '${password}', '${email}');`, (err) => {
                if(err) {
                    return error(req, res, err.message);
                }
                //Lets try to login
                return login(username, password, req, res);
            })
        }
      }
}

function validEmail(email){
    //RFC 2822 al 99.99%, supongo que alcanza
    var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  return re.test(email);
}

function validUsername(username){
    if(username.length > 2 && username.length < 16){
        //TODO: We should also verify username is not taken
        return /^[0-9a-zA-Z_.-]+$/.test(username);
    }
}

function validPassword(password){
    return password.length > 6 && password.length < 20;
}
module.exports = {index: index,
                    signup: signup,
                    loginRequest: loginRequest,
                    logout: logout,
                    error: error}