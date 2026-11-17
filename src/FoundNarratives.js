/**
 * Stores all the narratives that have been found.
 */
export class FoundNarratives {

    constructor () {
        this.narrativeStack = [[]];
        this.narratives = [];
        this.currNarrative = [];
    }

    completeNarrative() {
        if (this.narrativeStack.length === 0) return;
        console.log("Reached end, current narrative path is done");
        this.narratives.push([...this.narrativeStack.pop()]);

        if (this.narrativeStack.length > 0) {
            console.log("Resuming narrative")
        }
    }

    addToCurrentNarrative(node) {
        if (node.name == "terminal_display") {
            this.narrativeStack[this.narrativeStack.length - 1].push(node.name + "," + node.args[0].value);
        } else {
            this.narrativeStack[this.narrativeStack.length - 1].push(node.name);
        }
    }

    branchNarrative() {
        this.narrativeStack.push([...this.narrativeStack[this.narrativeStack.length - 1]]);
    }

    has(node) {
        const found = this.currNarrative.find((n) => n.id === node.id);
        if (found) {
            return true;
        } else {
            return false;
        }
    }
}