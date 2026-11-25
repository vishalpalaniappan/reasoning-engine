import ArthaSchema from "./ArthaSchema.js";
/**
 * Base class to validate the narratives.
 * 
 */
class NarrativeValidator {

    constructor (narrativeIR, schema) {
        this.narrativeIR = narrativeIR;
        this.schema = new ArthaSchema(schema);
        this.manifest = this.schema.getManifest();
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
     * @param {Array} nodes 
     * @param {int} indent 
     */
    async visit(nodes, indent = 0) {
        for (const node of nodes) {
            console.log(" ".repeat(indent) + node.name);
            await this.processNode(node);
            if ("body" in node) {
                await this.visit(node["body"], indent + 2);
            }
        }
    }

    /**
     * Validate the node.
     * 
     * @param {Object} node 
     */
    async processNode(node) {
        // Load the primitive schema
        const primSchema = await this.schema.getPrimitiveSchema(node.name);
    }

}

export default NarrativeValidator;