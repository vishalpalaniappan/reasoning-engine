import jsonata from 'jsonata';
import fs from "node:fs";
import path from "path";
import { NarrativeFinder } from './narrative_processor/NarrativeFinder.js';

import { fileURLToPath } from "url";
import { json } from 'node:stream/consumers';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Searches schema for primitive. This is obviously inefficient, will be optimized later.
 * 
 * @param {String} primitiveName 
 * @return {Object}
 */
const getSchema = async (primitiveName) => {
    const SCHEMA_PATH = path.join(__dirname, "..", "temp", "schema.json");
    const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));
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
export const checkInvariantRule = async (schema, data, parentSchema, dataCxt) => {
    // Load the invariant data
    const invariant = schema[0];
    const participantToCheck = invariant.participants[0];
    const propertyToCheck = invariant.property;
    const validValuesforProperty = invariant.condition;

    // Get the alias for the property being evaluated
    let expression = jsonata(`args[argName = "${participantToCheck}"].value`);
    const alias = await expression.evaluate(dataCxt.parentData);
    console.log(alias);

    // Find when the alias was introduced
    expression = jsonata(`**[name and alias[aliasName = '${alias}' and introduce = true]]`);
    const foundNode = await expression.evaluate(dataCxt.rootData);

    const finder = new NarrativeFinder(dataCxt.rootData.narrative, foundNode.id, dataCxt.parentData.id);
    await finder.run();

    const validaterInfo = {
        alias: alias,
        propertyToCheck: propertyToCheck,
        validValuesforProperty: validValuesforProperty
    }

    // Process all the found narratives to check for semantic validity
    for (const narrativeInfo of finder.foundNarratives.narratives) {
        if (narrativeInfo.isValid) {
            processNarrative(narrativeInfo.narrative, validaterInfo);
        }
    }

    return true;
}

/**
 * Process the narrative with the invariant info to check if
 * the narrative is semantically valid.
 * 
 * @param {Array} narrative 
 * @param {Object} validaterInfo 
 */
const processNarrative = (narrative, validaterInfo) => {
    console.log("\nProcessing narrative:");

    let aliasNode = null;
    for (const node of narrative) {
        if ("alias" in node && node.alias.aliasName === validaterInfo.alias) {
            aliasNode = node;
        }
    }

    console.log(validaterInfo);
    console.log(aliasNode);

    if (validaterInfo.propertyToCheck === "structuralType") {

        if (aliasNode.name === "introduce") {
            // Have to get the structural type from the participant
            // definition in the design. This involves looking up the
            // participant and accessing the structural type attribute.
        } else {
            // Have to get the structural type from the node type
            // Ex. An add operation will result in an alias that has
            // the structural type float or int
        }
    }


}



// Will add this later after path finding
// if (foundNode.name === "introduce") {
//     // Check property from participant
// } else {
//     // Check property from transformation alias
//     const foundSchema = await getSchema(foundNode.name);
//     if (!foundSchema) {
//         throw ("unknown node type")
//     }
// }