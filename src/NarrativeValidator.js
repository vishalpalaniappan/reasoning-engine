
/**
 * Base class to validate the narratives.
 * 
 */
class NarrativeValidator {

    constructor (narrativeIR, schema) {
        this.narrativeIR = narrativeIR;
        this.schema = schema;
        this.manifest = this.schema.manifest;
    }

    /**
     * Run the validator.
     */
    run () {
        this.visit(this.narrativeIR.narrative);
    }

    /**
     * Visit the provided nodes and recursively visit nodes in body.
     * 
     * @param {Array} nodes 
     * @param {int} indent 
     */
    visit(nodes, indent = 0) {
        for (const node of nodes) {
            console.log(" ".repeat(indent) + node.name);
            this.processNode(node);
            if ("body" in node) {
                this.visit(node["body"], indent + 2);
            }
        }
    }

    /**
     * Validate the node.
     * 
     * @param {Object} node 
     */
    processNode(node) {
        const name = node.name;
    }

}

export default NarrativeValidator;