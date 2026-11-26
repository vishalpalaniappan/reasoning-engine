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

        
        const validaterInfo = {
            alias: alias,
            propertyToCheck: propertyToCheck,
            validValuesforProperty: validValuesforProperty
        }
        
        // Process all the found narratives to check for semantic validity
        for (const narrativeInfo of finder.foundNarratives.narratives) {
            if (narrativeInfo.isValid) {
                await this.processNarrative(narrativeInfo.narrative, validaterInfo, this.narrativeIR);
            }
        }
    }

    
    /**
     * Process the narrative with the invariant info to check if
     * the narrative is semantically valid.
     * 
     * @param {Array} narrative 
     * @param {Object} validaterInfo 
     * @param {Object} design
     */
    async processNarrative(narrative, validaterInfo, design) {
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

        /**
         * Note: I can make this more modular by establishing rules in documents and loading them
         * to validate. In the same way that I create definitions for primitives, I can also create
         * ways that each invariant type will have to be validated. I will explore this more when 
         * I get there but the principle is the same and for now its fine to hardcode it. It would
         * actually be kind of cool to allow the validation sequence itself to be scripted. It would
         * create a very modular approach and I users can extend the engines functionality as needed.
         */
        if (validaterInfo.propertyToCheck === "structural_type") {

            if (aliasNode.name === "introduce") {
                const participantName = await jsonata(`**[argName= 'participant'].value`).evaluate(aliasNode);
                
                // Query narrative for participant name and get the structural type argument
                const query = `narrative[participantName='${participantName}'].body[name='${validaterInfo.propertyToCheck}'].args[argName='value'].value`;
                const structType = await jsonata(query).evaluate(design);

                if (validaterInfo.validValuesforProperty.includes(structType)) {
                    log.info(`Struct type ${structType} of alias ${validaterInfo.alias} satisfies the ${invariantNode.name} primitive's structural type invariant`);
                } else {
                    log.info(`Inconsistency identified: ${invariantNode.name} has invalid structural type ${structType} for alias ${validaterInfo.alias}`);
                }
            } else {
                // Have to get the structural type from the node type
                // Ex. An add operation will result in an alias that has
                // the structural type float or int
                const schema = await this.schema.getPrimitiveSchema(aliasNode.name);
                const structType = schema.properties.alias.properties.aliasStructuralType.const;
                
                if (validaterInfo.validValuesforProperty.includes(structType)){
                    log.info(`Struct type ${structType} of alias ${validaterInfo.alias} satisfies the ${invariantNode.name} primitive's structural type invariant`);
                } else {
                    log.info(`Inconsistency identified: ${invariantNode.name} has invalid structural type ${structType} for alias ${validaterInfo.alias}`);
                }
            }
        }
    }

}