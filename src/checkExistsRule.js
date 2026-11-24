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
 * Checks if the specified arguments have an alias that exists in the narrative.
 * 
 * @param {Array} schema 
 * @param {Object} data 
 * @param {Object} parentSchema 
 * @param {Object} dataCxt 
 * @returns 
 */
export const checkExistsRule = async (schema, data, parentSchema, dataCxt) => {

    for (const argName of schema) {
        const initialBehavior = dataCxt.rootData.initialBehavior;
        const behavior = await jsonata(`**[behaviorName= '${initialBehavior}']`).evaluate(dataCxt.rootData);
        const startId = behavior.body[0].id;
        const endId = dataCxt.parentData.id;

        const finder = new NarrativeFinder(dataCxt.rootData.narrative, startId, endId);
        await finder.run();

        for (let i = 0 ; i < finder.foundNarratives.narratives.length; i++) {
            if (!finder.foundNarratives.narratives[i].isValid) continue;

            // Find the argument that uses the argName
            const argInfo = await jsonata(`**[argName = '${argName}']`).evaluate(data);
            
            // Skip lookup if the argType is a constant (no lookup needed)
            if (argInfo.argType === "const") continue;
            
            // If argType is name, we have valid alias value, so lookup needed
            let aliasValue;
            if (argInfo.argType === "name") {
                aliasValue = argInfo.value;
            }

            // Go through each narrative and find the alias 
            let found = false;
            for (const node of finder.foundNarratives.narratives[i].narrative) {
                if (node?.alias?.aliasName === aliasValue) {
                    if (node.alias.persist) {
                        // Alias is persisted on the narrative path and will be avilable
                        console.log(`Alias ${aliasValue} is persisted and is available before primitive ${dataCxt.parentData.name}.`)
                        found = true;
                        // TODO: The alias can be removed from the world, have to verify this.
                    } else {
                        // Check if the nodes behavior is the same as target behavior
                        const expression1 = jsonata(`**[name='behavior' and body[id= '${node.id}']].behaviorName`);
                        const nodeBehavior = await expression1.evaluate(dataCxt.rootData);

                        const expression2 = jsonata(`**[name='behavior' and body[id= '${endId}']].behaviorName`);
                        const finalBehavior = await expression2.evaluate(dataCxt.rootData);
                        
                        if (nodeBehavior === finalBehavior) {
                            console.log(`Alias ${aliasValue} exsts in behavior before primitive ${dataCxt.parentData.name}.`);
                            found = true;
                        }
                    }
                }
            }

            if (!found) {
                // Alias was not found
                console.log(`Missing Alias: Alias ${aliasValue} was not found for primitive ${dataCxt.parentData.name}.`);
            }
            
        }
    }

    return true;
}