

const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const User = require('./User');

const Message = sequelize.define('Message', {
  text: DataTypes.TEXT
});

// Beziehungen (Sender & Empfänger)
User.hasMany(Message, { as: 'SentMessages', foreignKey: 'senderId' });
User.hasMany(Message, { as: 'ReceivedMessages', foreignKey: 'receiverId' });

Message.belongsTo(User, { as: 'Sender', foreignKey: 'senderId' }); // ← HIER korrigiert
Message.belongsTo(User, { as: 'Receiver', foreignKey: 'receiverId' });

module.exports = Message;
