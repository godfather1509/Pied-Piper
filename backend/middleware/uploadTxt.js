const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {

    if (path.extname(file.originalname) !== ".txt") {
        return cb(new Error("Onlt .txt files allowed"), false)
    }

    cb(null, true)
}

const uploadTXT = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }
})

module.exports = uploadTXT