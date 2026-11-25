
/**
 * A class to work with the schema.
 */
export default class ArthaSchema {

    constructor (schema) {
        this.schema = schema;
    }

    /**
     * Get the primitive schema from the Artha Schema.
     * 
     * @param {String} primitive 
     */
    getPrimitiveSchema (primitive) {
        /**
         * Lookup schema for primitive from the $defs.
         * 
         * I am looking up the primitive schema because I working with the old
         * schema structure. In my updated schema, I will just just make it
         * directly accessible using the primitive name.
         */
    }

    getManifest () {
        return this.schema.manifest;
    }




}