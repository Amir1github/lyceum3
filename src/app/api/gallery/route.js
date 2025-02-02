import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'public', 'data', 'gallery.json');

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
  
      // Access the first object inside the array and filter out the imageUrl
      if (data[0]) { // Ensure there's at least one object in the array
        data[0].images = data[0].images.filter((url) => url !== imageUrl);
        writeData(data); // Write updated data back to file
      }
  
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
      console.error('Error deleting image:', error);
      return new Response(JSON.stringify({ error: 'Ошибка удаления изображения' }), { status: 500 });
    }
  }
  
