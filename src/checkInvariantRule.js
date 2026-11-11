
export const checkInvariantRule = (schema, data, parentSchema, dataCxt) => {
    const invariant = schema[0];
    const participantToCheck = invariant.participants[0];
    const participantAlias = dataCxt.parentData[participantToCheck];

    // Find all the nodes that update the alias
    const foundNodes = findAlias(participantAlias, dataCxt.rootData.narrative, []);

    // Find all the narrative paths from the first found node to the invariant node
    findPaths(foundNodes[0].id, dataCxt.parentData.id);

    // Check if the property satisfies the condition and establish semantic validity
    const propertyToCheck = invariant.property;
    const conditionToEvaluate = invariant.condition[0];

    return true;
}

// Finds all the nodes that update the alias
const findAlias = (alias, tree, foundList) => {
    for (const node of tree) {
        if (node.alias === alias) 
            foundList.push(node);

        if ("body" in node) 
            findAlias(alias, node.body, foundList);
    }

    return foundList;
}

// Finds all the parts from the startId to the end Id
const findPaths = (startId, endId) => {
    
}