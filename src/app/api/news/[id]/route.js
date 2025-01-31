import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'public', 'data', 'news.json');

export async function GET(req, { params }) {
  try {
    const { id } = params; // Получаем id из параметров маршрута
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const news = JSON.parse(fileData);

    const newsItem = news.find((item) => item.id === parseInt(id, 10));

    if (!newsItem) {
      return NextResponse.json({ error: 'Новость не найдена' }, { status: 404 });
    }

    return NextResponse.json(newsItem);
  } catch (error) {
    console.error('Error reading the file:', error);
    return NextResponse.json({ error: 'Failed to fetch news item' }, { status: 500 });
  }
}
