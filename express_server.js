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

app.get("/", (req, res) => {
  res.end("Hello!");
  console.log(req.cookies)
})

app.get("/urls", (req, res) => {
  let templateVars = { 
    username: req.cookies["userName"],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["userName"],
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    username: req.cookies["userName"],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id.toUpperCase()]
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.status(301).redirect(longURL);
})

app.get("/urls/:id/delete", (req, res) => {
  console.log(req.params.id)
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
})

app.post("/login", (req, res) => {
  res.cookie('userName', req.body.username);
  res.redirect('/urls');
})

app.post("/logout", (req, res) => {
  res.clearCookie('userName');
  res.redirect('/urls');
})

app.post("/urls/create", (req, res) => {
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL
  res.redirect(`/urls`)
})


app.post("/urls/:id", (req, res) => {
  let updatedLongURL = req.body.updatedLongURL;
  let shortURL = req.params.id;
  urlDatabase[shortURL] = updatedLongURL;
  res.redirect('/urls');
})

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