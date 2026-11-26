import ArthaSchema from "./helper/ArthaSchema.js";
import VALIDATOR_MODES from "./VALIDATOR_MODES.js";
import ExistenceValidator from "./validators/ExistenceValidator.js";
import StructureValidator from "./validators/StructureValidator.js";
import InvariantValidator from "./validators/InvariantValidator.js";

/**
 * Base class to validate the narratives.
 * 
 */
class NarrativeValidator {

    constructor (narrativeIR, schema) {
        this.narrativeIR = narrativeIR;
        this.schema = new ArthaSchema(schema);
        this.manifest = this.schema.getManifest();
        this.mode = VALIDATOR_MODES.INVARIANT;
    }

    /**
     * Run the validator.
     */
    async run () {
        await this.visit(this.narrativeIR.narrative);
    }

    /**
     * Visit the provided nodes and recursively visit nodes in body.
     * 
     * @param {Array} nodes Nodes being visited.
     * @param {int} level Depth of the recursion (used for printing tree to console).
     */
    async visit(nodes, level = 0) {
        for (const node of nodes) {
            // console.log(" ".repeat(level) + node.name);

            if (this.mode === VALIDATOR_MODES.STRUCTURAL) {
                await this.processStructural(node);
            } else if (this.mode === VALIDATOR_MODES.EXISTS) {
                await this.processExists(node);
            } else if (this.mode === VALIDATOR_MODES.INVARIANT) {
                await this.processInvariant(node);
            }

            if ("body" in node) {
                await this.visit(node["body"], level + 2);
            }
        }
    }


    /**
     * Process structural node to verify correctness. 
     * 
     * Ex:
     * - Types of primitives allowed in behaviors
     * - Necessary attributes for participants
     * - Ex. List struct must state what the list can contain
     * - Order of primitives
     * - Missing primitives
     * 
     * Enforce the correctness by reading the manifest and
     * verify that the rules are being followed.
     * 
     * @param {Object} node 
     */
    async processStructural(node) {
        if (this.manifest.structuralTypes.includes(node.name)) {
            const validator = new StructureValidator(this.narrativeIR, this.manifest, node);
            await validator.run();
        }
    }

    /**
     * Validate that meaning exists.
     * @param {Object} node Node being processed.
     */
    async processExists(node) {
        const primSchema = await this.schema.getPrimitiveSchema(node.name);
        const existenceChecks = primSchema.properties.args?.$exists;
        if (existenceChecks) {
            const validator = new ExistenceValidator(this.narrativeIR, node, existenceChecks);
            await validator.run();
        }
    }

    /**
     * Validate invariants.
     * 
     * @param {Object} node Node being processed.
     */
    async processInvariant(node) {
        const primSchema = await this.schema.getPrimitiveSchema(node.name);
        const invariant =  primSchema.properties.name["x-invariant-metadata"];
        if (invariant) {
            const validator = new InvariantValidator(this.narrativeIR, node, invariant);
            await validator.run();
        }
    }
}

export default NarrativeValidator;