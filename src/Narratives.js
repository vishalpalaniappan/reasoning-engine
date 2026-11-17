import { Narrative } from "./Narrative.js";

/**
 * Stores the narratives being visited. When the narrative branches,
 * the existing branch is added to a stack and when the branch is done
 * the stack is returned to where it branched from.
 */
export class Narratives {

    constructor () {
        this.narrativeStack = [];
    }

    /**
     * Get the current narrative;
     * 
     * @returns {null|Array}
     */
    getCurrentNarrative () {
        if (this.narrativeStack.length == 0) {
            return null;
        } else {
            return this.narrativeStack[this.narrativeStack.length - 1];
        }
    }

    /**
     * Add the nodes of the narrative to the stack.
     * 
     * @param {Array} narrative 
     */
    addNarrative(narrative) {
        this.narrativeStack.push(
            new Narrative([...narrative])
        );
    }

    /**
     * Branch the narrative from the current position and load the new narrative
     * being processed.
     * 
     * @param {Array} nodes 
     */
    branch(nodes) {
        // Copy curr narrative but replace top of behavior stack with conditional nodes
        const stackCopy = structuredClone(this.getCurrentNarrative().behaviorStack);
        stackCopy[stackCopy.length - 1] = [...nodes];

        // Create new narrative and copy the behavior stack over
        const newNarrative = new Narrative();
        newNarrative.behaviorStack = stackCopy;

        this.narrativeStack.push(newNarrative);
    }

    /**
     * Reads the current step in the narrative. 
     * 
     * @returns {String}
     */
    readCurrentNarrative() {
        const currNode = this.getCurrentNarrative().shift();
        console.log("--->",currNode.name);
        return currNode;
    }

    /**
     * Adds the provided nodes to the narratives behavior stack.
     * 
     * @param {Array} nodes 
     */
    stackCurrentNarrative(nodes) {
        this.currNarrative = this.getCurrentNarrative();
        this.currNarrative.addStack([...nodes]);
    }

    /**
     * Check if the current narrative and all the branches are done.
     * 
     * @returns {Boolean}
     */
    areAllBranchesDone() {
        const currNarrative = this.getCurrentNarrative();
        if (!currNarrative || (currNarrative.get().length === 0 && this.narrativeStack.length === 0)) {
            console.log("Done walking.");
            return true;
        }
        return false;
    }

    /**
     * Check if the current branch is done.
     * 
     * @returns {Boolean}
     */
    isBranchDone() {
        const currNarrative = this.getCurrentNarrative();
        if(currNarrative.get().length === 0 && currNarrative.behaviorStack.length === 1) {
            return true;
        }
        return false;
    }

    /**
     * Complete the branch by popping the narrative stack.
     */
    completeBranch() {
        this.narrativeStack.pop();
    }
}