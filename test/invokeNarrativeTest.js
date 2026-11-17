import { NarrativeFinder } from '../src/narrative_processor/NarrativeFinder.js';
import { assignIdsToNodes } from "../src/assignIdsToNodes.js";
import jsonata from 'jsonata';
import path from "path";
import fs from "node:fs";
import fsPromises, {mkdir} from "node:fs/promises";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
    // TODO: Switch to using vitest
    const NARRATIVE_PATH = path.join(__dirname, "..", "narratives", "invoke_test.json");
    const narrative = assignIdsToNodes(JSON.parse(fs.readFileSync(NARRATIVE_PATH, "utf8")));

    const startNode =  await jsonata(`**[name = 'introduce']`).evaluate(narrative);
    const endNode =  await jsonata(`**[name = 'insert_at_end_of_list']`).evaluate(narrative);

    console.log(startNode, endNode);

    const finder = new NarrativeFinder(narrative, startNode.id, endNode.id);
        
    console.log("");
    console.log("Walking");
    await finder.run();

    
    await mkdir('./test/output', { recursive: true });

    await fsPromises.writeFile(
        "./test/output/invoke_test.json",
        JSON.stringify(finder.foundNarratives, null, 4)
    );
}


await run();