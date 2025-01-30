import fs from 'fs';
import path from 'path';

const messagesFilePath = path.join(process.cwd(), 'src', 'data', 'messages.json');

// Обработка GET запроса для получения сообщений
export async function GET(req) {
  try {
    const fileData = fs.readFileSync(messagesFilePath, 'utf-8');
    const messages = JSON.parse(fileData);
    return new Response(JSON.stringify(messages), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Ошибка при получении сообщений' }), { status: 500 });
  }
}

// Обработка DELETE запроса для удаления сообщения
export async function DELETE(req) {
  try {
    const { name, email, message } = await req.json();  // Получаем данные из тела запроса

    // Чтение текущих сообщений
    const fileData = fs.readFileSync(messagesFilePath, 'utf-8');
    const messages = JSON.parse(fileData);

    // Удаляем сообщение по имени, email и содержимому
    const updatedMessages = messages.filter(
      (msg) => !(msg.name === name && msg.email === email && msg.message === message)
    );

    // Если сообщение не найдено
    if (updatedMessages.length === messages.length) {
      return new Response(JSON.stringify({ error: 'Сообщение не найдено' }), { status: 404 });
    }

    // Записываем обновленные сообщения обратно в файл
    fs.writeFileSync(messagesFilePath, JSON.stringify(updatedMessages, null, 2), 'utf-8');

    return new Response(JSON.stringify({ message: 'Сообщение удалено успешно' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Ошибка при удалении сообщения' }), { status: 500 });
  }
}
export async function PUT(req) {
  try {
    const { clearAll } = await req.json(); // Получаем данные из тела запроса

    // Проверяем, требуется ли очистить все сообщения
    if (clearAll) {
      // Очищаем файл, записывая пустой массив
      fs.writeFileSync(messagesFilePath, JSON.stringify([], null, 2), 'utf-8');
      return new Response(JSON.stringify({ message: 'Все сообщения успешно удалены' }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: 'Некорректный запрос' }), { status: 400 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Ошибка при обработке запроса' }), { status: 500 });
  }
}