import fs from 'fs';
import path from 'path';

const vacanciesFilePath = path.join(process.cwd(), 'public', 'data', 'vacancies.json');

// Генерация уникального id
const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

// Обработка GET запроса для получения списка вакансий
export async function GET(req) {
  try {
    const fileData = fs.readFileSync(vacanciesFilePath, 'utf-8');
    const vacancies = JSON.parse(fileData);
    return new Response(JSON.stringify(vacancies), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Ошибка при получении списка вакансий' }),
      { status: 500 }
    );
  }
}

// Обработка POST запроса для добавления новой вакансии
export async function POST(req) {
  try {
    const newVacancy = await req.json();

    // Проверяем наличие всех необходимых полей
    const { position, salary, hoursPerWeek, description, requirements } = newVacancy;
    if (!position || !salary || !hoursPerWeek || !description || !requirements) {
      return new Response(
        JSON.stringify({ error: 'Все поля должны быть заполнены' }),
        { status: 400 }
      );
    }

    // Чтение текущих вакансий
    const fileData = fs.readFileSync(vacanciesFilePath, 'utf-8');
    const vacancies = JSON.parse(fileData);

    // Генерация id для новой вакансии
    const newVacancyWithId = { ...newVacancy, id: generateId() };

    // Добавляем новую вакансию
    vacancies.push(newVacancyWithId);

    // Записываем обновлённые вакансии обратно в файл
    fs.writeFileSync(
      vacanciesFilePath,
      JSON.stringify(vacancies, null, 2),
      'utf-8'
    );

    return new Response(JSON.stringify(newVacancyWithId), { status: 201 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Ошибка при добавлении вакансии' }),
      { status: 500 }
    );
  }
}

// Обработка DELETE запроса для удаления вакансии
// Обработка DELETE запроса для удаления вакансии
export async function DELETE(req) {
    const url = new URL(req.url); // Создаем объект URL из запроса
    const id = url.searchParams.get('id'); // Получаем id из query строки
  
    // Проверяем, если id не передан
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID вакансии не указан' }),
        { status: 400 }
      );
    }
  
    try {
      // Чтение текущих вакансий из файла
      const fileData = fs.readFileSync(vacanciesFilePath, 'utf-8');
      let vacancies = JSON.parse(fileData);
  
      // Приводим ID вакансий и ID из запроса к строковому типу перед фильтрацией
      vacancies = vacancies.filter((vacancy) => String(vacancy.id) !== id);
  
      // Проверяем, если вакансия не найдена
      if (vacancies.length === JSON.parse(fileData).length) {
        return new Response(
          JSON.stringify({ error: 'Вакансия с таким id не найдена' }),
          { status: 404 }
        );
      }
  
      // Записываем обновлённый список вакансий обратно в файл
      fs.writeFileSync(
        vacanciesFilePath,
        JSON.stringify(vacancies, null, 2),
        'utf-8'
      );
  
      return new Response(null, { status: 204 }); // Возвращаем успешный статус
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Ошибка при удалении вакансии' }),
        { status: 500 }
      );
    }
  }