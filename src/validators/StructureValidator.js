import jsonata from 'jsonata';
import { getLogger } from '../logger/logger.js';
import { loggers } from 'winston';

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

    constructor (narrativeIR, manifest, node) {
        this.narrativeIR = narrativeIR;
        this.manifest = manifest;
        this.node = node;
    }

    async run() {
        log.info("");
        log.info("=======================================================");
        log.info(`Running the structure validator: ${this.node.name}`);
        log.info("=======================================================");
        await this.validate(this.node);
    }

    /**
     * Validate the structure using the manifest.
     */
    async validate() {
        if (this.node.name === "behavior") {
            await this.processBehavior();
        } else if (this.node.name === "participant") {
            await this.processParticipant();
        } else if (this.node.name === "import") {
            await this.processImport();
        } else if (this.node.name === "invoke") {
            await this.processInvoke();
        }
    }

    async processInvoke() {
        // TODO: Check if behavior being invoked exists
        const expression1 = jsonata(`**[name='behavior' and behaviorName='${this.node.behaviorName}']`);
        const nodeBehavior = await expression1.evaluate(this.narrativeIR.narrative);
        if (nodeBehavior) {
            log.info(`${this.node.behaviorName} exists.`)
        } else {
            log.info(`Missing meaning: Behavior named ${this.node.behaviorName} does not exist.`)
        }
    }

    /**
     * Visit all the nodes in the body of the behavior and validate that
     * only the permitted nodes are included.
     */
    async processBehavior() {
        const canContain = this.manifest.structure.behavior.contains;

        for (const bodyNode of this.node.body) {
            // Each primitive type contains an array called exclude for invalid types
            for (const primitiveType of Object.values(canContain)) {
                if (primitiveType.excludes.includes(bodyNode.name)) {
                    log.info(`Inconsistency: ${bodyNode.name} node in body of behavior`);
                }
            }
        }
    }

    async processParticipant() {
        // TODO: Check if nodes in participant satisfy manifest structure
        // TODO: For specific structural types, check if necessary attributes exist
        // TODO: Check if initial value of participant matches its structural type

        log.info(`Participant Name: ${this.node.participantName}`);

        const initial_value = await jsonata(`**[name = 'initial_value'].args[0].value`).evaluate(this.node);
        const structural_type = await jsonata(`**[name = 'structural_type'].args[0].value`).evaluate(this.node);
        
        if (initial_value) {
            await this.validateInitialValue(typeof initial_value, structural_type);
        }
    }

    async validateInitialValue(initial_value_type, structural_type) {
        let isInvalid = false;
        if (initial_value_type === "number" && ( structural_type !== "float" && structural_type !== "int")) {
            isInvalid = true;
        } else if (initial_value_type === "number" && structural_type !== "string") {
            isInvalid = true;
        } else if (initial_value_type === "array" && structural_type !== "list") {
            isInvalid = true;
        }

        if (isInvalid) {
            log.info(`Inconsistency: Initial value type ${initial_value_type} doesn't match structural type ${structural_type}`);
        }
    }

    async processImport() {
        // TODO: Validate that the imported file exists
    }
}