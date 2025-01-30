import Cors from 'cors';

const cors = Cors({
  methods: ['GET', 'POST', 'OPTIONS'],  // Разрешаем только нужные методы
  allowedHeaders: ['Content-Type', 'Authorization'],  // Разрешаем только нужные заголовки
  credentials: true,  // Разрешаем использование куки
  origin: (origin, callback) => {
    // Проверяем, что Origin соответствует вашему домену
    if (origin && origin === process.env.NEXT_PUBLIC_API_URL) {
      callback(null, true);  // Доверяем этому источнику
    } else {
      callback(new Error('Not allowed by CORS'), false);  // Отклоняем все остальные
    }
  },
});

export default function runCors(req, res, next) {
  return new Promise((resolve, reject) => {
    cors(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      resolve(result);
    });
  });
}
