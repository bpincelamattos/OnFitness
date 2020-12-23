const pgp = require("pg-promise")();
const db = pgp(`postgres://postgres:${process.env.PGP_PASSWORD}@localhost:5432/on_fitnessdb`);


exports.db = db;