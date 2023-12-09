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

        if (duplicate) {
            return res.status(409).send({ message: "Registro ja existente com esse título!" });
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

// app.put("/movies/:id", async (req, res) => {
//     // Pegar o id e mudar pra number
//     const id = Number(req.params.id);

//     // Pegar a info e atualizar
//     const data = { ...req.body};

//     // tratar erro para data inválida
//     data.release_date = data.release_date ? new Date(data.release_date) : undefined;

//     await prisma.movie.update({
//         where: { id },
//         data: 
//         {
//             title: data.title,
//             genre_id: data.genre_id,
//             language_id: data.language_id,
//             oscar_count: data.oscar_count,
//             release_date: new Date(data.release_date),
//         }
//     });

//     // Retornar o status correto informando a atualização
//     res.status(200).send();

// });
app.put("/movies/:id", async (req, res) => {
    // Pegar o id como number
    const id = Number(req.params.id);

    // cobrir todo processo com try/catch
    try {
        // Tratar erro pra id inválido
        const movie = await prisma.movie.findUnique({
            where: { id }
        });

        if (!movie) {
            return res.status(404).send({ message: "id do filme não encontrado!" });
        }
        // Pegar as infos do body
        const data = { ...req.body };

        // Tratar erro para data inválida
        data.release_date = data.release_date ? new Date(data.release_date) : undefined;

        await prisma.movie.update({
            where: { id },
            data: data
        });
    }
    catch (error) {
        res.status(500).send({ message: "Erro ao atualizar registro" });
    }

    // Rotornar o status correto informado a atualização
    res.status(200).send();
});


app.listen(port, () => {
    console.log(`Running in http://localhost:${port}`);
});