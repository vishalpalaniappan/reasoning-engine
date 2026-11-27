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
            log.info("");
            log.info(`Processing invariant: ${invariant.property}`);
            await this.processInvariant(invariant);
        }
    }

    async processInvariant(invariant) {
        if (invariant.property === "structural_type") {
            await this.processStructuralType(invariant)
        } else {
            await this.processProperty(invariant);
        }
    }

    /**
     * Process the property by finding where it was last modified in the
     * narrative. Place the invariant where the design makes a decision to
     * engage in the semantically invalid behavior.
     * 
     * @param {Object} invariant Invariant being evaluated.
     */
    async processProperty(invariant) {
        const participantToCheck = invariant.participants[0];
        const propertyToCheck = invariant.property;
        const validValuesforProperty = invariant.condition;

        const initialBehavior = this.narrativeIR.initialBehavior;
        const behavior = await jsonata(`**[behaviorName= '${initialBehavior}']`).evaluate(this.narrativeIR);
        const startId = behavior.body[0].id;
        const endId = this.node.id;

        const alias = await jsonata(`args[argName = "${participantToCheck}"].value`).evaluate(this.node);

        // Find the narratives
        const finder = new NarrativeFinder(this.narrativeIR.narrative, startId, endId);
        await finder.run();

        for (const narrativeInfo of finder.foundNarratives.narratives) {
            if (!narrativeInfo.isValid) continue;

            const invariantNode = narrativeInfo.narrative.pop();
            
            let foundIndex;
            for (let i = 0; i < narrativeInfo.narrative.length; i++) {
                const node = narrativeInfo.narrative[i];
                if (node.name === "introduce" && node.alias.aliasName === alias) {
                    foundIndex = i;
                } else if (node?.alias?.aliasName === alias){
                    const schema = await this.schema.getPrimitiveSchema(node.name);
                    if (!("modifies" in schema)) continue;
                    if (Object.keys(schema["modifies"]).includes(propertyToCheck)) {
                        foundIndex = i;
                    }
                }
            }

            const foundNode = narrativeInfo.narrative[foundIndex];
            console.log(foundNode);
        }
        
    }


    /**
     * Process the structural type invariant.
     * 
     * @param {Object} invariant Invariant being evaluated.
     */
    async processStructuralType(invariant) {
        const participantToCheck = invariant.participants[0];
        const propertyToCheck = invariant.property;
        const validValuesforProperty = invariant.condition;

        const initialBehavior = this.narrativeIR.initialBehavior;
        const behavior = await jsonata(`**[behaviorName= '${initialBehavior}']`).evaluate(this.narrativeIR);
        const startId = behavior.body[0].id;
        const endId = this.node.id;

        // Get the alias for the property being evaluated
        const alias = await jsonata(`args[argName = "${participantToCheck}"].value`).evaluate(this.node);

        // Find the narratives
        const finder = new NarrativeFinder(this.narrativeIR.narrative, startId, endId);
        await finder.run();

        // log.info(JSON.stringify(finder.foundNarratives.report, null ,2));
        
        // Process all the found narratives to check for semantic validity
        let validNarrativeCount = 0;
        for (const narrativeInfo of finder.foundNarratives.narratives) {
            if (!narrativeInfo.isValid) continue;

            log.info(`  Narrative ${++validNarrativeCount}`);
            const invariantNode = narrativeInfo.narrative.pop();
            
            // Find the last time this alias was updated in the narrative
            let aliasNode = narrativeInfo.narrative.reverse().find((n) => "alias" in n && n.alias.aliasName === alias);

            let structType;
            if (aliasNode.name === "introduce") {
                // Query narrative for participant name and get the structural type argument
                const participantName = await jsonata(`**[argName= 'participant'].value`).evaluate(aliasNode);
                const query = `narrative[participantName='${participantName}'].body[name='${propertyToCheck}'].args[argName='value'].value`;
                structType = await jsonata(query).evaluate(this.narrativeIR);
            } else {
                // Get the structural type from the primitive (Ex. Add prim results in alias that has the structural type float or int)
                const schema = await this.schema.getPrimitiveSchema(aliasNode.name);
                structType = schema.properties.alias.properties.aliasStructuralType.const;
            }
                
            if (validValuesforProperty.includes(structType)){
                log.info(`  Struct type ${structType} of alias ${alias} satisfies the ${invariantNode.name} primitive's structural type invariant`);
            } else {
                log.info(`  Inconsistency identified: ${invariantNode.name} has invalid structural type ${structType} for alias ${alias}`);
            }
        }
    }
}