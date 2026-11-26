import jsonata from "jsonata";
import { NarrativeFinder } from "../narrative_processor/NarrativeFinder.js";
import { getLogger } from '../logger/logger.js';

const log = getLogger('existence');
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
    }

    async run() {
        log.info("");
        log.info("============================================");
        log.info(`Running the invariant validator: ${this.node.name}`);
        log.info("============================================");
    }

    async validate() {

    }

}