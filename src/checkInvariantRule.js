
export const checkInvariantRule = (schema, data, parentSchema, dataCxt) => {
    const invariant = schema[0];
    const participantToCheck = invariant.participants[0];
    const participantAlias = dataCxt.parentData[participantToCheck];

    // Find all the nodes that update the alias
    const foundNodes = findAlias(participantAlias, dataCxt.rootData.narrative, []);

    // Property to check for and condition to evluate
    const propertyToCheck = invariant.property;
    const validValuesforProperty = invariant.condition;

    console.log(`Checking invariant property: ${propertyToCheck} for value: ${validValuesforProperty}`);

    for (const node of foundNodes) {
        if (node.name === "introduce") {
            const participant = findParticipant(node.participant, dataCxt.rootData.narrative);
            const attribute = getAttributeOfParticipant(participant, propertyToCheck);

            // Check if the attributes value is one of the valid values.
            if (!validValuesforProperty.includes(attribute.value)) {
                return false;
            }
        }
    }

    // Temporarily disabled, will add narrative checks next
    // Find all the narrative paths from the first found node to the invariant node
    // findPaths(foundNodes[0].id, dataCxt.parentData.id);

    return true;
}

// Finds all the nodes that update the alias
/**
 * Finds all the nodes that update the provided alias.
 * @param {String} alias Alias to find.
 * @param {*} tree Tree to search.
 * @param {*} foundList List of nodes found.
 * @returns {Array} Updated list of found nodes.
 */
const findAlias = (alias, tree, foundList) => {
    for (const node of tree) {
        if (node.alias === alias) 
            foundList.push(node);

        if ("body" in node) 
            findAlias(alias, node.body, foundList);
    }

    return foundList;
}

/**
 * Find the meaning of the participant.
 * @param {String} name Name of participant.
 * @param {Object} tree Tree to search.
 * @returns 
 */
const findParticipant = (name, tree) => {
    for (const node of tree) {
        if (node.name === "participant" && node.participantName === name) {
            return node;
        }
    }
}

/**
 * Gets the attribute of the participant (if it exists).
 * @param {Object} participant Meaning of participant.
 * @param {String} attribute Attribute to check.
 * @returns {Object}
 */
const getAttributeOfParticipant = (participant, attribute) => {
    for (const node of participant.body) {
        if (node.name === attribute) {
            return node;
        }
    }
}

// Finds all the parts from the startId to the end Id
const findPaths = (startId, endId) => {
    
}