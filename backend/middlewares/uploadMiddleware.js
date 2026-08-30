import multer from 'multer';
import path from 'path';

// We use memory storage because we are just passing the image data to the APIs,
// not saving the original uploads to disk.
const storage = multer.memoryStorage();

// A function to check that the uploaded files are images
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only! (jpg, jpeg, png)'), false);
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

export default upload;