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
    }
}