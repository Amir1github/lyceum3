import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

const dataFilePath = path.join(process.cwd(), 'public', 'data', 'classlist.json');

async function readClassData() {
  const data = await fs.readFile(dataFilePath, 'utf-8');
  return JSON.parse(data);
}

async function writeClassData(data) {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

export async function GET() {
  const classData = await readClassData();
  return NextResponse.json(classData);
}

export async function POST(req) {
  try {
    const { className, letter } = await req.json();

    if (!className || !letter) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const classNumber = className.match(/\d+/)?.[0]; // Извлечение номера класса
    if (!classNumber) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    const classData = await readClassData();

    // Определение группы по номеру класса
    const targetGroup = classData.groups.find(group => {
      const firstClass = parseInt(group.classes[0]?.name, 10);
      const lastClass = parseInt(group.classes[group.classes.length - 1]?.name, 10);
      return classNumber >= firstClass && classNumber <= lastClass;
    });

    if (!targetGroup) {
      return NextResponse.json({ error: 'No suitable group found' }, { status: 404 });
    }

    // Поиск или добавление класса
    let targetClass = targetGroup.classes.find(cls => cls.name === classNumber);
    if (!targetClass) {
      targetClass = { name: classNumber, letters: [] };
      targetGroup.classes.push(targetClass);
    }

    // Добавление буквы, если её ещё нет
    if (!targetClass.letters.includes(letter)) {
      targetClass.letters.push(letter);
      targetClass.letters.sort();
    }

    await writeClassData(classData);

    return NextResponse.json({ message: 'Class letter added successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { className, letter } = await req.json();

    if (!className || !letter) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const classNumber = className.match(/\d+/)?.[0]; // Извлечение номера класса
    if (!classNumber) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    const classData = await readClassData();

    // Определение группы по номеру класса
    const targetGroup = classData.groups.find(group => {
      const firstClass = parseInt(group.classes[0]?.name, 10);
      const lastClass = parseInt(group.classes[group.classes.length - 1]?.name, 10);
      return classNumber >= firstClass && classNumber <= lastClass;
    });

    if (!targetGroup) {
      return NextResponse.json({ error: 'No suitable group found' }, { status: 404 });
    }

    const targetClass = targetGroup.classes.find(cls => cls.name === classNumber);
    if (!targetClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Удаление буквы
    targetClass.letters = targetClass.letters.filter(l => l !== letter);

    // Если букв больше нет, удаляем весь класс
    if (targetClass.letters.length === 0) {
      targetGroup.classes = targetGroup.classes.filter(cls => cls.name !== classNumber);
    }

    await writeClassData(classData);

    return NextResponse.json({ message: 'Class letter deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
