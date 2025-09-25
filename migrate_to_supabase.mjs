import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

console.log('🚀 Скрипт запущен!');
console.log('Текущая директория:', process.cwd());

// Supabase configuration
const supabaseUrl = 'https://zsvdqzefetzfdfaqgunb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzdmRxemVmZXR6ZmRmYXFndW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3OTk3NDksImV4cCI6MjA3NDM3NTc0OX0.3AJ6iMJmhKLDGhN7BMPDrXGCtJ_nFMGw8b3pZ1eZz4M';

const supabase = createClient(supabaseUrl, supabaseKey);

// Диагностическая функция для чтения файлов
function readJsonFile(filename) {
  console.log(`\n📂 Попытка чтения файла: ${filename}`);
  
  // Проверяем разные возможные пути
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'data', filename),
    path.join(process.cwd(), 'src', 'data', filename),
    path.join(process.cwd(), 'data', filename),
    path.join(process.cwd(), filename)
  ];

  console.log('Проверяем следующие пути:');
  possiblePaths.forEach((p, index) => {
    console.log(`  ${index + 1}. ${p}`);
  });

  let foundPath = null;
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      foundPath = filePath;
      console.log(`✅ Файл найден: ${filePath}`);
      break;
    }
  }

  if (!foundPath) {
    console.error(`❌ Файл ${filename} не найден ни в одном из путей!`);
    
    // Покажем что есть в текущей директории
    console.log('\n📁 Содержимое текущей директории:');
    try {
      const files = fs.readdirSync(process.cwd());
      files.forEach(file => {
        const isDir = fs.statSync(path.join(process.cwd(), file)).isDirectory();
        console.log(`  ${isDir ? '📁' : '📄'} ${file}`);
      });
    } catch (err) {
      console.error('Ошибка чтения директории:', err);
    }
    
    return null;
  }

  try {
    const data = fs.readFileSync(foundPath, 'utf8');
    console.log(`✅ Файл ${filename} успешно прочитан (${data.length} символов)`);
    
    const parsed = JSON.parse(data);
    console.log(`✅ JSON успешно распарсен`);
    console.log(`📊 Тип данных: ${Array.isArray(parsed) ? 'массив' : typeof parsed}`);
    console.log(`📊 Размер: ${Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length}`);
    
    return parsed;
  } catch (err) {
    console.error(`❌ Ошибка чтения/парсинга файла ${filename}:`, err.message);
    return null;
  }
}

// Простая диагностическая функция для тестирования Supabase
async function testSupabase() {
  console.log('\n🔌 Тестируем подключение к Supabase...');
  try {
    const { data, error } = await supabase.from('gallery').select('*').limit(1);
    if (error) {
      console.error('❌ Ошибка подключения к Supabase:', error);
      return false;
    }
    console.log('✅ Подключение к Supabase работает!');
    console.log('📊 Данные из таблицы gallery:', data);
    return true;
  } catch (err) {
    console.error('❌ Критическая ошибка Supabase:', err);
    return false;
  }
}

// Диагностические версии функций миграции
async function migrateGallery() {
  console.log('\n=== 🖼️  МИГРАЦИЯ ГАЛЕРЕИ ===');
  
  const galleryData = readJsonFile('gallery.json');
  if (!galleryData) {
    console.log('❌ Данные галереи не загружены, пропускаем миграцию');
    return false;
  }

  console.log('📋 Структура данных галереи:');
  console.log(JSON.stringify(galleryData, null, 2));

  // Пробуем вставить данные
  try {
    const insertData = { images: galleryData[0]?.images || galleryData.images || [] };
    console.log('📤 Вставляем данные:', insertData);

    const { data, error } = await supabase
      .from('gallery')
      .insert([insertData])
      .select();

    if (error) {
      console.error('❌ Ошибка вставки галереи:', error);
      return false;
    }

    console.log('✅ Галерея успешно мигрирована:', data);
    return true;
  } catch (err) {
    console.error('❌ Критическая ошибка миграции галереи:', err);
    return false;
  }
}

