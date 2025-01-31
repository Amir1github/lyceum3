import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const messagesFilePath = path.join(process.cwd(), 'public', 'data', 'messages.json');

export async function POST(req) {
  try {
    const { name, email, message , admin} = await req.json();

    // Чтение текущих сообщений
    const fileData = fs.readFileSync(messagesFilePath, 'utf-8');
    const messages = JSON.parse(fileData);

    // Добавление нового сообщения
    const newMessage = { name, email, message, timestamp: new Date().toISOString() , admin};
    messages.push(newMessage);

    // Запись в файл
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2), 'utf-8');

    // Ответ клиенту
    return NextResponse.json({ message: 'Сообщение отправлено успешно' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка при записи сообщения' }, { status: 500 });
  }
}
