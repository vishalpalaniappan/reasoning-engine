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
     * @returns {null}
     */
    completeNarrative() {
        if (this.narrativeStack.length === 0) return;
        console.log("Reached end, current narrative path is done");
        this.narratives.push([...this.narrativeStack.pop()]);

        if (this.narrativeStack.length > 0) {
            console.log("Resuming narrative")
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
        if (node.name == "terminal_display") {
            this.getCurrNarrative().push(
                node.id.split("-")[0] + ":" + node.name + "," + node.args[0].value
            );
        } else {
            this.getCurrNarrative().push(
                node.id.split("-")[0] + ":" + node.name
            );
        }
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
}