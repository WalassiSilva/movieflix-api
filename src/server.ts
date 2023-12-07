import { PrismaClient } from "@prisma/client";

import express from "express";  // const express = require("express");

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.get("/", (_, res) => {
    res.send("Home page");
});

app.get("/movies", async (_, res) => {
    // const movies = await prisma.movie.findMany();
    // const movies = await prisma.movies.findMany({where: {id: 2}});
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: "asc"
        },
        include: {
            genres: true,
            languages: true
        }
    });
    res.json(movies);
});

app.listen(port, () => {
    console.log(`Running in http://localhost:${port}`);
});