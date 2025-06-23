import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = 'uploads/'

// if use storage as cloud service
// const storage = multer.memoryStorage();


fs.mkdir(uploadDir, { recursive: true }, (err) => {
  if (err && err.code !== 'EEXIST') throw err;
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function(req,file,cb ){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() *1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix+extension);
    }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});
export default upload;

