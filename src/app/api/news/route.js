import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
    const id = parseInt(searchParams.get('id'), 10); // Получаем ID из параметров запроса

    if (!id) {
      return NextResponse.json({ error: 'Missing or invalid ID' }, { status: 400 });
    }

    const fileData = fs.readFileSync(filePath, 'utf-8');
    const news = JSON.parse(fileData);

    const updatedNews = news.filter((item) => item.id !== id);

    if (news.length === updatedNews.length) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    fs.writeFileSync(filePath, JSON.stringify(updatedNews, null, 2));
    return NextResponse.json({ message: 'News deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting the news:', error);
    return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 });
  }
}
