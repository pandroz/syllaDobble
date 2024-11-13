import express from "express";

import path from 'path';
import _ from 'lodash';
import { fileURLToPath } from 'url';

// import { openModal } from "./src/syllaDobbleScripts.js";
// import { getGroupingsNames, getGroupings, getGroups, addNewGrouping, saveGrouping } from "./src/managementScripts.js";
import * as mgmt from "./src/managementScripts.js";



const app = express();
app.set('view engine', 'ejs');

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
console.log(__dirname);

app.use(express.static(path.join(__dirname, "./public")));
app.use(express.json());

app.listen(3000, '0.0.0.0', () => {
    console.log("server running on port 3000");
})


// PAGES

app.get("/", (req, res) => {
    res.render('./syllaDobble.ejs', { _: _ });
})

app.get("/manage", (req, res) => {
    res.render('./manageCards.ejs', { getGroupingsNames: mgmt.getGroupingsNames, _: _ })
})


// GET

app.get("/get-groupings", (req, res) => {
    const groupings = mgmt.getGroupings();
    res.json(groupings);
});


// POSTS

app.post("/get-groups", async (req, res) => {
    const groups = await mgmt.getGroups(req.body.groupingId);
    res.json(groups);
})

app.post('/add-new-grouping', async (req, res) => {
    const newGroupingName = req.body.groupName;
    const result = await mgmt.addNewGrouping(newGroupingName);

    if (result.success) {
        res.json({ success: true, message: 'Item added successfully', newId: result.newId });
    } else {
        res.status(500).json({ success: false, error: 'Failed to add item' });
    }
});

app.post('/save-grouping', async (req, res) => {
    const body = req.body;
    const success = await mgmt.saveGrouping(body);

    if (success) {
        res.json({ success: true, message: 'Item saved successfully' });
    } else {
        res.status(500).json({ success: false, error: 'Failed to add item' });
    }
});

app.delete('/delete-grouping', async (req, res) => {
    const groupingId = req.body.groupingId;
    const success = await mgmt.deleteGrouping(groupingId);

    if (success) {
        res.json({ success: true, message: 'Item deleted successfully' });
    } else {
        res.status(500).json({ success: false, error: 'Failed to delete item' });
    }
})