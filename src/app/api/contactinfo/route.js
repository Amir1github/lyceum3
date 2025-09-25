import { supabaseHelpers } from '../../../../lib/supabase';

export async function GET(req) {
  try {
    const contactInfo = await supabaseHelpers.getContactInfo();
    return new Response(JSON.stringify(contactInfo), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Ошибка при получении контактной информации:', error);
    return new Response(JSON.stringify({ error: 'Не удалось загрузить данные.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    await supabaseHelpers.updateContactInfo(body);

    return new Response(JSON.stringify({ message: 'Данные успешно обновлены.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Ошибка при сохранении контактной информации:', error);
    return new Response(JSON.stringify({ error: 'Не удалось сохранить данные.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
