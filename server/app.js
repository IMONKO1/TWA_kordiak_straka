const express = require('express');
const Ajv = require('ajv');
const ajv = new Ajv();
const app = express();
app.use(express.json());
const port = 8000;
let machines = new Map();

const dreva = []; 

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

//Create - vytvorí nový záznam dreva.
//Implementoval: Dominik Straka
app.post("/drevo/create", (req, res) => {
  const body = req.body;
  const schema = {
      type: "object",
      properties: {
          nazov: { type: "string", minLength: 3, maxLength: 50, pattern: "^[a-zA-Z\u00C0-\u017F ]+$" },
          druh: { type: "string", minLength: 3, maxLength: 50 },
          hustota: { type: "number", minimum: 100, maximum: 1500 },
          farba: { type: "string", minLength: 3, maxLength: 30 }
      },
      required: ["nazov", "druh"],
      additionalProperties: false,
  };

  const validate = ajv.compile(schema);
  const valid = validate(body);
  if (!valid) {
      res.status(400).json({
          code: "dtoIn valid",
          message: "Invalid request",
          errors: validate.errors,
      });
      return;
  }

  const newDrevo = {
      id: crypto.randomBytes(16).toString('hex'),
      ...body
  };
  dreva.push(newDrevo);
  res.json(newDrevo);
});

// Read - načíta informácie o konkrétnom dreve podľa jeho ID.
// Implementoval: Dominik Straka
app.get("/drevo/read", (req, res) => {
  const query = req.query;
  const drevo = dreva.find((drevo) => drevo.id === query.id);
  if (!drevo) {
      res.status(404).json({
          code: "not_found",
          message: `Drevo s ID: ${query.id} sa nenašlo.`
      });
      return;
  }
  res.json(drevo);
});

// Read All - načíta zoznam všetkých driev.
// Implementoval: Dominik Straka
app.get("/drevo/list", (req, res) => {
  res.json(dreva);
});

// Update - aktualizuje informácie o konkrétnom dreve.
// Implementoval: Dominik Straka
app.post("/drevo/update", (req, res) => {
  const body = req.body;
  const schema = {
      type: "object",
      properties: {
          id: { type: "string", minLength: 1 },
          nazov: { type: "string", minLength: 3, maxLength: 50, pattern: "^[a-zA-Z\u00C0-\u017F ]+$" },
          druh: { type: "string", minLength: 3, maxLength: 50 },
          hustota: { type: "number", minimum: 100, maximum: 1500 },
          farba: { type: "string", minLength: 3, maxLength: 30 }
      },
      required: ["id"],
      additionalProperties: false,
  };

  const validate = ajv.compile(schema);
  const valid = validate(body);
  if (!valid) {
      res.status(400).json({
          code: "dtoIn valid",
          message: "Invalid request",
          errors: validate.errors,
      });
      return;
  }

  const drevoIndex = dreva.findIndex((drevo) => drevo.id === body.id);
  if (drevoIndex === -1) {
      res.status(404).json({
          code: "not_found",
          message: "Drevo s týmto ID neexistuje."
      });
      return;
  }

  dreva[drevoIndex] = { ...dreva[drevoIndex], ...body };
  res.json(dreva[drevoIndex]);
});

// Delete - odstráni konkrétne drevo z databázy podľa jeho ID.
// Implementoval: Dominik Straka
app.post("/drevo/delete", (req, res) => {
  const body = req.body;
  const drevoIndex = dreva.findIndex((drevo) => drevo.id === body.id);
  if (drevoIndex === -1) {
      res.status(404).json({
          code: "not_found",
          message: "Drevo s týmto ID neexistuje."
      });
      return;
  }

  dreva.splice(drevoIndex, 1);
  res.json({ message: "Drevo bolo úspešne odstránené." });
});

// nastavenie portu, na ktorom má bežať HTTP server
app.listen(port, () => {
 console.log(`Example app listening at http://localhost:${port}`);
});