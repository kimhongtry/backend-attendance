import { Router, Request, Response } from "express";
import { pool } from "../config/db";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const query = "SELECT * FROM users WHERE email = $1 AND password = $2";
    const values = [email, password];
    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      return res.json({
        token: "fake-jwt-token", // later replace with real JWT
        user: { email: user.email },
      });
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
