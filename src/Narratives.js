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

    getCurrentNarrative () {
        if (this.narrativeStack.length == 0) {
            return null;
        } else {
            return this.narrativeStack[this.narrativeStack.length - 1];
        }
    }

    addNarrative(narrative) {
        this.narrativeStack.push(
            new Narrative([...narrative])
        );
    }

    branch(nodes) {
        const narrative = this.narrativeStack[this.narrativeStack.length - 1];
        const stackCopy = structuredClone(narrative.behaviorStack);
        stackCopy[stackCopy.length - 1] = [...nodes];

        const newNarrative = new Narrative();
        newNarrative.behaviorStack = stackCopy;

        this.narrativeStack.push(newNarrative);
    }

    readCurrentNarrative() {
        const currNarrative = this.getCurrentNarrative();
        const currNode = currNarrative.shift();
        console.log("--->",currNode.name);
        return currNode;
    }

    stackCurrentNarrative(nodes) {
        this.currNarrative = this.getCurrentNarrative();
        this.currNarrative.addStack([...nodes]);
    }

    areAllBranchesDone() {
        const currNarrative = this.getCurrentNarrative();
        if (!currNarrative || (currNarrative.get().length === 0 && this.narrativeStack.length === 0)) {
            console.log("Done walking.");
            return true;
        }
        return false;
    }

    isBranchDone() {
        const currNarrative = this.getCurrentNarrative();
        if(currNarrative.get().length === 0 && currNarrative.behaviorStack.length === 1) {
            return true;
        }
        return false;
    }

    completeBranch() {
        this.narrativeStack.pop();
    }
}