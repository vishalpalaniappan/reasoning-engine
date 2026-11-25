import { str } from "ajv";

/**
 * Stores all the narratives that have been found.
 */
export class FoundNarratives {

    constructor () {
        this.narrativeStack = [[]];
        this.narratives = [];
        this.report = [];
    }

    getCurrNarrative () {
        return this.narrativeStack[this.narrativeStack.length - 1];
    }

    /**
     * Completes the narrative but copying the current narrative
     * into the narratives array.
     * 
     * @param {Boolean} Is the narrative valid (does it loop?)
     * 
     * @returns {null}
     */
    completeNarrative(isValid) {
        if (this.narrativeStack.length === 0) return;
        //console.log("Reached end, current narrative path is done");

        const narrative = this.narrativeStack.pop();

        const narrativeInfo = {
            isValid: isValid,
            narrative: [...narrative]
        }
        this.narratives.push(narrativeInfo);

        // Create report
        if (isValid) {
            const reportInfo = {
                doesNotLoop: isValid,
                narrative: []
            };
            for (const node of narrativeInfo.narrative) {
                reportInfo.narrative.push(this.formatNodeToString(node));
            }
            this.report.push(reportInfo);
        }
    }

    /**
     * Adds the provided node to the current narrative.
     * 
     * For debugging purposes, I am formatting the output to include the name and if
     * the name is terminal_display, I display the message to identify it.
     * @param {Object} node 
     */
    addToCurrentNarrative(node) {
        this.getCurrNarrative().push(node);
    }

    /**
     * Branches the narrative by copying the current narrative.
     */
    branchNarrative() {
        this.narrativeStack.push([...this.getCurrNarrative()]);
    }

    /**
     * Checks if the provided node exists in the narrative by checking the id.
     * 
     * @param {Object} node 
     * @returns {Boolean}
     */
    has(node) {
        const found = this.getCurrNarrative().find((n) => n.id === node.id);
        if (found) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Format the node to a string for printing.
     * @param {Object} node 
     * @returns 
     */
    formatNodeToString (node) {
        const _id = node.id.split("-")[0];
        if (node.name === "introduce") 
            return _id + ":" + node.name + "," + node.args[1].value;
        else if (node.name === "if") 
            return _id + ":" + node.name + "," + node.args[0].argName;
        else if (node.name === "invoke") 
            return _id + ":" + node.name + "," + node.behaviorName;
        else if (node.name === "terminal_display") 
            return _id + ":" + node.name + "," + node.args[0].value;
        else 
            return _id + ":" + node.name;
    }
}