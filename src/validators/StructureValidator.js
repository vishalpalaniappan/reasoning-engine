import { getLogger } from '../logger/logger.js';

const log = getLogger('structure');
/**
 * Validate the structure of the narrative using the manifest.
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
        log.info(`Running the structure validator`);
        log.info("============================================");
        await this.validate(this.node);
    }

    /**
     * Validate the structure using the manifest.
     */
    async validate() {
        if (this.node.name === "behavior") {
            log.info(`Validating structure of behavior contents.`)
        } else if (this.node.name === "participant") {
            log.info(`Validating structure of participant contents.`)
        }
    }
}