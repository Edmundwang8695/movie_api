const express = require('express'),
bodyParser = require('body-parser'),
uuid=require('uuid');

const morgan = require('morgan');
const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');
app.use(bodyParser.urlencoded({ extended: true }));

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());

app.use(morgan('common'));

app.get('/movies', (req, res) => {
    Movies.find()
      .then((Movies) => {
        res.status(201).json(Movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

app.get("/", (rep, res) =>{
    res.send("Welcome to my Movie API.")
});

app.get("/documentation", (rep, res) =>{
    res.sendFile("public/documentation.html", { root: __dirname});
});

app.get('/movies/:Title', (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((Movie) => {
        res.json(Movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

app.get("//movies/genres/:genre", (rep,res) =>{
    res.send("Successful GET request returning data on genres")
});

app.get("/sign-up", (rep,res) => {
    res.send("successful signed up")
});

app.post('/users',(req,res) =>{
    Users.findOne({Username:req.body.Username})
    .then((user) =>{
        if(user){
            return res.status(400).send(req.body.Username + 'already exsits');
        }else{
            Users
            .create({
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday,
            })
            .then((user)=> {res.status(201).json(user)})
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            })
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: '+ error);
    });
});

//get all users
app.get('/users', (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

// get a user by user name

app.get('/users/:Username', (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

// Update a user's info by username

app.put('/users/:Username', (req,res) => {
    Users.findOneAndUpdate({Username: req.params.Username}, {$set:
    {
        Usersname: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
    }
},
{new:true}, 
(err, updateUser) => {
    if(err){
        console.error(err);
        res.status(500).send('Error: ' + err);
    }else{
        res.json(updateUser);
    }
});
});

app.post('/users/:username/:movies/:movieID', (req, res) => {
    Users.findOneAndUpdate({Username: req.params.Username}, {
        $push: {FavoriteMovies: req.params.MovieID}
    },
    {new:true}, 
    (err,updatedUser) => {
        if (err){
            console.error(err);
            res.status(500).send('Error: ' + err);
        }else{
            res.json(updatedUser);
        }
    });
});

// Delete a user by username
app.delete('/users/:Username', (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found');
        } else {
          res.status(200).send(req.params.Username + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });



app.use(express.static('public'));

// app.use((err,res,rep,next) => {
//     console.error(err.stack);
//     res.status(500).send("Something broke!");
// });

app.listen(8080,()=>{
    console.log("your app is listening on port 8080.")
})