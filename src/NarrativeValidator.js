import ArthaSchema from "./ArthaSchema.js";
import VALIDATOR_MODES from "./VALIDATOR_MODES.js";

/**
 * Base class to validate the narratives.
 * 
 */
class NarrativeValidator {

    constructor (narrativeIR, schema) {
        this.narrativeIR = narrativeIR;
        this.schema = new ArthaSchema(schema);
        this.manifest = this.schema.getManifest();
        this.mode = VALIDATOR_MODES.STRUCTURAL;
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
            console.log(" ".repeat(level) + node.name);

            if (this.mode === VALIDATOR_MODES.STRUCTURAL) {
                await this.processStructural(node);
            } else if (this.mode === VALIDATOR_MODES.EXISTS) {
                await this.processExists(node);
            } else if (this.mode === VALIDATOR_MODES.INVARIANT) {
                await this.processInvariant();
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
     * - Types of nodes allowed in behaviors
     * - Necessary attributes for participants
     * 
     * Enforce the correctness by reading the manifest and
     * loading the rules. I could also build a schema and
     * enforce that but I want to maintain control over the
     * process fully so I can customize it cleanly.
     * 
     * @param {Object} node 
     */
    async processStructural(node) {

    }

    /**
     * Validate that meaning exists.
     * @param {Object} node Node being processed.
     */
    async processExists(node) {
        const primSchema = await this.schema.getPrimitiveSchema(node.name);
        const exists = primSchema.properties.args?.$exists;
    }

    /**
     * Validate invariants.
     * 
     * @param {Object} node Node being processed.
     */
    async processInvariant(node) {
        const primSchema = await this.schema.getPrimitiveSchema(node.name);
        const invariant =  primSchema.properties.name["x-invariant-metadata"];
    }
}

export default NarrativeValidator;