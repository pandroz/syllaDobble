import express from "express";

import path from 'path';
import _ from 'lodash';
import { fileURLToPath } from 'url';

// import { openModal } from "./src/syllaDobbleScripts.js";
import { getGroupings, addNewGrouping } from "./src/managementScripts.js";


const app = express();
app.set('view engine', 'ejs');

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
console.log(__dirname);

app.use(express.static(path.join(__dirname, "./public")));
app.use(express.json());

app.get("/", (req, res) => {
    res.render('./syllaDobble.ejs', { _: _ });
})

app.get("/manage", (req, res) => {
    res.render('./manageCards.ejs', { getGroupings: getGroupings, _: _ })
})

app.listen(3000, '0.0.0.0', () => {
    console.log("server running on port 3000");
})


app.get("/get-groups", (req, res) => {
    const groups = getGroupings();  // Your existing function
    console.log('groups ==> ', groups)
    res.json(groups);
});

app.post('/add-new-grouping', async (req, res) => {
    const newGroupingName = req.body.groupName;
    const result = await addNewGrouping(newGroupingName);

    if (result.success) {
        res.json({ success: true, message: 'Item added successfully', newId: result.newId });
    } else {
        res.status(500).json({ success: false, error: 'Failed to add item' });
    }
});