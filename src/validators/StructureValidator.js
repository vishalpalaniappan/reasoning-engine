import { getLogger } from '../logger/logger.js';

const log = getLogger('structure');
/**
 * Validate the structure of the narrative using the manifest.
 * 
 * Note: I want to add the process of validating in the structure
 * into the actual manifest rather than hardcoding it here. So for
 * example, for invoke, the manifest will say that the behaviorName
 * key must exist and it must be in a node called behavior. So in this
 * way, the engine is enforcing that definition of correctness. 
 * 
 * You can see that here, I am hardcoding some of this but this is fine
 * for now, in the end, everything that is done here will come from 
 * instructions encoded in the manifest.
 */
export default class StructureValidator {

    constructor (narrativeIR, node) {
        this.narrativeIR = narrativeIR;
        this.manifest = narrativeIR.manifest;
        this.node = node;
    }

    async run() {
        log.info("");
        log.info("============================================");
        log.info(`Running the structure validator: ${this.node.name}`);
        log.info("============================================");
        await this.validate(this.node);
    }

    /**
     * Validate the structure using the manifest.
     */
    async validate() {
        if (this.node.name === "behavior") {
            log.info(`Validating structure of behavior contents.`)
            this.processBehavior();
        } else if (this.node.name === "participant") {
            this.processParticipant();
        } else if (this.node.name === "import") {
            this.processImport();
        } else if (this.node.name === "invoke") {
            this.processInvoke();
        }
    }

    async processInvoke() {
        log.info(`Validating structure of invoke contents.`);
        // TODO: Check if behavior being invoked exists
    }

    async processBehavior() {
        log.info(`Validating structure of behavior contents.`);
        // TODO: Check if nodes in behavior satisfy manifest structure
    }

    async processParticipant() {
        log.info(`Validating structure of participant contents.`);
        // TODO: Check if nodes in participant satisfy manifest structure
        // TODO: For specific structural types, check if necessary attributes exist
    }

    async processImport() {
        log.info(`Validating structure of import contents.`);
        // TODO: Validate that the imported file exists
    }
}