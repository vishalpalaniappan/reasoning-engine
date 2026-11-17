
/**
 * Narrative class that holds the nodes being visited. As each node is visited,
 * it is removed from the narrative. A behavior stack is maintained to keep the
 * hierarchy of narratives as composite behaviors are invoked. When the current
 * position in the behavior stack finishes, it is removed and the narrative 
 * continues in the level below it.
 */
export class Narrative {

    constructor (currNarrative) {
        this.behaviorStack = [];
        if (currNarrative) {
            this.behaviorStack.push([...currNarrative]);
        }
    }

    /**
     * Add a node to the behavior stack
     * 
     * @param {Object} node 
     */
    add (node) {
        this.behaviorStack[this.behaviorStack.length - 1].push({...node});
    }

    /**
     * Get the node from the narrative (removes it from the narrative)
     * 
     * @returns {Object}
     */
    shift() {
        const currNarrative = this.behaviorStack[this.behaviorStack.length - 1];
        return currNarrative.shift();
    }

    /**
     * Add new nodes to the behavior stack.
     * 
     * @param {Array} nodes 
     */
    addStack(nodes) {
        this.behaviorStack.push(nodes);
    }

    /**
     * Get the current narrative and if the top of the stack is done, then
     * remove it and continue with the new narrative at the top of the stack.
     * 
     * @returns {Array}
     */
    get() {
        const currNarrative = this.behaviorStack[this.behaviorStack.length - 1];
        if (currNarrative.length == 0 && this.behaviorStack.length > 1) {
            this.behaviorStack.pop();
        }
        return this.behaviorStack[this.behaviorStack.length - 1];
    }
}