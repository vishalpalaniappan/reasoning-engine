import jsonata from 'jsonata';

/**
 * Given a start and end ID, this class will find the unique narratives.
 * 
 * The narrative will branch at conditional nodes when the design reasons about
 * the meaning of the world and selects new meaning. Since there are composite
 * branches, the narrative will also have to drive ito the composite behavior
 * and return back to the main narrative.
 * 
 * I will have to maintain a stack for the narrative branch and also maintain
 * a stack to keep track of the narrative branches. I will outline the algorithm
 * in more detail before continuing.  
 * 
 */
export class NarrativeFinder {

    constructor (narrative, fromId, toId) {
        this.narrative = narrative;
        this.startId = fromId;
        this.endId = toId;
        this.narrativeStack = [];
        this.invokeStack = [];
        this.narratives = [];
        this.init();
    }

    async init () {
        this.narrativeStack.push(await this.findNarrativeArrayFromId(this.startId));
        console.log("");
        console.log("Walking");
        this.walk();
        console.log(this.narratives);
    }

    /**
     * Given the id, this method returns an array of nodes which
     * contains the narrative starting at the provided id. From this
     * node, the algorithm can walk forward to reach the end node.
     * 
     * @param {String} id 
     * @returns 
     */
    async findNarrativeArrayFromId (id) {
        const expression = jsonata(`**[body[id = '${id}']]`);
        const parentNode =  await expression.evaluate(this.narrative);
        const index = parentNode.body.findIndex((item) => item.id === id);
        const sliced = index !== -1 ? parentNode.body.slice(index) : [];
        return sliced;
    }

    getCurrNarrative () {
        if (this.narrativeStack.length === 0) {
            return null;
        } else {
            return this.narrativeStack[this.narrativeStack.length - 1];
        }
    }

    /**
     * Walk the narrative.
     */
    async walk () {
        const currNarrative = this.getCurrNarrative();
        if (!currNarrative) return;

        if (currNarrative.length === 0 && this.narrativeStack.length === 0) {
            // No more nodes, done walking.
            console.log("Done walking.");
            return;
        } else if (currNarrative.length === 0) {
            // Current stack is done but more to walk.
            this.narrativeStack.pop();
            this.walk();
            return;
        }


        const currNode = currNarrative.shift();
        console.log("--->",currNode.name);
        
        // Add the current node to the narrative
        currNarrative.push({...currNode});
        
        // Reached end
        if (currNode.id === this.endId) {
            console.log("Reached end, current narrative path is done");
            this.narratives.push([...currNarrative]);
            return;
        }

        // TODO: Reached loop
        // Terminate loop if same decision is revisited


        // Classify node name to select behavior
        if (currNode.name === "if") {
            // Branch
            this.narrativeStack.push([...currNarrative]);
            this.walk();
        } else if (currNode.name === "invoke") {
            // Behavior Stack
            // this.behaviorStack.push();
            console.log(`Invoking ${currNode.name}`);
        } else {
            this.walk();
        }       

    }

    /**
     * Find the invoked behavior given the behavior name. This is called when
     * a node in the narrative being walked invokes a new behavior. If there are
     * nodes still remaining in the narrative being walked, this gets added to the
     * stack and when the invoked behaviors narrative is done, it is removed from
     * the stack and it continues in the behavior below it in the stack. 
     * 
     * @param {String} behaviorName The behavior to find
     */
    async findInvokedBehaviorNode (behaviorName) {

    }
    

    

}