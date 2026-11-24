import { str } from "ajv";

/**
 * Stores all the narratives that have been found.
 */
export class FoundNarratives {

    constructor () {
        this.narrativeStack = [[]];
        this.narratives = [];
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

        const narrativeInfo = {
            isValid: isValid,
            narrative: [...this.narrativeStack.pop()]
        }

        this.narratives.push(narrativeInfo);

        if (this.narrativeStack.length > 0) {
            //console.log("Resuming narrative")
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
     * Generates a report from the narratives.
     */
    generateReport() {
        const report = [];
        for (const narrative of this.narratives) {

            if (!narrative.isValid) continue;
            
            const narrativeInfo = {};
            const currNarrative = [];

            // Summarize each narrative
            for (const node of narrative.narrative) {
                const _id = node.id.split("-")[0];
                if (node.name === "introduce") 
                    currNarrative.push(_id + ":" + node.name + "," + node.args[1].value);
                else if (node.name === "if") 
                    currNarrative.push(_id + ":" + node.name + "," + node.args[0].argName);
                else if (node.name === "invoke") 
                    currNarrative.push(_id + ":" + node.name + "," + node.behaviorName);
                else if (node.name === "terminal_display") 
                    currNarrative.push(_id + ":" + node.name + "," + node.args[0].value);
                else 
                    currNarrative.push(_id + ":" + node.name);
            }

            narrativeInfo.narrative = currNarrative;
            narrativeInfo.doesNotLoop = narrative.isValid;

            report.push(narrativeInfo);
        }
        return report;
    }
}