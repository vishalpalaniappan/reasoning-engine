
/**
 * Base class to validate the narratives.
 * 
 */
class NarrativeValidator {

    constructor (narrativeIR) {
        this.narrativeIR = narrativeIR;
        this.visit(this.narrativeIR.narrative);
    }

    visit(body, indent = 0) {
        for (const node of body) {
            console.log(" ".repeat(indent) + node.name);
            if ("body" in node) {
                this.visit(node["body"], indent + 2);
            }
        }
    }

}

export default NarrativeValidator;