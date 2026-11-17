/**
 * Stores all the narratives that have been found.
 */
export class FoundNarratives {

    constructor () {
        this.narratives = [];
        this.currNarrative = [];
    }

    completeNarrative() {
        this.narratives.push([this.currNarrative]);
        this.currNarrative = [];
    }

    addToCurrNarrative(node) {
        this.currNarrative.push(node);
    }
}