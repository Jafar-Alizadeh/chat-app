// server/middlewares/upload.js
const multer = require('multer');
const path = require('path');

// Speicher-Strategie definieren
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Ordner, in den Bilder hochgeladen werden
  },
  filename: (req, file, cb) => {
    // Dateiname z. B. "avatar-1678955551234.png"
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

// Filter, um nur Bilder zuzulassen (optional)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Nur Bilddateien sind erlaubt!'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
