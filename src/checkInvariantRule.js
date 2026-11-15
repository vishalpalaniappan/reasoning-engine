import jsonata from 'jsonata';

export const checkInvariantRule = async (schema, data, parentSchema, dataCxt) => {
    // Load the invariant data
    const invariant = schema[0];
    const participantToCheck = invariant.participants[0];
    const propertyToCheck = invariant.property;
    const validValuesforProperty = invariant.condition;

    // Get the alias for the property being evaluated
    let expression = jsonata(`args[argName = "${participantToCheck}"].value`);
    const alias = await expression.evaluate(dataCxt.parentData);
    console.log(alias);

    // Find when the alias was introduced
    expression = jsonata(`**[name and alias[aliasName = '${alias}' and introduce = true]]`);
    const foundNode = await expression.evaluate(dataCxt.rootData);
    console.log(foundNode);

    return true;
}