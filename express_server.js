var express = require('express');
var app = express();

//will allow us to access POST request params, such as req.body.longURL
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.set("view engine", "ejs");

var PORT = process.env.port || 8080;

var urlDatabase = {
  "B2XVN2": "http://www.lighthouselabs.ca",
  "9SM5XK": "http://www.google.com"
};

var users = {};

app.get("/", (req, res) => {
  res.end("Hello!");
})

app.get("/urls", (req, res) => {
  let templateVars = { 
    user_id: req.cookies["user_id"],
    urls: urlDatabase 
  };
  console.log(users);
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  let templateVars = {
    user_id: req.cookies["user_id"],
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    user_id: req.cookies["user_id"],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id.toUpperCase()]
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.status(301).redirect(longURL);
});

app.get("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
})

app.get("/register", (req, res) => {
  let templateVars = {
    user_id: req.cookies["user_id"]
  }
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user_id: req.cookies["user_id"]
  }
  res.render("login", templateVars);
})

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("You must enter an email and password");
  }
  if (checkEmailExists(req.body.email)){
    return res.status(400).send("This email already exists");
  }
  else {
    let randomId = generateRandomString();
    users[randomId] = {id: randomId, email: req.body.email, password: req.body.password};
    res.cookie("user_id", req.body.email);
    res.redirect("/urls"); 
  }
});

app.post("/login", (req, res) => {
  if (checkEmailExists(req.body.email) && checkPassword(req.body.password)) {
    res.cookie('user_id', req.body.email);
    res.redirect("/urls");
  }
  else {
    return res.status(403).send('Incorrect login credentials')
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post("/urls/create", (req, res) => {
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL
  res.redirect(`/urls`)
});


app.post("/urls/:id", (req, res) => {
  let updatedLongURL = req.body.updatedLongURL;
  let shortURL = req.params.id;
  urlDatabase[shortURL] = updatedLongURL;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example listening on ${PORT}!`);
});

function generateRandomString(){
  let res = ""
  let alphaNum = "0123456789ABCDEF"
  for (var i = 0 ; i < 6 ; i += 1) {
    res += alphaNum[Math.floor(Math.random() * 16)];
  }
  return res;
}

function checkEmailExists(email) {
  for (var prop in users) {
    var user = users[prop];
    if (!user || user.email === email) {
      return true;
    }
    else {return false;}
  }
}

function checkPassword(password){
  for (var prop in users) {
    var user = users[prop];
    if (user.password === password) {
      return true;
    }
    else {return false;}
  }
}
