import { supabaseHelpers } from '../../../../lib/supabase';

// Обработка GET запроса для получения списка вакансий
export async function GET(req) {
  try {
    const vacancies = await supabaseHelpers.getVacancies();
    return new Response(JSON.stringify(vacancies), { status: 200 });
  } catch (error) {
    console.error('Error fetching vacancies:', error);
    return new Response(
      JSON.stringify({ error: 'Ошибка при получении списка вакансий' }),
      { status: 500 }
    );
  }
}

// Обработка POST запроса для добавления новой вакансии
export async function POST(req) {
  try {
    const newVacancy = await req.json();

    // Проверяем наличие всех необходимых полей
    const { position, salary, hoursPerWeek, description, requirements } = newVacancy;
    if (!position || !salary || !hoursPerWeek || !description || !requirements) {
      return new Response(
        JSON.stringify({ error: 'Все поля должны быть заполнены' }),
        { status: 400 }
      );
    }

    const vacancyData = {
      position,
      salary,
      hours_per_week: hoursPerWeek,
      description,
      requirements
    };

    const vacancy = await supabaseHelpers.addVacancy(vacancyData);
    return new Response(JSON.stringify(vacancy), { status: 201 });
  } catch (error) {
    console.error('Error adding vacancy:', error);
    return new Response(
      JSON.stringify({ error: 'Ошибка при добавлении вакансии' }),
      { status: 500 }
    );
  }
}

// Обработка DELETE запроса для удаления вакансии
export async function DELETE(req) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  // Проверяем, если id не передан
  if (!id) {
    return new Response(
      JSON.stringify({ error: 'ID вакансии не указан' }),
      { status: 400 }
    );
  }

  try {
    await supabaseHelpers.deleteVacancy(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting vacancy:', error);
    return new Response(
      JSON.stringify({ error: 'Ошибка при удалении вакансии' }),
      { status: 500 }
    );
  }
}