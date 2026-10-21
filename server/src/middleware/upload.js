const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const returnsDir = 'uploads/returns';
const productsDir = 'uploads/products';

[returnsDir, productsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'images') {
            cb(null, productsDir);
        } else {
            cb(null, returnsDir);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed!'), false);
    }
    // const allowedTypes = /jpeg|jpg|png|gif|webp/;
    // const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    // const mimetype = allowedTypes.test(file.mimetype);

    // if (mimetype && extname) {
    //     return cb(null, true);
    // } else {
    //     cb(new Error('Only images are allowed!'));
    // }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;
