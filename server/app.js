const express = require('express');
const Ajv = require('ajv');
const ajv = new Ajv();
const app = express();
app.use(express.json());
const port = 8000;
let machines = new Map();

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
app.post('/create-machine', (req, res) => {
  const valid = validate(req.body);
  if (!valid) return res.status(400).send({ message: 'Invalid data', errors: validate.errors.map(error => error.message) });

  const machine = req.body;
  machines.set(machine.name, machine);
  res.status(201).send(machine);
});

// Read – zobrazí všetky stroje ktoré su v zozname
// Implementoval: Šimon Kordiak
app.get('/machines', (_req, res) => {
  res.send(Array.from(machines.values()));
});

// Read – zobrazí konkrétny stroj ktorý si vyhľadáme
// Implementoval: Šimon Kordiak
app.get('/machine/?name=', (req, res) => {
  const machine = machines.get(req.params.name);
  if (!machine) return res.status(404).send('Machine not found');
  res.send(machine);
});

// Update – upraví informácie o konkrétnom stroji
// Implementoval: Šimon Kordiak
app.put('/machine-update/:name', (req, res) => {
  const valid = validate(req.body);
  if (!valid) return res.status(400).send({ message: 'Invalid data', errors: validate.errors.map(error => error.message) });

  const machine = machines.get(req.params.name);
  if (!machine) return res.status(404).send('Machine not found');

  machines.set(req.params.name, { ...machine, ...req.body });
  res.send(req.body);
});

// Delete – vymaže stroj ktorý zvolíme
// Implementoval: Šimon Kordiak
app.delete('/machine-delete/:name', (req, res) => {
  const machine = machines.get(req.params.name);
  if (!machine) return res.status(404).send('Machine not found');
  const deletedMachine = machines.get(req.params.name);
  machines.delete(req.params.name);
  res.send(deletedMachine);
});

// nastavenie portu, na ktorom má bežať HTTP server
app.listen(port, () => {
 console.log(`Example app listening at http://localhost:${port}`);
});