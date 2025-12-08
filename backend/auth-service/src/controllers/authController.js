// src/controllers/authController.js
import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const saltRounds = 10;

export const signup = async (req, res) => {
  const { fullName, email, password, role, age, gender, birthday, mobile, mbbsReg } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await pool.query(
      `INSERT INTO users 
      (full_name, email, password_hash, role, age, gender, birthday, mobile, mbbs_reg) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [fullName, email, hashedPassword, role, age || null, gender || null, birthday || null, mobile || null, mbbsReg || null]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// export const login = async (req, res) => {
//   const { email, password } = req.body;

//   if (!password) {
//     return res.status(400).json({ message: "Password is required" });
//   }

//   try {
//     const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
//     if (users.length === 0) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const user = users[0];
//     const match = await bcrypt.compare(password, user.password_hash); // <-- use password_hash
//     if (!match) return res.status(401).json({ message: "Invalid credentials" });

//     const token = jwt.sign(
//       { id: user.user_id, role: user.role, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.json({
//       message: "Login successful",
//       token,
//       user: { id: user.user_id, fullName: user.full_name, email: user.email, role: user.role }
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Database error" });
//   }
// };

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.user_id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return full profile info (except password)
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.user_id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        age: user.age,
        gender: user.gender,
        birthday: user.birthday,
        mobile: user.mobile,
        mbbsReg: user.mbbs_reg || null // only for doctors
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

