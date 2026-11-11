import Ajv from "ajv/dist/2020.js";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "path";
import { customRule } from "./customRule.js";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ajv = new Ajv({ strictMode: "true" });

const validateNarrative = async () => {
    const schemaPath = path.join(__dirname, "..", "schema", "artha.schema.json");
    const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

    ajv.addKeyword({ keyword: "x-custom-rule" });

    ajv.addKeyword({
        keyword: "x-invariant-metadata",
        type: "object",
        validate: customRule,
        error: {
            message: (ctx) => `${ctx})`
        }
    });
    

    const NARRATIVE_PATH = path.join(
        __dirname,
        "..",
        "narratives",
        "testNarrative.json",
    );
    const narrative = JSON.parse(
        fs.readFileSync(NARRATIVE_PATH, "utf8"),
    );

    const validate = ajv.compile(schema);

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

validateNarrative();
