import express, { type Express, type Request, type Response } from "express";
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const app: Express = express();
const port = process.env.PORT;

const pool = new Pool({
  connectionString: `${process.env.CONNECTION_STR}`,
});

const initDB = async () => {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        age INT,
        phone VARCHAR(15),
        address TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )       
        `);
  await pool.query(`
            CREATE TABLE  IF NOT EXISTS todos(
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            completed BOOLEAN DEFAULT false,
            due_date DATE,
            created_at TIMESTAMP DEFAULT NULL,
            updated_at TIMESTAMP DEFAULT NULL
  ) 
            `);
};

initDB();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World from Hasan");
});

app.post("/users", async (req: Request, res: Response) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO users(name , email) VALUES($1 , $2) RETURNING * `,
      [name, email],
    );
    console.log(result);
    res.status(200).json({
        success: true,
        message: "Succuessfully saved to db"
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
