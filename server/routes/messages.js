const express = require('express');
const { Op } = require('sequelize');
const Message = require('../models/Message');
const router = express.Router();

// Neue Nachricht speichern
router.post('/', async (req, res) => {
  const { senderId, receiverId, text } = req.body;
  try {
    const msg = await Message.create({ senderId, receiverId, text });
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Alle Nachrichten zwischen zwei Usern
router.get('/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const msgs = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: user1, receiverId: user2 },
          { senderId: user2, receiverId: user1 }
        ]
      },
      order: [['createdAt', 'ASC']]
    });
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
