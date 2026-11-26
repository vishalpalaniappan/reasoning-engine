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

    constructor (narrativeIR, node, invariant) {
        this.narrativeIR = narrativeIR;
        this.node = node;
        this.invariant = invariant;
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
    }

}