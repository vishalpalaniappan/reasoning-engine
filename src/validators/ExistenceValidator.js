import jsonata from "jsonata";
import { NarrativeFinder } from "../narrative_processor/NarrativeFinder.js";
import { getLogger } from '../logger/logger.js';

const log = getLogger('existence');
/**
 * Validate the existence of the relevant alias in the narrative.
 *
 * The argument that must be validated will be highlighted by the
 * schema.This can take a few forms, for example, either an alias
 * itself or the definition of a participant that was introduced.
 */
export default class ExistenceValidator {

    constructor (narrativeIR, node, existenceChecks) {
        this.narrativeIR = narrativeIR;
        this.node = node;
        this.existenceChecks = existenceChecks;
    }

    async run() {
        log.info("");
        log.info("============================================");
        log.info(`Running the existence validator: ${this.node.name}`);
        log.info("============================================");
        for (const check of this.existenceChecks) {
            await this.validate(check);
        }
    }

    async validate(argName) {
        log.info(`Validating arg: ${argName}`);
        
        // Start at the first node in the narrative and end at the node
        const initialBehavior = this.narrativeIR.initialBehavior;
        const behavior = await jsonata(`**[behaviorName= '${initialBehavior}']`).evaluate(this.narrativeIR);
        const startId = behavior.body[0].id;
        const endId = this.node.id;

        // Find all the narratives
        const finder = new NarrativeFinder(this.narrativeIR.narrative, startId, endId);
        await finder.run();

        for (const narrativeInfo of finder.foundNarratives.narratives) {
            if (!narrativeInfo.isValid) continue;
            
            // Find the arg info
            const argInfo = await jsonata(`**[argName = '${argName}']`).evaluate(this.node);

            // Skip lookup if the argType is a constant (no lookup needed)
            if (argInfo.argType === "const") {
                log.info("Skipping argument because it is a constant");
                continue;
            };

            // If argType is name, we have valid alias value, so lookup needed
            let aliasValue;
            if (argInfo.argType === "name") {
                aliasValue = argInfo.value;
            }

            
            // Go through each narrative and find the alias 
            let found = false;
            for (const node of narrativeInfo.narrative) {
                if (node?.alias?.aliasName === aliasValue) {
                    if (node.alias.persist) {
                        // Alias is persisted on the narrative path and will be available
                        log.info(`Alias ${aliasValue} is persisted and is available before primitive ${this.node.name}.`);
                        found = true;
                        // TODO: The alias can be removed from the world, have to verify this.
                    } else {
                        // Check if the nodes behavior is the same as target behavior
                        const expression1 = jsonata(`**[name='behavior' and body[id= '${this.node.id}']].behaviorName`);
                        const nodeBehavior = await expression1.evaluate(this.narrativeIR.narrative);

                        const expression2 = jsonata(`**[name='behavior' and body[id= '${endId}']].behaviorName`);
                        const finalBehavior = await expression2.evaluate(this.narrativeIR.narrative);
                        
                        if (nodeBehavior === finalBehavior) {
                            log.info(`Alias ${aliasValue} exists in behavior before primitive ${this.node.name}.`);
                            found = true;
                        }
                    }
                }
            }

            if (!found) {
                // Alias was not found
                const msg = `Missing Meaning: Alias ${aliasValue} was not found for primitive ${this.node.name}.`;
                log.info(msg);
            }
        }
    }

}