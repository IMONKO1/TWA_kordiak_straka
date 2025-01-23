const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Ajv = require('ajv');
const app = express();
const port = 8000;
app.use(express.json());

// Mock data - Sprint 01
let machines = [
  { id: uuidv4(), name: "Píla", type: "Ručná", description: "Ručná píla na drevo" },
  { id: uuidv4(), name: "Fréza", type: "Automatická", description: "Fréza pre presné rezy" },
];

// Validácia dát pomocou AJV
const ajv = new Ajv();
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
const validateMachine = ajv.compile(machineSchema);

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

// Štart servera
app.listen(port, () => {
  console.log(`Server beží na http://localhost:${port}`);
});
