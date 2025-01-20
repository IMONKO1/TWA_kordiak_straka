// načítanie modulu express
const express = require('express');
// inicializácia nového Express.js servera
const app = express();
// definovanie portu
const port = 800;
// jednoduchá definícia routy s HTTP metodou GET, ktorá len navráti text
app.get("/", (req, res) => {
 res.send("Hello World!");
});
// nastavenie portu, na ktorom má bežať HTTP server
app.listen(port, () => {
 console.log(`Example app listening at http://localhost:${8000}`);
});