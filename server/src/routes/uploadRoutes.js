const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

// Upload endpoint
router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const imagePath = `/uploads/returns/${req.file.filename}`;
        res.json({ imagePath });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during upload' });
    }
});

module.exports = router;
