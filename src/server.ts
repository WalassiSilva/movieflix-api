import { PrismaClient } from "@prisma/client";

import express from "express";  // const express = require("express");
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (_, res) => {
    res.send("Home page");
});
//---------------GET MOVIES----------------
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

    // Calcular total de filmes 
    const totalMovies = movies.length;

    // Calcular media da duração 
    let totalDuration = 0;
    for (const movie of movies) {
        totalDuration += movie.duration;
    }

    const averageDuration = totalDuration > 0 ? totalDuration / totalMovies : 0;
    res.json({
        totalMovies,
        averageDuration,
        movies
    });
});
//---------------POST MOVIES---------------
app.post("/movies", async (req, res) => {
    const { title, release_date, genre_id, language_id, oscar_count, duration, director } = req.body;

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
                duration,
                director
            }
        });
    } catch (error) {
        return res.status(500).send({ message: "Falha ao cadastrar um filme" });
    }

    res.status(201).send();
});
//---------------UPDATE MOVIES----------------
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
//---------------DELETE MOVIES-----------------
app.delete("/movies/:id", async (req, res) => {
    //pegar o param id como number
    const id = Number(req.params.id);

    try {
        // Tratar erro pra id inválido
        const movie = await prisma.movie.findUnique({ where: { id } });

        if (!movie) {
            return res.status(404).send({ message: "Id do registro não encontrado" });
        }

        // fazer o delete
        await prisma.movie.delete({ where: { id } });
    } catch (error) {
        res.status(500).send({ message: "Erro ao tentar Remover o filme" });
    }

    // Mostrar status correto informando sucesso
    res.status(200).send();
});
//---------------FILTER MOVIES-----------------
app.get("/movies/:filter", async (req, res) => {
    const filter = req.params.filter;
    try {
        let filteredMovies = await prisma.movie.findMany({
            include: {
                genres: true,
                languages: true,
            },
            where: {
                genres: {
                    name: {
                        equals: filter,
                        mode: "insensitive",
                    },
                },
            },
        });

        if (filteredMovies.length < 1) {
            filteredMovies = await prisma.movie.findMany({
                include: {
                    genres: true,
                    languages: true,
                },
                where: {
                    languages: {
                        name: {
                            equals: filter,
                            mode: "insensitive",
                        },
                    },
                },
            });
        }
        // else  {
        //     return res.status(404).send({ message: "Filtro não encontrado" });
        // }

        return res.status(200).send(filteredMovies);
    } catch (error) {
        return res.status(500).send({ message: "Falha ao fazer o filtro" });
    }

});

//-----------------------------------------
/*
app.get("/movies/:languageName", async (req, res) => {
    const languageName = req.params.languageName;
    console.log("language", languageName);

    try {
        const languageFilteredMovies = await prisma.movie.findMany({
            include: {
                genres: true, languages: true
            },
            where: {
                languages: {
                    name: {
                        equals: languageName,
                        mode: "insensitive"
                    }
                }
            }
        });
        console.log(languageFilteredMovies);
        if (languageFilteredMovies.length < 1) {
            return res.status(404).send({ message: "Idioma não encontrado" });
        }

        return res.status(200).send(languageFilteredMovies);
    } catch (error) {
        return res.status(500).send({ message: "Erro ao filtrar filmes por idioma" });
    }
});*/


//-----------------GET GENRES------------------------

app.get("/genres", async (_, res) => {
    try {
        const genres = await prisma.genre.findMany({
            orderBy: { name: "asc" }
        });

        res.json(genres);
    }
    catch (error) {
        res.status(500).send({ message: "Houve um erro al buscar os gêneros" });
    }

});

//-----------------POST GENRES------------------------
app.post("/genres", async (req, res) => {
    const { name } = req.body;
    console.log(name);
    try {
        const duplicate = await prisma.genre.findFirst({
            where: { name: { equals: name, mode: "insensitive" } },
        });

        if (!name) {
            return res.status(400).send({ message: "nome do gênero é obrigatorio" });
        }
        if (duplicate) {
            return res.status(409).send({ message: "Já existe um gênero com esse titulo" });
        }
        if (name === "") {
            return res.status(409).send({ message: "Nome do gênero inválido" });
        }

        const newGenre = await prisma.genre.create({
            data: { name }
        });
        res.status(201).json(newGenre);
    } catch (error) {
        return res.status(500).send({ message: "Falha ao cadastrar um gênero" });
    }

});

//------------------UPDATE GENRES-----------------------
app.put("/genres/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { name } = req.body;

    console.log("id", id);

    if (!name) {
        return res.status(400).send({ message: "O nome do gênero é obrigatorio" });
    }

    try {
        const genre = await prisma.movie.findUnique({ where: { id } });

        if (!genre) {
            return res.status(404).send({ message: "Impossível alterar. Id do Gênero não encontrado" });
        }

        const existingGenre = await prisma.genre.findFirst({
            where: {
                name: { equals: name, mode: "insensitive" },
                id: { not: id }
            }
        });

        if (existingGenre) {
            return res.status(409).send({ message: "Este gênero ja existe" });
        }

        const data = { ...req.body };

        const updatedGenre = await prisma.genre.update({
            where: { id },
            data: data
        });

        res.status(200).json(updatedGenre);

    } catch (error) {
        res.status(500).send({ message: "Eerro ao atualizar o gênero" });
    }

});

//------------------DELETE GENRES-----------------------
app.delete("/genres/delete/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const genre = await prisma.genre.findUnique({
            where: { id: Number(id) },
        });

        if (!genre) {
            return res.status(404).send({ message: "Gênero não encontrado." });
        }

        await prisma.genre.delete({
            where: { id: Number(id) },
        });

        res.status(200).send({ message: "Gênero removido com sucesso." });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Houve um problema ao remover o gênero." });
    }
});


//------------------LISTEN-----------------------
app.listen(port, () => {
    console.log(`Running in http://localhost:${port}`);
});