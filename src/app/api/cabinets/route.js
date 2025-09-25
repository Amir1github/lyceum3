import { supabaseHelpers } from '../../../../lib/supabase';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherName = decodeURIComponent(searchParams.get('teacher') || '').trim();

    if (!teacherName) {
      return new Response(JSON.stringify({ error: 'Не указано имя преподавателя' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const matchedCabinet = await supabaseHelpers.getCabinetByTeacher(teacherName);

    if (!matchedCabinet) {
      return new Response(JSON.stringify({ error: `Кабинет не найден для преподавателя: ${teacherName}` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        cabinet: {
          cabinetNumber: matchedCabinet.cabinet_number,
          cabinetType: matchedCabinet.cabinet_types?.name || 'Не указан',
          capacity: matchedCabinet.capacity,
          pavilionNumber: matchedCabinet.pavilions?.pavilion_number || 'Не указан',
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error);
    return new Response(JSON.stringify({ error: 'Ошибка сервера' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(req) {
  try {
    const { teacher, cabinet } = await req.json();

    if (!teacher || !cabinet) {
      return new Response(JSON.stringify({ error: 'Не указаны данные для обновления' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await supabaseHelpers.updateCabinetByTeacher(teacher, cabinet);

    return new Response(
      JSON.stringify({ message: 'Данные обновлены успешно' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Ошибка при обновлении данных:', error);
    return new Response(JSON.stringify({ error: 'Ошибка сервера' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
