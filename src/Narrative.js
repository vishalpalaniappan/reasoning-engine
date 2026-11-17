

export class Narrative {

    constructor (currNarrative) {
        this.behaviorStack = [];
        if (currNarrative) {
            this.behaviorStack.push([...currNarrative]);
        }
    }

    add (node) {
        this.behaviorStack[this.behaviorStack.length - 1].push({...node});
    }

    shift() {
        const currNarrative = this.behaviorStack[this.behaviorStack.length - 1];
        return currNarrative.shift();
    }

    addStack(nodes) {
        this.behaviorStack.push(nodes);
    }

    get() {
        const currNarrative = this.behaviorStack[this.behaviorStack.length - 1];
        if (currNarrative.length == 0 && this.behaviorStack.length > 1) {
            this.behaviorStack.pop();
        }
        return this.behaviorStack[this.behaviorStack.length - 1];
    }
}