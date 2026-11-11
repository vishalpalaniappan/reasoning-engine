import crypto from "crypto";

/**
 * Recursively traverses an object or array and assigns a unique ID 
 * to any plain object that lacks one.
 */
export const assignIdsToNodes = (data) => {
    if (data === null || typeof data !== "object") {
        return data;
    }

    // Handle Arrays
    if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
            assignIdsToNodes(data[i]);
        }
        return data;
    }

    // Handle Plain Objects (Nodes)
    if (!data.id) {
        data.id = crypto.randomUUID();
    }

    // Recurse into all nested properties of this object
    for (const key of Object.keys(data)) {
        assignIdsToNodes(data[key]);
    }

    return data;
}