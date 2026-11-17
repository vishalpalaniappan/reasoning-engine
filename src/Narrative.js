

export class Narrative {

    constructor (currNarrative) {
        this.behaviorStack = [[...currNarrative]];
    }

    add (node) {
        if (this.behaviorStack.length == 0) {
            this.behaviorStack.push([]);
        }
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
        if (currNarrative.length == 0 && this.behaviorStack.length > 0) {
            console.log("Moving down behavior stack");
            this.behaviorStack.pop();
        }
        return this.behaviorStack[this.behaviorStack.length - 1];
    }
}