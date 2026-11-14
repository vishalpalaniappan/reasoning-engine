/**
 * Fetch the schema from the public URL. 
 * Fetch doesn't throw on all errors, need to check response.ok manually and throw.
 * @returns {Object|null}
 */
export async function fetchSchema() {
    const response = await fetch('https://vishalpalaniappan.github.io/artha-primitives/img/artha.schema.json');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}