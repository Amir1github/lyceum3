import { NextResponse } from 'next/server';
import { supabaseHelpers } from '../../../../lib/supabase';

export async function POST(req) {
  try {
    const { name, email, message, admin } = await req.json();

    const messageData = {
      name,
      email,
      message,
      admin: admin || false
    };

    await supabaseHelpers.addMessage(messageData);

    return NextResponse.json({ message: 'Сообщение отправлено успешно' }, { status: 200 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Ошибка при записи сообщения' }, { status: 500 });
  }
}
