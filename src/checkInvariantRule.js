import jsonata from 'jsonata';
import fs from "node:fs";
import path from "path";
import { NarrativeFinder } from './narrative_processor/NarrativeFinder.js';

import { fileURLToPath } from "url";
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
            const isValid = await processNarrative(narrativeInfo.narrative, validaterInfo);
            if (!isValid) return false;
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
const processNarrative = async (narrative, validaterInfo) => {
    console.log("\nProcessing narrative:");

    // Find the last time this alias was updated in the narrative
    let aliasNode = null;
    const invariantNode = narrative.pop();
    for (const node of narrative) {
        if ("alias" in node && node.alias.aliasName === validaterInfo.alias) {
            aliasNode = node;
        }
    }

    /**
     * Note: in the previous step I find the last time that the alias was updated
     * but in reality, I should be checking for the last time the relevant property
     * was modified. So for example, in the case of structural type, when an alias
     * is introduced, its structural type gets modified. In other cases, a particular
     * property of an alias can get updated, for example, the length of an alias. In
     * this case, the node that is relevant is the last one that modified the relevant
     * property. I'll make these changes later.
     */

    console.log(validaterInfo);
    console.log(aliasNode);

    /**
     * Note: I can make this more modular by establishing rules in documents and loading them
     * to validate. In the same way that I create definitions for primitives, I can also create
     * ways that each invariant type will have to be validated. I will explore this more when 
     * I get there but the principle is the same and for now its fine to hardcode it. It would
     * actually be kind of cool to allow the validation sequence itself to be scripted. It would
     * create a very modular approach and I users can extend the engines functionality as needed.
     */
    if (validaterInfo.propertyToCheck === "structuralType") {

        if (aliasNode.name === "introduce") {
            // Have to get the structural type from the participant
            // definition in the design. This involves looking up the
            // participant and accessing the structural type attribute.
        } else {
            // Have to get the structural type from the node type
            // Ex. An add operation will result in an alias that has
            // the structural type float or int
            const schema = await getSchema(aliasNode.name);
            const structType = schema.properties.alias.properties.aliasStructuralType.const;
            
            if (validaterInfo.validValuesforProperty.includes(structType)){
                console.log(`Struct type ${structType} satisfies the ${invariantNode.name} primitive's structural type invariant`);
                return true;
            } else {
                console.log(`Inconsistency identified: ${invariantNode.name} has invalid structural type ${structType}`);
                return false;
            }
        }
    }
}