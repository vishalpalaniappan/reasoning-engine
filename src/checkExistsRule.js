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

    const alias = schema[0];
    const initialBehavior = dataCxt.rootData.initialBehavior;
    const behavior = await jsonata(`**[behaviorName= '${initialBehavior}']`).evaluate(dataCxt.rootData);
    const startId = behavior.body[0].id;
    const endId = dataCxt.parentData.id;

    const finder = new NarrativeFinder(dataCxt.rootData.narrative, startId, endId);
    await finder.run();

    for (let i = 0 ; i < finder.foundNarratives.narratives.length; i++) {
        const narrativeInfo = finder.foundNarratives.narratives[i];
        if (!narrativeInfo.isValid) continue;
        const aliasValue = await jsonata(`**[argName = '${alias}'].value`).evaluate(data);

        // TODO: Check if the alias value is a constant (don't need to lookup)

        for (const node of narrativeInfo.narrative) {
            if (node.name === "introduce" && node.alias.aliasName === aliasValue) {
                if (node.alias.persist) {
                    // Alias is persisted on the narrative path and will be avilable
                    console.log(`Alias ${aliasValue} is persisted and is available before transformation.`)

                    // TODO: The alias can be removed from the world, have to verify this.
                } else {
                    // Check if the nodes behavior is the same as target behavior
                    const expression1 = jsonata(`**[name='behavior' and body[id= '${node.id}']].behaviorName`);
                    const nodeBehavior = await expression1.evaluate(dataCxt.rootData);

                    const expression2 = jsonata(`**[name='behavior' and body[id= '${endId}']].behaviorName`);
                    const finalBehavior = await expression2.evaluate(dataCxt.rootData);

                    if (nodeBehavior === finalBehavior) {
                        console.log(`Alias ${aliasValue} that doesn't persist exsts in behavior before transformation`);
                    }
                }
            }
        }
        
    }

    return true;
}