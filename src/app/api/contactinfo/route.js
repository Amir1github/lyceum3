import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src', 'data', 'contact.json');

export async function GET(req) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const contactInfo = JSON.parse(data);
    return new Response(JSON.stringify(contactInfo), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Ошибка при чтении файла:', error);
    return new Response(JSON.stringify({ error: 'Не удалось загрузить данные.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    

    // Сохранение данных
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), 'utf-8');

    return new Response(JSON.stringify({ message: 'Данные успешно обновлены.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Ошибка при сохранении файла:', error);
    return new Response(JSON.stringify({ error: 'Не удалось сохранить данные.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
