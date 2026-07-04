import express from 'express';
import cors from 'cors';
import path from 'path';
import mahasiswaRoutes from './routes/mahasiswa.route';
import prodiRoutes from './routes/prodi.route';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  })
);

app.use(express.json());

// Menyajikan folder uploads secara statis agar foto mahasiswa dapat diakses dari browser
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'Backend Express berjalan' });
});

app.use('/api/mahasiswa', mahasiswaRoutes);
app.use('/api/prodi', prodiRoutes);

export default app;
