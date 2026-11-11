import Ajv from "ajv";
import fs from "fs/promises";
import path from "path";

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ajv = new Ajv();

const validateNarrative = async () => {
    const schemaPath = path.join(__dirname, "..", "schema", "artha.schema.json");
    const schema = JSON.parse(await fs.readFile(schemaPath, "utf8"));

    const validate = ajv.compile(schema);
}

validateNarrative();