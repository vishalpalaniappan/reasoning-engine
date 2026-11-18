
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
     * Gets the current narrative from the top of the stack.
     * 
     * @returns {Array}
     */
    getCurrentNarrative () {
        return this.behaviorStack[this.behaviorStack.length - 1];
    }

    /**
     * Add a node to the behavior stack
     * 
     * @param {Object} node 
     */
    add (node) {
        this.getCurrentNarrative().push({...node});
    }

    /**
     * Get the node from the narrative (removes it from the narrative)
     * 
     * @returns {Object}
     */
    shift() {
        return this.getCurrentNarrative().shift();
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
        if (this.getCurrentNarrative().length == 0 && this.behaviorStack.length > 1) {
            this.behaviorStack.pop();
        }
        return this.getCurrentNarrative();
    }
}