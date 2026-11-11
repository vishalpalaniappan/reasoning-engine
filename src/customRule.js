export const customRule = (schema, data, parentSchema, dataCxt) => {
    console.log("Invariant Data:", data);
    console.log(parentSchema["x-invariant-metadata"])
    return true;
}