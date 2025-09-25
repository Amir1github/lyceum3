import cloudinary from 'cloudinary';
import { supabaseHelpers } from '../../../../lib/supabase';

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dzbuo2vqt',
  api_key: process.env.CLOUDINARY_API_KEY || '612574697429781',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'Aj_5ed6q99dvzlpjeLI-nsDBsh0',
});

// API handler for GET requests
export async function GET(req) {
  try {
    const data = await supabaseHelpers.getGallery();
    return new Response(JSON.stringify([data]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return new Response(JSON.stringify({ error: 'Ошибка получения данных галереи' }), { status: 500 });
  }
}

// API handler for POST requests (upload images)
export async function POST(req) {
  try {
    const body = await req.json();

    // Ensure body contains the Cloudinary image URLs
    if (Array.isArray(body.urls)) {
      await supabaseHelpers.addGalleryImages(body.urls);
      return new Response(JSON.stringify({ success: true }), { status: 201 });
    } else {
      return new Response(JSON.stringify({ error: 'Invalid URL format' }), { status: 400 });
    }
  } catch (error) {
    console.error('Error adding images:', error);
    return new Response(JSON.stringify({ error: 'Ошибка записи данных' }), { status: 500 });
  }
}

// API handler for DELETE requests (delete image)
export async function DELETE(req) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) return new Response(JSON.stringify({ error: 'Missing imageUrl' }), { status: 400 });

    // Удаляем из Cloudinary
    const publicId = imageUrl.split('/').pop().split('.')[0];
    await cloudinary.v2.uploader.destroy(publicId);

    const { error } = await supabaseHelpers.removeGalleryImage(imageUrl);
    if (error) throw error;


    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error deleting image:', error);
    return new Response(JSON.stringify({ error: 'Ошибка удаления изображения' }), { status: 500 });
  }
}
