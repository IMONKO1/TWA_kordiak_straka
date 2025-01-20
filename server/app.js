const express = require('express');
const Ajv = require('ajv');
const ajv = new Ajv();
const app = express();
app.use(express.json());
const port = 8000;
let machines = [];

// Schémy pre validáciu dát
const machineSchema = {
  type: "object",
  properties: {
    name: { type: "string", pattern: "^[a-zA-Z]+$" },
    email: { type: "string", format: "email" },
    phone: { type: "string", pattern: "^[0-9]{10}$" }
  },
  required: ["name", "email", "phone"],
  additionalProperties: false
};

const validate = ajv.compile(machineSchema);

// Create – vytvorí novy stroj a pridá ho do zoznamu/databázy
// Implementoval: Šimon Kordiak
app.post('/machines', (req, res) => {
  const valid = validate(req.body);
  if (!valid) return res.status(400).send(validate.errors);

  const machine = req.body;
  machines.push(machine);
  res.status(201).send(machine);
});

// Read – zobrazí všetky stroje ktoré su v zozname
// Implementoval: Šimon Kordiak
app.get('/machines', (req, res) => {
  res.send(machines);
});

// Read – zobrazí konkrétny stroj ktorý si vyhľadáme
// IImplementoval: Šimon Kordiak
app.get('/machines/:name', (req, res) => {
  const machine = machines.find(m => m.name === req.params.name);
  if (!machine) return res.status(404).send('Machine not found');
  res.send(machine);
});

// Update – upraví informácie o konkrétnom stroji
// Implementoval: Šimon Kordiak
app.put('/machines/:name', (req, res) => {
  const valid = validate(req.body);
  if (!valid) return res.status(400).send(validate.errors);

  const index = machines.findIndex(m => m.name === req.params.name);
  if (index === -1) return res.status(404).send('Machine not found');

  machines[index] = req.body;
  res.send(machines[index]);
});

// Delete – vymaže stroj ktorý zvolíme
// Implementoval: Šimon Kordiak
app.delete('/machines/:name', (req, res) => {
  const index = machines.findIndex(m => m.name === req.params.name);
  if (index === -1) return res.status(404).send('Machine not found');

  const deletedMachine = machines.splice(index, 1);
  res.send(deletedMachine);
});

// nastavenie portu, na ktorom má bežať HTTP server
app.listen(port, () => {
 console.log(`Example app listening at http://localhost:${8000}`);
});