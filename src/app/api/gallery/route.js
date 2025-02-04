import fs from 'fs';
import path from 'path';
import cloudinary from 'cloudinary';
const filePath = path.join(process.cwd(), 'public', 'data', 'gallery.json');
cloudinary.v2.config({
  cloud_name: 'dzbuo2vqt',
  api_key: '612574697429781', // Замените на ваш реальный ключ API
  api_secret: 'Aj_5ed6q99dvzlpjeLI-nsDBsh0',
});

// Function to read data from the gallery.json file
function readData() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ images: [] }, null, 2)); // Create the file if it doesn't exist
  }
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

// Function to write data to the gallery.json file
function writeData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// API handler for GET requests
export async function GET(req) {
  const data = readData();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// API handler for POST requests (upload images)
// API handler for POST requests (upload images)
export async function POST(req) {
    try {
      const body = await req.json();
      const data = readData();
  
      // Ensure body contains the Cloudinary image URLs
      if (Array.isArray(body.urls)) {
        // Access the first object in the array and push the URLs to the images array
        if (data[0]) {
          data[0].images.push(...body.urls);
        } else {
          // If the first object doesn't exist, create it and initialize the images array
          data.push({ images: body.urls });
        }
  
        writeData(data); // Write updated data back to file
      } else {
        return new Response(JSON.stringify({ error: 'Invalid URL format' }), { status: 400 });
      }
  
      return new Response(JSON.stringify({ success: true }), { status: 201 });
    } catch (error) {
      console.error('Error adding images:', error);
      return new Response(JSON.stringify({ error: 'Ошибка записи данных' }), { status: 500 });
    }
  }
  
  
// API handler for DELETE requests (delete image)
export async function DELETE(req) {
  try {
    const { imageUrl } = await req.json();
    const data = readData();

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'Missing imageUrl' }), { status: 400 });
    }

    // Извлечь public_id из URL Cloudinary
    const publicId = imageUrl.split('/').pop().split('.')[0]; // Получаем public_id без расширения

    // Удалить изображение из Cloudinary
    await cloudinary.v2.uploader.destroy(publicId);

    // Удалить изображение из локальных данных
    if (data[0]) {
      data[0].images = data[0].images.filter((url) => url !== imageUrl);
      writeData(data); // Write updated data back to file
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error deleting image:', error);
    return new Response(JSON.stringify({ error: 'Ошибка удаления изображения' }), { status: 500 });
  }
}