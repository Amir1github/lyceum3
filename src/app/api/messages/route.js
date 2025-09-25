import { supabaseHelpers } from '../../../../lib/supabase';

// Обработка GET запроса для получения сообщений
export async function GET(req) {
  try {
    const messages = await supabaseHelpers.getMessages();
    return new Response(JSON.stringify(messages), { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return new Response(JSON.stringify({ error: 'Ошибка при получении сообщений' }), { status: 500 });
  }
}

// Обработка DELETE запроса для удаления сообщения
export async function DELETE(req) {
  try {
    const { name, email, message } = await req.json();

    await supabaseHelpers.deleteMessage(name, email, message);

    return new Response(JSON.stringify({ message: 'Сообщение удалено успешно' }), { status: 200 });
  } catch (error) {
    console.error('Error deleting message:', error);
    return new Response(JSON.stringify({ error: 'Ошибка при удалении сообщения' }), { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { clearAll } = await req.json();

    // Проверяем, требуется ли очистить все сообщения
    if (clearAll) {
      await supabaseHelpers.clearAllMessages();
      return new Response(JSON.stringify({ message: 'Все сообщения успешно удалены' }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: 'Некорректный запрос' }), { status: 400 });
    }
  } catch (error) {
    console.error('Error clearing messages:', error);
    return new Response(JSON.stringify({ error: 'Ошибка при обработке запроса' }), { status: 500 });
  }
}