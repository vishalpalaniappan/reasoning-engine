import Ajv from "ajv/dist/2020.js";
import jsonata from 'jsonata';
import fs from "node:fs";
import path from "path";
import fsPromises, {mkdir} from "node:fs/promises";
import { NarrativeFinder } from './narrative_processor/NarrativeFinder.js';

import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));


const SCHEMA_PATH = path.join(__dirname, "..", "temp", "schema.json");
const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));

/**
 * Searches schema for primitive. This is obviously inefficient, will be optimized later.
 * 
 * @param {String} primitiveName 
 * @return {Object}
 */
const getSchema = async (primitiveName) => {
    const expression = jsonata("**[`$id` = './" + primitiveName + ".schema.json']");
    const foundPrimitive = await expression.evaluate(schema);
    return foundPrimitive;
}

/**
 * Checks that the invariant is respected by the narrative.
 * 
 * @param {Array} schema 
 * @param {Object} data 
 * @param {Object} parentSchema 
 * @param {Object} dataCxt 
 * @returns 
 */
export const checkExistsRule = async (schema, data, parentSchema, dataCxt) => {
    // This has to be modified in a few ways:
    // - A participant that is mentioned has to be verified for its existence
    // - An aliases existence isn't enough, it has to verify that the narrative leading to the
    //   primitive transformation ensures the alias's existence
    // - For aliases that persist, this involves checking the narrative leading to the transformation
    // - For aliases that don't persist, the alias has to be introduced before the transformation

    for (const arg of schema) {
        const alias = await jsonata(`**[argName = '${arg}'].value`).evaluate(data);
        // console.log(`Checking for the existence of ${alias}`)

        const expression = jsonata(`**[name and alias[aliasName = '${alias}' and introduce = true]]`);
        const foundNode = await expression.evaluate(dataCxt.rootData);

        if (foundNode) {
            const persists = await jsonata(`**[argName = 'persist'].value`).evaluate(foundNode);
            if (persists) {
                // Can be introduced anywhere in the narrative
                console.log(`Found alias and it persists for transformation ${foundNode.name}`)
                return true;
            } else {
                // TODO: Has to be introduced in the same behavior, validate
                console.log(`Found alias and it doesn't persist for transformation ${foundNode.name}`)
                return true;
            }
        } else {
            // Failure diagnosed, alias was never introduced
            throw new Ajv.ValidationError([
                {
                    keyword: "exists",
                    message: `Alias ${alias} was not found for transformation ${foundNode.name}`
                }
            ]);
        }
    }

    return true;
}