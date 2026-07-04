import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Pastikan direktori tujuan upload ada
const uploadDir = path.join(__dirname, '../../uploads/mahasiswa');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi storage multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Format nama file: foto-timestamp.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `foto-${uniqueSuffix}${ext}`);
  }
});

// Filter tipe file
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Hanya diperbolehkan mengupload file gambar (JPEG/JPG/PNG/GIF)!'));
  }
};

// Middleware upload
export const uploadFotoMahasiswa = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // Batasan ukuran file: 2MB
  },
  fileFilter: fileFilter
});
