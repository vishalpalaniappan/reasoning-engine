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
        return currNarrative.shift();
    }

    isDone() {
        const currNarrative = this.getCurrentNarrative();
        return (currNarrative.length === 0 && this.narrativeStack.length === 0);
    }

    isBranchDone() {
        const currNarrative = this.getCurrentNarrative();
        if(currNarrative.length === 0) {
            this.narrativeStack.pop();
            return true;
        }
        return false;
    }
}