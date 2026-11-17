/**
 * Stores all the narratives that have been found.
 */
export class FoundNarratives {

    constructor () {
        this.narratives = [];
        this.currNarrative = [];
    }

    completeNarrative() {
        if (this.currNarrative.length === 0) return;
        console.log("Reached end, current narrative path is done");
        this.narratives.push([...this.currNarrative]);
        this.currNarrative = [];
    }

    addToCurrentNarrative(node) {
        this.currNarrative.push(node);
    }
}