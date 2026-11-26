/**
 * Validate the existence of the relevant alias in the narrative.
 *
 * The argument that must be validated will be highlighted by the
 * schema.This can take a few forms, for example, either an alias
 * itself or the definition of a participant that was introduced.
 */
export default class ExistenceValidator {

    constructor (narrative, node, existenceChecks) {
        this.narrative = narrative;
        this.node = node;
        this.existenceChecks = existenceChecks;
    }

    async run() {
        console.log("Running the existence validator:", this.node.name);
        for (const check of this.existenceChecks) {
            this.validate(check);
        }
    }

    validate(arg) {
        console.log("Validating:", arg);

    }


}