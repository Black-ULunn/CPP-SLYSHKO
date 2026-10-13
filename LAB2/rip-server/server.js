import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './services/db.js';
import applicationRoutes from './routes/applicationRoutes.js';

// Зчитуємо змінні середовища з .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Дозвіл міждоменних запитів та розбір JSON у тілі запиту
app.use(cors());
app.use(express.json());

// Логування кожного вхідного запиту
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Тестовий маршрут
app.get('/', (req, res) => {
  res.send('RIP API працює');
});

// Маршрути заявок
app.use('/api/applications', applicationRoutes);

// Підключення до MongoDB та запуск сервера
connectDB(process.env.MONGO_URI);

app.listen(PORT, () => {
  console.log(`Сервер запущено на порті ${PORT}`);
});
