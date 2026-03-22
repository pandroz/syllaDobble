const express = require('express');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// ROUTES
const logobbleRoutes = require('./routes/logobble.js');
const managementRoutes = require('./routes/management.js');
const dataRetrieverRoutes = require('./routes/dataRetriever.js');

app.use('/', logobbleRoutes);
app.use('/management', managementRoutes);
app.use('/data', dataRetrieverRoutes);


app.listen(3000, () => {
    console.log("Server running on port 3000");
});