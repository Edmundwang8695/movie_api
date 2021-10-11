const express = require('express'),
bodyParser = require('body-parser'),
uuid= require('uuid');

const morgan = require('morgan');
const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');
app.use(bodyParser.urlencoded({ extended: true }));
const cors= require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com','http://localhost:1234'];
app.use(cors());
const bcrypt = require('bcrypt');
const { check, validationResult} = require ('express-validator');

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());

app.use(morgan('common'));

app.get('/movies',passport.authenticate('jwt', {session:false}), (req, res) => {
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

app.get("/documentation",passport.authenticate('jwt', {session:false}),  (rep, res) =>{
    res.sendFile("public/documentation.html", { root: __dirname});
});

app.get('/movies/:Title', passport.authenticate('jwt', {session:false}), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((Movie) => {
        res.json(Movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });


//Allow new user to register
app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);


//get all users
app.get('/users', passport.authenticate('jwt', {session:false}),(req, res) => {
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

app.get('/users/:Username',passport.authenticate('jwt', {session:false}),  (req, res) => {
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

app.put('/users/:Username',passport.authenticate('jwt', {session:false}),(req,res) => {
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


//add movie list
app.post('/users/:username/:movies/:movieID', passport.authenticate('jwt', {session:false}), (req, res) => {
    Users.findOneAndUpdate({Username: req.params.username}, {
        $push: {FavoriteMovies: req.params.movieID}
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
    // Allows user to delete movie

    app.delete("/users/:userId/movies/:movieId", passport.authenticate('jwt',
        { session: false }), (req, res) => {
            Users.findById(req.params.userId)
                .then((user) => {
                    if (!user) {
                        return res.status(404).send("User does not exist")
                    }
                    if (user.favoriteMovies && user.favoriteMovies.includes(req.params.movieId)) {
                        user.favoriteMovies.remove(req.params.movieId)
                        user.save(() => {
                            res.send(req.params.movieId + "Movie was removed from Favorites")
                        })
                    } else {
                        res.send("Movie was not found");
                    }
                });
        });

// Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', {session:false}), (req, res) => {
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

  app.get(
    "/movies/genre/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Movies.find()
        .then((movies) => {
          res.json(movies.Genre);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        });
    }
  );

//Get data about a genre by name/title
app.get(
  "/movies/genre/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.Name })
      .then((movies) => {
        res.json(movies.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.get(
  "/movies/director",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.json(Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//Get data about a director
app.get(
  "/movies/director/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Director.Name": req.params.Name })
      .then((movies) => {
        res.json(movies.director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);




app.use(express.static('public'));

// app.use((err,res,rep,next) => {
//     console.error(err.stack);
//     res.status(500).send("Something broke!");
// });

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});