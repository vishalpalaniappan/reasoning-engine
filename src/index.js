import Ajv from "ajv/dist/2020.js";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "path";
import { checkInvariantRule } from "./checkInvariantRule.js";
import { assignIdsToNodes } from "./assignIdsToNodes.js";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ajv = new Ajv({ strictMode: "true" });

/**
 * Compiles the schema and validates the provided file using the schema. The results of the
 * validation are passed onto 
 * 
 * @param {String} Name of the narrative in the narratives folder contained in root of repo.
 */
const validateNarrative = async (narrative_name) => {

    // Load the artha schema
    const schemaPath = path.join(__dirname, "..", "schema", "artha.schema.json");
    const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

    // Add keyword to schema for checking the invariant
    ajv.addKeyword({
        keyword: "x-invariant-metadata",
        validate: checkInvariantRule,
        error: {
            message: (ctx) => `Custom Error: ${ctx.message})`
        }
    });

    // Load the narrative
    const NARRATIVE_PATH = path.join(__dirname,"..","narratives",narrative_name);
    const narrative = assignIdsToNodes(JSON.parse(fs.readFileSync(NARRATIVE_PATH, "utf8")));

    // Validate the narrative
    const validate = ajv.compile(schema);

    // Check if the validation passed
    if (validate(narrative)) {
        console.log("Validation passed successfully!");
    } else {
        console.error("Validation failed!");
        validate.errors.forEach((err, index) => {
            console.log(`[${index + 1}] Property: ${err.instancePath}`);
            console.log(`    Keyword:  ${err.keyword}`);
            console.log(`    Message:  ${err.message}`);
            console.log(`    Params:`, err.params);
        });
    }
};

validateNarrative("test_narrative.json");
