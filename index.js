const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(morgan('common'));

let topMovies =[
    {
        title:"Gone with the wind",
        starring: "Clark Gable",
        releaseDate: "1939",
    },
    {
        title:"The Godfather",
        starring:"Marlon Brando",
        releaseDate:"1972",
    },
    {
        title:"Star Wars",
        starring:"Harrison Ford",
        releaseDate:"1977",
    },
    {
        title:"Casablanca",
        starring:"Ingrid Bergman",
        releaseDate:"1943",
    }, 
    {
        title:"The Lord of the Rings",
        starring:"Andy Serkis",
        releaseDate:"1978",
    },
    {
        title:"Forrest Gump",
        starring:"Tom Hanks",
        releaseDate:"1994",
    },
    {
        title:"E.T.",
        starring:"Henry Thomas",
        releaseDate:"1982",
    },
    {
        title:"The Sound of Music",
        starring:"Julie Andrews",
        releaseDate:"1965",
    },
    {
        title:"Titanic",
        starring:"Leonardo DiCaprio",
        releaseDate:"1997",
    },
    {
        title:"The Wizard of Oz",
        starring:"Judy Garland",
        releaseDate:"1939",
    }
];

app.get("/movies", (rep, res) =>{
    res.json(topMovies);
});

app.get("/", (rep, res) =>{
    res.send("Welcome to my Movie API.")
});

app.get("/documentation", (rep, res) =>{
    res.sendFile("public/documentation.html", { root: __dirname});
});

app.use(express.static('public'));

app.use((err,res,rep,next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

app.listen(8080,()=>{
    console.log("your app is listening on port 8080.")
})