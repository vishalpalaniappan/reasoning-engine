

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
        if (currNarrative.length == 0 && this.behaviorStack.length > 0) {
            this.behaviorStack.pop();
        }
        const node =  currNarrative.shift();
        return node;
    }

    addStack(nodes) {
        this.behaviorStack.push(nodes);
    }

    get() {
        return this.behaviorStack[this.behaviorStack.length - 1];
    }
}