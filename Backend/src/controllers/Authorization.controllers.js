import { query } from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      phone,
      role,
    //   ward_id,
    //   municipality_id,
    //   district_id,
      is_verified
    } = req.body;

    // if (
    //   !full_name || !email || !password || !phone ||
    //   !ward_id || !municipality_id || !district_id
    // ) {
    //   return res.status(400).json({ message: "All fields are required." });
    // }

    const userCheck = await query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPw = await bcrypt.hash(password, 10);

    const userRole = role || "user"; // default role

    const newUser = await query(
      `
        INSERT INTO users(
          full_name, email, password, phone, role, is_verified
        )
        VALUES($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [
        full_name,
        email,
        hashedPw,
        phone,
        userRole,
        // ward_id,
        // municipality_id,
        // district_id,
        is_verified,
      ]
    );

    const createdUser = newUser.rows[0];

    const token = jwt.sign(
      { id: createdUser.id, role: createdUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: createdUser,
    });

  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
