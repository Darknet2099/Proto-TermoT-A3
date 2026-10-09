const express = require("express");
const path = require("path");

const publicFilesPath = path.resolve("App");

const app = express();

app.use(express.static(publicFilesPath));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (request, response, next) => {
    //middleware later
    next();
});

app.listen(3000, () => console.log("Service Online"));
