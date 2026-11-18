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
    const NARRATIVE_PATH = path.join(__dirname, "test_narratives", "coffee_shop_test.json");
    const narrative = assignIdsToNodes(JSON.parse(fs.readFileSync(NARRATIVE_PATH, "utf8")));

    const startNode =  await jsonata(`**[name = 'introduce']`).evaluate(narrative);
    const endNode =  await jsonata(`**[name = 'terminal_display' and args[0].value = 'Goodbye']`).evaluate(narrative);

    console.log(startNode, endNode);

    const finder = new NarrativeFinder(narrative, startNode.id, endNode.id);
        
    console.log("");
    console.log("Walking");
    await finder.run();

    
    await mkdir('./test/output', { recursive: true });

    await fsPromises.writeFile(
        "./test/output/branch_test.json",
        JSON.stringify(finder.foundNarratives.generateReport(), null, 4)
    );
}


await run();