async function migrateNews() {
  console.log('\n=== 📰 МИГРАЦИЯ НОВОСТЕЙ ===');
  
  const newsData = readJsonFile('news.json');
  if (!newsData) {
    console.log('❌ Данные новостей не загружены, пропускаем миграцию');
    return false;
  }

  console.log(`📊 Загружено ${newsData.length} новостей`);
  console.log('📋 Первая новость:', newsData[0]);

  try {
    const newsToInsert = newsData.slice(0, 2).map(item => ({ // Вставляем только первые 2 для теста
      title: item.title,
      content: item.content,
      images: item.images || [],
      created_at: item.createdAt
    }));

    console.log('📤 Вставляем тестовые данные:', newsToInsert);

    const { data, error } = await supabase
      .from('news')
      .insert(newsToInsert)
      .select();

    if (error) {
      console.error('❌ Ошибка вставки новостей:', error);
      return false;
    }

    console.log('✅ Новости успешно мигрированы:', data);
    return true;
  } catch (err) {
    console.error('❌ Критическая ошибка миграции новостей:', err);
    return false;
  }
}

async function migrateContactInfo() {
  console.log('\n=== 📞 МИГРАЦИЯ КОНТАКТОВ ===');
  
  const contactData = readJsonFile('contact.json');
  if (!contactData) {
    console.log('❌ Контактные данные не загружены, пропускаем миграцию');
    return false;
  }

  console.log('📋 Контактные данные:');
  console.log(JSON.stringify(contactData, null, 2));

  try {
    const { data, error } = await supabase
      .from('contact_info')
      .insert([contactData])
      .select();

    if (error) {
      console.error('❌ Ошибка вставки контактов:', error);
      return false;
    }

    console.log('✅ Контакты успешно мигрированы:', data);
    return true;
  } catch (err) {
    console.error('❌ Критическая ошибка миграции контактов:', err);
    return false;
  }
}

// Упрощённая основная функция
async function runDiagnostics() {
  console.log('\n🔍 === ДИАГНОСТИКА МИГРАЦИИ ===');
  
  // Проверяем доступность всех JSON файлов
  const jsonFiles = ['gallery.json', 'news.json', 'contact.json', 'classlist.json', 'cabinets.json'];
  
  console.log('\n📂 Проверяем наличие JSON файлов:');
  const availableFiles = [];
  jsonFiles.forEach(file => {
    const data = readJsonFile(file);
    if (data) {
      availableFiles.push(file);
    }
  });
  
  console.log(`\n✅ Найдено файлов: ${availableFiles.length}/${jsonFiles.length}`);
  
  if (availableFiles.length === 0) {
    console.log('❌ Ни одного JSON файла не найдено! Проверьте структуру проекта.');
    return;
  }

  // Тестируем Supabase
  const supabaseOk = await testSupabase();
  if (!supabaseOk) {
    console.log('❌ Supabase недоступен, миграция невозможна');
    return;
  }

  // Запускаем простые миграции
  const results = [];
  
  if (availableFiles.includes('gallery.json')) {
    const result = await migrateGallery();
    results.push({ name: 'Gallery', success: result });
  }
  
  if (availableFiles.includes('news.json')) {
    const result = await migrateNews();
    results.push({ name: 'News', success: result });
  }
  
  if (availableFiles.includes('contact.json')) {
    const result = await migrateContactInfo();
    results.push({ name: 'Contact', success: result });
  }

  // Результаты
  console.log('\n📊 === РЕЗУЛЬТАТЫ ДИАГНОСТИКИ ===');
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.name}`);
  });
  
  const successful = results.filter(r => r.success).length;
  console.log(`\n🎯 Успешно: ${successful}/${results.length}`);
}

// Запуск диагностики
console.log('🎬 Запускаем диагностику...');

runDiagnostics()
  .then(() => {
    console.log('🏁 Диагностика завершена');
  })
  .catch(err => {
    console.error('💥 Критическая ошибка диагностики:', err);
  });

export { runDiagnostics };