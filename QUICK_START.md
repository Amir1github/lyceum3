# Быстрый старт миграции на Supabase

## 🚀 Выполните эти 4 шага:

### 1. Создайте .env.local файл:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://zsvdqzefetzfdfaqgunb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzdmRxemVmZXR6ZmRmYXFndW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3OTk3NDksImV4cCI6MjA3NDM3NTc0OX0.3AJ6iMJmhKLDGhN7BMPDrXGCtJ_nFMGw8b3pZ1eZz4M
```

### 2. Создайте схему в Supabase:
- Откройте https://supabase.com/dashboard
- Выберите ваш проект
- SQL Editor → выполните код из `supabase_schema.sql`

### 3. Запустите миграцию:
```bash
npm run migrate
```

### 3.1. Если некоторые таблицы не заполнились:
```bash
npm run migrate-missing
```

### 4. Проверьте результат:
```bash
npm run dev
```

## ✅ Готово! Ваш сайт теперь использует Supabase вместо JSON файлов.

**Подробные инструкции**: см. `MIGRATION_README.md`
