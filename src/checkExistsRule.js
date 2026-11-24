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

    const initialBehavior = dataCxt.rootData.initialBehavior;
    const behavior = await jsonata(`**[behaviorName= '${initialBehavior}']`).evaluate(dataCxt.rootData);
    const startId = behavior.body[0].id;
    const endId = dataCxt.parentData.id;


    console.log(startId, endId);
    const finder = new NarrativeFinder(dataCxt.rootData.narrative, startId, endId);
    await finder.run();

    console.log(finder.foundNarratives.report);

    return true;
}