const express = require('express');
const Ajv = require('ajv');
const ajv = new Ajv();
const app = express();
const port = 8000;
const { v4: uuidv4 } = require('uuid');
app.use(express.json());

const dreva = []; 

// Mock data - Sprint 01 Kordiak
let machines = [
  { id: uuidv4(), name: "Píla", type: "Ručná", description: "Ručná píla na drevo" },
  { id: uuidv4(), name: "Fréza", type: "Automatická", description: "Fréza pre presné rezy" },
];

// Schémy pre validáciu dát
const machineSchema = {
  type: "object",
  properties: {
    name: { type: "string", pattern: "^[a-zA-ZáäčďéíľĺňóôŕšťúýžÁÄČĎÉÍĽĹŇÓÔŔŠŤÚÝŽ\\s]+$" },
    type: { type: "string" },
    description: { type: "string" },
  },
  required: ["name", "type", "description"],
  additionalProperties: false,
};
const validate = ajv.compile(machineSchema);

// CREATE: Pridanie nového stroja
// Autor: Šimon Kordiak
app.post('/machine/create', (req, res) => {
  const newMachine = req.body;

  if (!validateMachine(newMachine)) {
    return res.status(400).json({ code: "invalid_input", message: "Provided data is not valid", errors: validateMachine.errors });
  }

  const machine = { id: uuidv4(), ...newMachine };
  machines.push(machine);
  res.status(201).json(machine);
});

// READ ALL: Zobrazenie všetkých strojov
// Autor: Šimon Kordiak
app.get('/machines', (req, res) => {
  res.status(200).json(machines);
});

// READ ONE: Zobrazenie konkrétneho stroja podľa ID
// Autor: Šimon Kordiak
app.get('/machine/:id', (req, res) => {
  const { id } = req.params;
  const machine = machines.find((m) => m.id === id);

  if (!machine) {
    return res.status(404).json({ code: "not_found", message: "Machine not found" });
  }

  res.status(200).json(machine);
});

// UPDATE: Aktualizácia údajov o stroji
// Autor: Šimon Kordiak
app.put('/machine/update/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  if (!validateMachine(updatedData)) {
    return res.status(400).json({ code: "invalid_input", message: "Provided data is not valid", errors: validateMachine.errors });
  }

  const machineIndex = machines.findIndex((m) => m.id === id);

  if (machineIndex === -1) {
    return res.status(404).json({ code: "not_found", message: "Machine not found" });
  }

  machines[machineIndex] = { id, ...updatedData };
  res.status(200).json(machines[machineIndex]);
});

// DELETE: Odstránenie stroja
// Autor: Šimon Kordiak
app.delete('/machine/delete/:id', (req, res) => {
  const { id } = req.params;
  const machineIndex = machines.findIndex((m) => m.id === id);

  if (machineIndex === -1) {
    return res.status(404).json({ code: "not_found", message: "Machine not found" });
  }

  machines.splice(machineIndex, 1);
  res.status(200).json({ message: "Machine deleted successfully" });
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
          hustota: { type: "integer", minimum: 100, maximum: 1500 },
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
 console.log(`Server beží na http://localhost:${port}`);
});