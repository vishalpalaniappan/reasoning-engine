import Ajv from "ajv/dist/2020.js";
import fs from "node:fs";
import fsPromises, {mkdir} from "node:fs/promises";
import path from "path";
import { checkInvariantRule } from "./checkInvariantRule.js";
import { assignIdsToNodes } from "./assignIdsToNodes.js";
import { fetchArthaSchema } from "./fetchArthaSchema.js";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ajv = new Ajv({ strictMode: "true", allowUnionTypes: true });

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

    await mkdir('./temp', { recursive: true });
    await fsPromises.writeFile("./temp/schema.json", JSON.stringify(schema, null, 4));

    // Add manifest keyword so strict mode won't complain
    ajv.addKeyword("manifest");

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
    await fsPromises.writeFile("./temp/temp.json", JSON.stringify(narrative, null, 4));

    // Validate the narrative
    const validate = ajv.compile(schema);

    // Check if the validation passed
    if (await validate(narrative)) {
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


// validateNarrative("coffee_shop.json");
// validateNarrative("coffee_shop_inconsistent.json");
validateNarrative("coffee_shop_w_shopping_cart.json");
