import jsonata from "jsonata";
import { NarrativeFinder } from "../narrative_processor/NarrativeFinder.js";

/**
 * Validate the existence of the relevant alias in the narrative.
 *
 * The argument that must be validated will be highlighted by the
 * schema.This can take a few forms, for example, either an alias
 * itself or the definition of a participant that was introduced.
 */
export default class ExistenceValidator {

    constructor (narrativeIR, node, existenceChecks) {
        this.narrativeIR = narrativeIR;
        this.node = node;
        this.existenceChecks = existenceChecks;
    }

    async run() {
        console.log("");
        console.log("============================================");
        console.log("Running the existence validator:", this.node.name);
        console.log("============================================");
        for (const check of this.existenceChecks) {
            await this.validate(check);
        }
    }

    async validate(arg) {
        console.log("Validating:", arg);
        
        const initialBehavior = this.narrativeIR.initialBehavior;
        const behavior = await jsonata(`**[behaviorName= '${initialBehavior}']`).evaluate(this.narrativeIR);
        const startId = behavior.body[0].id;
        const endId = this.node.id;

        const finder = new NarrativeFinder(this.narrativeIR.narrative, startId, endId);
        await finder.run();

        console.log(finder.foundNarratives.report);
    }

}