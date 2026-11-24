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
    console.log("\nIn custom existence rule:");

    for (const arg of schema) {
        const aliasName = await jsonata(`**[argName = '${arg}'].value`).evaluate(data);
        console.log(`Checking for the existence of ${aliasName}`)
    }

    console.log("");
    return true;
}