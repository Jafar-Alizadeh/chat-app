const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const upload = require("../middlewares/upload");

// Registrierung (POST) mit Bild-Upload
// auth.js
router.post("/register", upload.single("avatar"), async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Benutzer existiert bereits" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let avatarPath = null;
    if (req.file) {
      // Ersetze alle Rückwärtsschrägstriche durch Vorwärtsschrägstriche
      avatarPath = req.file.path.replace(/\\/g, "/");
    }

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      avatar: avatarPath,
    });

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
      },
    });
  } catch (err) {
    console.error("Registrierungsfehler:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

// Login (POST) bleibt wie gehabt
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Benutzer nicht gefunden" });
    }

    // Passwortvergleich
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Falsches Passwort" });
    }

    // Token erstellen
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login-Fehler:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Kein Token vorhanden" });
  }

  const token = authHeader.split(" ")[1]; // "Bearer <token>"
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Ungültiges oder abgelaufenes Token" });
  }
}

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ["id", "username", "email", "avatar"],
    });
    if (!user) {
      return res.status(404).json({ message: "Benutzer nicht gefunden" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Serverfehler" });
  }
});

module.exports = router;
