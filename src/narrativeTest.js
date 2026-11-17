import { NarrativeFinder } from './NarrativeFinder.js';
import { assignIdsToNodes } from "./assignIdsToNodes.js";
import jsonata from 'jsonata';
import path from "path";
import fs from "node:fs";
import fsPromises from "node:fs/promises";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
    const NARRATIVE_PATH = path.join(__dirname, "..", "narratives", "invoke_test.json");
    const narrative = assignIdsToNodes(JSON.parse(fs.readFileSync(NARRATIVE_PATH, "utf8")));

    const startNode =  await jsonata(`**[name = 'introduce']`).evaluate(narrative);
    const endNode =  await jsonata(`**[name = 'insert_at_end_of_list']`).evaluate(narrative);

    console.log(startNode, endNode);

    const finder = new NarrativeFinder(narrative, startNode.id, endNode.id);
        
    console.log("");
    console.log("Walking");
    await finder.run();

    await fsPromises.writeFile(
        "./temp/invoke_test.json",
        JSON.stringify(finder.foundNarratives, null, 4)
    );
}


await run();