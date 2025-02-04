import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: 'dzbuo2vqt',
  api_key: '612574697429781', // Замените на ваш реальный ключ API
  api_secret: 'Aj_5ed6q99dvzlpjeLI-nsDBsh0',
});


const filePath = path.join(process.cwd(), 'public', 'data', 'news.json');

export async function GET() {
  try {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const news = JSON.parse(fileData);
    return NextResponse.json(news);
  } catch (error) {
    console.error('Error reading the file:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const news = JSON.parse(fileData);

    const newNews = {
      id: Date.now(),
      ...body,
    };

    news.push(newNews);

    fs.writeFileSync(filePath, JSON.stringify(news, null, 2));
    return NextResponse.json({ news: newNews }, { status: 201 });
  } catch (error) {
    console.error('Error writing to the file:', error);
    return NextResponse.json({ error: 'Failed to save news' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get('id'), 10);

    if (!id) {
      return NextResponse.json({ error: 'Missing or invalid ID' }, { status: 400 });
    }

    const fileData = fs.readFileSync(filePath, 'utf-8');
    const news = JSON.parse(fileData);

    // Найти новость и извлечь ссылки изображений
    const newsItem = news.find((item) => item.id === id);
    if (!newsItem) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    const imageUrls = newsItem.images;

    // Извлечь public_id из каждого URL Cloudinary
    const publicIds = imageUrls.map((url) => {
      const parts = url.split('/');
      return parts[parts.length - 1].split('.')[0]; // Получаем public_id без расширения
    });

    // Удалить изображения из Cloudinary
    await cloudinary.v2.api.delete_resources(publicIds, {
      type: 'upload',
      resource_type: 'image',
    });

    // Обновить файл, удалив новость
    const updatedNews = news.filter((item) => item.id !== id);

    fs.writeFileSync(filePath, JSON.stringify(updatedNews, null, 2));
    return NextResponse.json({ message: 'News and associated images deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting the news:', error);
    return NextResponse.json({ error: 'Failed to delete news and images' }, { status: 500 });
  }
}



