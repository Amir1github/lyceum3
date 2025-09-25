import { NextResponse } from 'next/server';
import cloudinary from 'cloudinary';
import { supabaseHelpers } from '../../../../lib/supabase';

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dzbuo2vqt',
  api_key: process.env.CLOUDINARY_API_KEY || '612574697429781',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'Aj_5ed6q99dvzlpjeLI-nsDBsh0',
});

export async function GET() {
  try {
    const news = await supabaseHelpers.getNews();
    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    
    const newNews = {
      title: body.title,
      content: body.content,
      images: body.images || [],
    };

    const news = await supabaseHelpers.addNews(newNews);
    return NextResponse.json({ news }, { status: 201 });
  } catch (error) {
    console.error('Error saving news:', error);
    return NextResponse.json({ error: 'Failed to save news' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing or invalid ID' }, { status: 400 });
    }

    // Найти новость и извлечь ссылки изображений
    const newsItem = await supabaseHelpers.getNewsById(id);
    if (!newsItem) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    const imageUrls = newsItem.images;

    // Извлечь public_id из каждого URL Cloudinary и удалить изображения
    if (imageUrls && imageUrls.length > 0) {
      const publicIds = imageUrls.map((url) => {
        const parts = url.split('/');
        return parts[parts.length - 1].split('.')[0]; // Получаем public_id без расширения
      });

      // Удалить изображения из Cloudinary
      await cloudinary.v2.api.delete_resources(publicIds, {
        type: 'upload',
        resource_type: 'image',
      });
    }

    // Удалить новость из Supabase
    await supabaseHelpers.deleteNews(id);
    
    return NextResponse.json({ message: 'News and associated images deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting the news:', error);
    return NextResponse.json({ error: 'Failed to delete news and images' }, { status: 500 });
  }
}



