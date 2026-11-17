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
            return this.narrativeStack[this.narrativeStack.length - 1]
        }
    }

    addNarrative(narrative) {
        this.narrativeStack.push(
            new Narrative([...narrative])
        );
    }

    branch() {
        this.narrativeStack.push(
            new Narrative([...this.getCurrentNarrative()])
        );
    }

    readCurrentNarrative() {
        const currNarrative = this.getCurrentNarrative();
        const currNode = currNarrative.shift();
        console.log("--->",currNode.name);
        return currNode;
    }

    areAllBranchesDone() {
        const currNarrative = this.getCurrentNarrative();
        const isDone = (currNarrative.length === 0 && this.narrativeStack.length === 0);
        if(isDone) console.log("Done walking.");
        return ;
    }

    isBranchDone() {
        const currNarrative = this.getCurrentNarrative();
        if(currNarrative.length === 0) {
            this.narrativeStack.pop();
            return true;
        }
        return false;
    }

    completeBranch() {
        this.narrativeStack.pop();
    }
}