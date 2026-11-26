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
    async getPrimitiveSchema (primitiveName) {
        /**
         * Lookup schema for primitive from the $defs.
         * 
         * I am looking up the primitive schema because I working with the old
         * schema structure. In my updated schema, I will just just make it
         * directly accessible using the primitive name.
         */
        function findFirstByDollarId(node, targetId) {
            // Recurse on the array
            if (Array.isArray(node)) {
                for (const item of node) {
                const found = findFirstByDollarId(item, targetId);
                if (found !== undefined) return found;
                }
                return undefined;
            }

            // Recurse on the object
            if (node !== null && typeof node === 'object') {

                // If $id is found, then exit early
                if (node.$id === targetId) {
                    return node;
                }
                for (const value of Object.values(node)) {
                    const found = findFirstByDollarId(value, targetId);
                    if (found !== undefined) return found;
                }
            }

            return undefined;
        }

        return findFirstByDollarId(this.schema, `./${primitiveName}.schema.json`);
    }

    getManifest () {
        return this.schema.manifest;
    }

}