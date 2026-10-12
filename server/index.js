const express = require("express");
const path = require('node:path');
const fs = require('node:fs/promises');


const publicFilesPath = path.resolve("App");

const app = express();

app.use(express.static(publicFilesPath));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (request, response, next) => {
    //middleware later
    next();
});

app.get('/api/GetData', async (request, response) => {
    try {
        const filePath = path.resolve("server/data/data.json");

        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContent);

        response.json(data);
    } catch(error) {
        console.log(error)

        response.status(500).json({
            errorMessage: "The server had an issue"
        })
    }
})

app.listen(3000, () => console.log("Service Online"));
