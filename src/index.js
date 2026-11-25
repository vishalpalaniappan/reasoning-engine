import fs from "node:fs";
import fsPromises, {mkdir} from "node:fs/promises";
import fsExtra from "fs-extra";
import path from "path";
import { fetchArthaSchema } from "./fetchArthaSchema.js";
import NarrativeValidator from "./NarrativeValidator.js";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Validate the narrative.
 *
 * @param {String} Name of the narrative in the narratives folder contained in root of repo.
 */
const validate = async (narrative_name) => {
    // Load the artha schema
    const schema = await fetchArthaSchema();
    if (!schema) {
        throw "Unable to load schema.";
    }
    
    const OUTPUT_PATH = path.join(__dirname, "..", "output");
    await fsExtra.emptyDir(OUTPUT_PATH);
    await mkdir(OUTPUT_PATH, { recursive: true });

    const SCHEMA_INSPECT_PATH = path.join(__dirname, "..", "output", "schema.json");
    await fsPromises.writeFile(SCHEMA_INSPECT_PATH, JSON.stringify(schema, null, 4));
    
    // Load the narrative
    const NARRATIVE_PATH = path.join(__dirname, "..", "narratives", narrative_name);
    const narrative = JSON.parse(fs.readFileSync(NARRATIVE_PATH, "utf8"));

    const validator = new NarrativeValidator(narrative);
    validator.run();
};

validate("coffee_shop_w_checkout.json");
