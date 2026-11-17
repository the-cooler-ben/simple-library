import "dotenv/config";
import bcrypt from "bcrypt";
import express from "express";
import cors from "cors";
import validateBook from "./books.js";
import { Book, User, sequelize } from "./db.js";
import { readFile } from "node:fs/promises";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import {requireAuth} from "./auth.js";

const app = express();
await sequelize.sync();
if (await Book.count() === 0) {
    const text = await readFile("./books.json", "utf8");

    const books = JSON.parse(text).map(book => ({
        ...book,
        authors: JSON.stringify(book.authors),
    }));
    await Book.bulkCreate(books);
}

// const book = await Book.create({
//     title: req.body.title.trim(),
//     artists: req.body.authors,
//     year: req.body.year ?? null,
//     userId: req.user.id,
// });

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/books", async (req, res) => {
    const books = await Book.findAll();

    const result = books.map(book => ({
        ...book.toJSON(),
        authors: JSON.parse(book.authors)
    }));

    res.json(result);
});

app.get("/api/me", requireAuth, (req, res) => {
    res.json({ id: req.user.id, username: req.user.username });
});

app.post("/api/books", requireAuth, async (req, res) => {
    try {
        const error = validateBook(req.body);
        if (error) {
            res.status(400).json({error});
            return;
        }

        // const book = await Book.create({
        //     ...req.body,
        //     authors: JSON.stringify(req.body.authors),
        // });

        const book = await Book.create({
            title: req.body.title.trim(),
            artists: req.body.authors,
            year: req.body.year ?? null,
            userId: req.user.id,
        });

        res.status(201).json({
            ...book.toJSON(),
            authors: JSON.parse(book.authors)
        });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.post("/api/register", async (req, res) => {
    console.log("REGISTER HIT")
    console.log(req.body)

    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({error: "Username and password are required"});
        }

        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({error: "Password must be at least 8 characters long"});
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            passwordHash: passwordHash,
        })
        res.status(201).json({id: newUser.id, username: newUser.username});
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({error: "User already exists"});
        }
        console.error("Register error: ", error);
        return res.status(500).json({error: "Internal Server Error"});
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const {username, password} = req.body;
        if (!username || !password) {
            return res.status(400).json({error: "Username and password are required"});
        }

        const user = await User.findOne(
            { where: { username: username } }
        );
        if (!user) {
            return res.status(401).json({error: "Username and password are required"});
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({error: "Username and password are required"});
        }

        const token = jwt.sign({
            userId: user.id,
            username: user.username,
        },
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
            )
        res.cookie("token", token, { httpOnly: true, maxAge: 3600000, sameSite: "lax" });

        return res.status(200).json({id: user.id, username: user.username});
    } catch (error) {
        console.error("Login error: ", error)
        return res.status(500).json({error: "Internal server error"});
    }
});

app.post ("/api/logout", async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
    });
    res.status(200).json({message: "Logout successful"});
});

app.put("/api/books/:id", requireAuth, async (req, res) => {
    const book = await Book.findByPk(req.params.id);

    if (!book) {
        return res.status(404).json({error: "Book not found"})
    }

    await book.update({
        checked_out: req.body.checked_out,
    });

    res.json(book);
});

app.delete("/api/books/:id", requireAuth, async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }
    if (book.userId !== req.user.id) {
        return res.status(403).json({ error: "You can only delete your own books" });
    }
    await book.destroy();
    res.json(book);
});

app.listen(3000, (err) => {
    if (err) {
        console.log("Could not start:", err.message);
        return;
    }
    console.log("Library API running at http://localhost:3000/api/books");
});