import fs from "node:fs";
import fsPromises, {mkdir} from "node:fs/promises";
import fsExtra from "fs-extra";
import path from "path";
import { fetchArthaSchema } from "./helper/fetchArthaSchema.js";
import NarrativeValidator from "./NarrativeValidator.js";
import { assignIdsToNodes } from "./assignIdToNodes.js";
import VALIDATOR_MODES from "./VALIDATOR_MODES.js";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { getLogger } from './logger/logger.js';

const log = getLogger('validator');

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
    
    // Create output folder
    const OUTPUT_PATH = path.join(__dirname, "..", "output");
    await fsExtra.emptyDir(OUTPUT_PATH);
    await mkdir(OUTPUT_PATH, { recursive: true });

    // Write the fetched schema to file for inspection
    const SCHEMA_INSPECT_PATH = path.join(__dirname, "..", "output", "schema.json");
    await fsPromises.writeFile(SCHEMA_INSPECT_PATH, JSON.stringify(schema, null, 4));
    log.info("Loaded schema.");
    
    // Load the narrative
    const NARRATIVE_PATH = path.join(__dirname, "..", "narratives", narrative_name);
    const narrative = assignIdsToNodes(JSON.parse(fs.readFileSync(NARRATIVE_PATH, "utf8")));
    log.info("Loaded narrative.");

    // TODO: Modify to validate in stages and move onto next stage after previous stage is clear.
    // Order: structural, existence and then invariant

    for (const [mode, value] of Object.entries(VALIDATOR_MODES)) {
        log.info(`Running validator in mode: ${mode}`)
        const validator = new NarrativeValidator({...narrative}, schema, value);
        await validator.run();
    }
};

validate("coffee_shop_w_checkout.json");
