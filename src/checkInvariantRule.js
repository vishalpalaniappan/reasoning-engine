
export const checkInvariantRule = (schema, data, parentSchema, dataCxt) => {
    // console.log("\nSchema:");
    // console.log(schema);

    // console.log("\nData:");
    // console.log(data);
    
    // console.log("\nParentSchema:");
    // console.log(parentSchema);

    // console.log("\nDataCxt:");
    // console.log(dataCxt);

    const invariant = schema[0];
    const participantToCheck = invariant.participants[0];
    const propertyToCheck = invariant.property;
    const conditionToEvaluate = invariant.condition[0];

    const participantAlias = dataCxt.parentData[participantToCheck];

    const foundNodes = findAlias(participantAlias, dataCxt.rootData.narrative, []);

    console.log(foundNodes);

    return true;
}

const findAlias = (alias, tree, foundList) => {
    for (const node of tree) {
        if (node.alias === alias) 
            foundList.push(node);

        if ("body" in node) 
            findAlias(alias, node.body, foundList);
    }

    return foundList;
}