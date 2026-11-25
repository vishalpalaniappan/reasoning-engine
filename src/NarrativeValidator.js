import jsonata from "jsonata";
import ArthaSchema from "./ArthaSchema.js";
import { styleText } from 'node:util';

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
            await this.processNode(node, indent);
            if ("body" in node) {
                await this.visit(node["body"], indent + 2);
            }
        }
    }

    /**
     * Validate the node.
     * 
     * @param {Object} node 
     * @param {Number} indent
     */
    async processNode(node, indent) {
        // Load the primitive schema
        const primSchema = await this.schema.getPrimitiveSchema(node.name);

        const invariant =  primSchema.properties.name["x-invariant-metadata"];

        if (invariant) {
            console.log(styleText('red', " ".repeat(indent) + node.name));
        } else {
            console.log(" ".repeat(indent) + node.name);
        }
    }

}

export default NarrativeValidator;