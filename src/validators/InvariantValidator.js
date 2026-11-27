import jsonata from "jsonata";
import { NarrativeFinder } from "../narrative_processor/NarrativeFinder.js";
import { getLogger } from '../logger/logger.js';

const log = getLogger('invariant');
/**
 * Validate that the narrative respects the invariant. Automatically place
 * the invariant at the place where the design makes the decision to engage
 * in the semantically invalid behavior.
 * 
 */
export default class InvariantValidator {

    constructor (narrativeIR, node, invariant, schema) {
        this.narrativeIR = narrativeIR;
        this.node = node;
        this.invariant = invariant;
        this.schema = schema;
    }

    async run() {
        log.info("");
        log.info("============================================");
        log.info(`Running the invariant validator: ${this.node.name}`);
        log.info("============================================");
        await this.validate();
    }

    async validate() {
        for (const invariant of this.invariant) {
            await this.processInvariant(invariant);
        }
    }

    async processInvariant(invariant) {
        const participantToCheck = invariant.participants[0];
        const propertyToCheck = invariant.property;
        const validValuesforProperty = invariant.condition;

        // Get the alias for the property being evaluated
        let expression = jsonata(`args[argName = "${participantToCheck}"].value`);
        const alias = await expression.evaluate(this.node);

        log.info(`Checking alias ${alias} for property ${propertyToCheck} and valid values ${validValuesforProperty}`);

        expression = jsonata(`**[name and alias[aliasName = '${alias}' and introduce = true]]`);
        const foundNode = await expression.evaluate(this.narrativeIR.narrative);

        if(!foundNode) {
            log.info(`Missing meaning: Could not find the node which introduces the alias.`)
            return;
        } else {
            log.info(`Found node which introduces alias: ${foundNode.name}`);
        }

        // Find the narratives
        const finder = new NarrativeFinder(this.narrativeIR.narrative, foundNode.id, this.node.id);
        await finder.run();

        log.info(JSON.stringify(finder.foundNarratives.report, null ,2));

        
        const validatorMetadata = {
            alias: alias,
            propertyToCheck: propertyToCheck,
            validValuesforProperty: validValuesforProperty
        }
        
        // Process all the found narratives to check for semantic validity
        for (const narrativeInfo of finder.foundNarratives.narratives) {
            if (narrativeInfo.isValid) {
                await this.processNarrative(narrativeInfo.narrative, validatorMetadata);
            }
        }
    }

    
    /**
     * Process the narrative with the invariant info to check if
     * the narrative is semantically valid.
     * 
     * @param {Array} narrative 
     * @param {Object} validatorMetadata 
     */
    async processNarrative(narrative, validatorMetadata) {
        if (validatorMetadata.propertyToCheck === "structural_type") {
            this.processStructuralType(narrative, validatorMetadata)
        } else if (validatorMetadata.propertyToCheck === "length") {
            // Identify all the transformations that modify this property
            // Introduce assigns initial value that gives it a length
            // Get From List and Add To List both modify length relatively

            // relative changes needs the design to reason about the world and pick semantically valid narrative
            // the reasoning has to be placed at the point where the design will inevitably make the decision to
            // go down the a path that will lead to the protected primitive

            // the automated testing will test that the reasoning selects a valid narrative under invalid conditions
            console.log("Validating length invariant");
        }
    }


    /**
     * Process the structural type invariant.
     * 
     * @param {Array} narrative The narrative being validated.
     * @param {Object} validatorMetadata Metadata about the invariant (alias, validValuesforProperty and propertyToCheck)
     */
    async processStructuralType(narrative, validatorMetadata) {
        // Find the last time this alias was updated in the narrative
        let aliasNode = null;
        const invariantNode = narrative.pop();
        for (const node of narrative) {
            if ("alias" in node && node.alias.aliasName === validatorMetadata.alias) {
                aliasNode = node;
            }
        }

        if (aliasNode.name === "introduce") {
            const participantName = await jsonata(`**[argName= 'participant'].value`).evaluate(aliasNode);
            
            // Query narrative for participant name and get the structural type argument
            const query = `narrative[participantName='${participantName}'].body[name='${validatorMetadata.propertyToCheck}'].args[argName='value'].value`;
            const structType = await jsonata(query).evaluate(this.narrativeIR);

            if (validatorMetadata.validValuesforProperty.includes(structType)) {
                log.info(`Struct type ${structType} of alias ${validatorMetadata.alias} satisfies the ${invariantNode.name} primitive's structural type invariant`);
            } else {
                log.info(`Inconsistency identified: ${invariantNode.name} has invalid structural type ${structType} for alias ${validatorMetadata.alias}`);
            }
        } else {
            // Have to get the structural type from the node type
            // Ex. An add operation will result in an alias that has
            // the structural type float or int
            const schema = await this.schema.getPrimitiveSchema(aliasNode.name);
            const structType = schema.properties.alias.properties.aliasStructuralType.const;
            
            if (validatorMetadata.validValuesforProperty.includes(structType)){
                log.info(`Struct type ${structType} of alias ${validatorMetadata.alias} satisfies the ${invariantNode.name} primitive's structural type invariant`);
            } else {
                log.info(`Inconsistency identified: ${invariantNode.name} has invalid structural type ${structType} for alias ${validatorMetadata.alias}`);
            }
        }

    }

}