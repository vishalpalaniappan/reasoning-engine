import jsonata from 'jsonata';
import { Narratives } from './Narratives.js';
import { FoundNarratives } from './FoundNarratives.js';
import fsPromises from "node:fs/promises";

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

        this.narratives = new Narratives();
        this.foundNarratives = new FoundNarratives();
    }

    async run () {
        this.narratives.addNarrative(await this.findNarrativeArrayFromId(this.startId));
        this.walk();
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

    // Indicates if the end node has been reached.
    reachedEndNode(node) {
        return node.id === this.endId;
    }

    /**
     * Completes the current branch and also completes the corresponding
     * narrative that was constructed.
     * 
     * @param {Boolean} isValid 
     */
    completeBranch(isValid) {
        this.narratives.completeBranch();
        this.foundNarratives.completeNarrative(isValid);
    }

    /**
     * Walk the narrative.
     */
    async walk () {
        if (this.narratives.areAllBranchesDone()) {
            console.log("All branches are done");
            this.completeBranch(true);
            return;
        } else if (this.narratives.isBranchDone()) {
            console.log("Branch is done");
            this.completeBranch(true);
            this.walk();
            return;
        }

        const currNode = this.narratives.readCurrentNarrative();

        // Terminate loop if same decision is revisited
        if (this.foundNarratives.has(currNode)) {
            this.completeBranch(false);
            this.walk();
            return;
        }

        this.foundNarratives.addToCurrentNarrative(currNode);
        if (this.reachedEndNode(currNode)) {
            this.completeBranch(true);
            this.walk();
            return;
        }


        // Classify node name to select behavior
        if (currNode.name === "if") {
            console.log("\nBranching");
            this.foundNarratives.branchNarrative();
            this.narratives.branch(currNode.body);
        } else if (currNode.name === "invoke") {
            const invokedBehavior = await this.findInvokedBehaviorNode(currNode.behaviorName);
            this.narratives.stackCurrentNarrative(invokedBehavior.body);
            console.log(`Invoking ${currNode.behaviorName}`);
        }
        
        this.walk();
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
        const expression = jsonata(`**[name = 'behavior' and behaviorName = '${behaviorName}']`);
        return  await expression.evaluate(this.narrative);
    }

}