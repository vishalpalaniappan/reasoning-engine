

export class Narrative {

    constructor (currNarrative) {
        this.behaviorStack = [];
        this.currNarrative = [...currNarrative];
    }

    add (node) {
        this.currNarrative.push({...node});
    }

    shift() {
        return this.currNarrative.shift();
    }

    get() {
        return this.currNarrative;
    }
}