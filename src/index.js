import Ajv from "ajv/dist/2020.js";
import fs from "node:fs";
import fsPromises, {mkdir} from "node:fs/promises";
import fsExtra from "fs-extra";
import path from "path";
import { checkInvariantRule } from "./checkInvariantRule.js";
import { assignIdsToNodes } from "./assignIdsToNodes.js";
import { fetchArthaSchema } from "./fetchArthaSchema.js";
import { checkExistsRule } from "./checkExistsRule.js";
import errorManager from "./CustomValidationError.js";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ajv = new Ajv({ strictMode: "true", allowUnionTypes: true, allErrors: true });

/**
 * Compiles the schema and validates the provided file using the schema. The results of the
 * validation are passed onto
 *
 * @param {String} Name of the narrative in the narratives folder contained in root of repo.
 */
const validateNarrative = async (narrative_name) => {
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

    // Add manifest keyword so strict mode won't complain
    ajv.addKeyword("manifest");

    // Add keyword to schema for checking exists
    ajv.addKeyword({
        keyword: "$exists",
        async:true,
        validate: checkExistsRule,
        error: {
            message: (ctx) => `Custom Error: ${ctx.message})`,
        },
    });

    // Add keyword to schema for checking the invariant
    ajv.addKeyword({
        keyword: "x-invariant-metadata",
        async:true,
        validate: checkInvariantRule,
        error: {
            message: (ctx) => `Custom Error: ${ctx.message})`,
        },
    });

    // Load the narrative
    const NARRATIVE_PATH = path.join(__dirname, "..", "narratives", narrative_name);
    const narrative = assignIdsToNodes(JSON.parse(fs.readFileSync(NARRATIVE_PATH, "utf8")));

    // Write to temp file for inspection
    const SCHEMA_W_ID_INSPECTION_PATH = path.join(__dirname, "..", "output", "schema_w_id.json");
    await fsPromises.writeFile(SCHEMA_W_ID_INSPECTION_PATH, JSON.stringify(narrative, null, 4));

    // Validate the narrative
    const validate = ajv.compile(schema);
    
    await validate(narrative).then(() => {
        console.log("Validation Succeeded");
    }).catch((error) => {
        if (error instanceof Ajv.ValidationError) {
            console.log("Validation Failed");
        } else {
            throw error;
        }
    });

    console.log("\nValidation Result:")
    console.log(errorManager.validationErrors);
    
};


// validateNarrative("coffee_shop.json");
// validateNarrative("coffee_shop_inconsistent.json");
// validateNarrative("coffee_shop_w_shopping_cart.json");
validateNarrative("coffee_shop_w_checkout.json");
