import { NextResponse } from 'next/server';
import { supabaseHelpers } from '../../../../../lib/supabase';

export async function GET(req, { params }) {
  try {
    const { id } = params; // Получаем id из параметров маршрута

    const newsItem = await supabaseHelpers.getNewsById(id);

    if (!newsItem) {
      return NextResponse.json({ error: 'Новость не найдена' }, { status: 404 });
    }

    return NextResponse.json(newsItem);
  } catch (error) {
    console.error('Error fetching news item:', error);
    return NextResponse.json({ error: 'Failed to fetch news item' }, { status: 500 });
  }
}
