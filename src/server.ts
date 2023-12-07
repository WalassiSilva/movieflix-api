import { PrismaClient } from "@prisma/client";

import express from "express";  // const express = require("express");

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

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

app.post("/movies", async (req, res) => {
    const { title, release_date, genre_id, language_id, oscar_count } = req.body;

    try {
        const duplicate = await prisma.movie.findFirst({
            where: { title: { equals: title, mode: "insensitive" } },
        });

        if(duplicate) {
            return res.status(409).send({message: "Esse Registro ja existe!"});
        }

        await prisma.movie.create({
            data: {
                title,
                release_date: new Date(release_date),
                genre_id,
                language_id,
                oscar_count,
            }
        });
    } catch (error) {
        return res.status(500).send({ message: "Falha ao cadastrar um filme" });
    }

    res.status(201).send();
});

app.listen(port, () => {
    console.log(`Running in http://localhost:${port}`);
});