# Инструкция по деплою M2 Split на Vercel

## Репозиторий GitHub

Проект размещён на GitHub: https://github.com/nikita-tita/m2split

## Деплой на Vercel

### Способ 1: Через веб-интерфейс (рекомендуется)

1. **Перейдите на Vercel**
   - Откройте [vercel.com](https://vercel.com)
   - Войдите через GitHub аккаунт

2. **Импортируйте проект**
   - Нажмите кнопку "Add New..." → "Project"
   - Выберите репозиторий `m2split` из списка
   - Если репозитория нет в списке, нажмите "Adjust GitHub App Permissions" и дайте доступ к репозиторию

3. **Настройте проект**
   - **Project Name**: `m2split` (или любое другое имя)
   - **Framework Preset**: Next.js (определится автоматически)
   - **Root Directory**: `./` (оставьте по умолчанию)
   - **Build Command**: `npm run build` (по умолчанию)
   - **Output Directory**: `.next` (по умолчанию)
   - **Install Command**: `npm install` (по умолчанию)

4. **Переменные окружения** (опционально)
   - На данный момент не требуются
   - В будущем можно добавить:
     - `NEXT_PUBLIC_API_URL`
     - `DATABASE_URL`
     - и т.д.

5. **Деплой**
   - Нажмите "Deploy"
   - Дождитесь завершения сборки (обычно 2-3 минуты)
   - После успешного деплоя получите URL вида: `https://m2split.vercel.app` или `https://m2split-xxxxx.vercel.app`

### Способ 2: Через Vercel CLI

1. **Установите Vercel CLI**
   \`\`\`bash
   npm install -g vercel
   \`\`\`

2. **Войдите в аккаунт**
   \`\`\`bash
   vercel login
   \`\`\`

3. **Деплой**
   \`\`\`bash
   cd /path/to/m2split
   vercel
   \`\`\`

4. **Следуйте инструкциям в терминале:**
   - Set up and deploy? `Y`
   - Which scope? (выберите ваш аккаунт)
   - Link to existing project? `N`
   - What's your project's name? `m2split`
   - In which directory is your code located? `./`
   - Want to override the settings? `N`

5. **Production деплой**
   \`\`\`bash
   vercel --prod
   \`\`\`

## После деплоя

### Проверка работы

1. Откройте URL вашего деплоя
2. Вы автоматически будете перенаправлены на `/dashboard`
3. Проверьте основные разделы:
   - Dashboard с метриками
   - Сделки (список и детали)
   - Реестры
   - Выплаты
   - Контрагенты
   - Документы
   - Настройки

### Настройка кастомного домена (опционально)

1. В Vercel перейдите в Settings проекта
2. Выберите вкладку "Domains"
3. Добавьте свой домен (например, `m2split.yourcompany.com`)
4. Следуйте инструкциям для настройки DNS записей

### Автоматический деплой

Vercel автоматически настроит:
- **Production деплой**: каждый push в ветку `main`
- **Preview деплой**: для каждого Pull Request

### Мониторинг

В Vercel Dashboard доступны:
- Логи деплоев
- Метрики производительности
- Аналитика трафика
- Логи ошибок

## Настройка проекта в Vercel

### Рекомендуемые настройки

1. **General**
   - Node.js Version: `20.x` (рекомендуется)

2. **Git**
   - Production Branch: `main`
   - Enable "Automatically expose System Environment Variables"

3. **Domains**
   - Добавьте свой домен (если есть)

4. **Environment Variables** (если потребуется)
   - Для разных окружений (Production, Preview, Development)

## Обновление приложения

### Через Git

\`\`\`bash
# Внесите изменения в код
git add .
git commit -m "Описание изменений"
git push origin main
\`\`\`

Vercel автоматически задеплоит новую версию.

### Через Vercel Dashboard

1. Перейдите в раздел "Deployments"
2. Нажмите "Redeploy" для любого предыдущего деплоя
3. Или "Promote to Production" для preview деплоя

## Откат к предыдущей версии

1. В Vercel Dashboard перейдите в "Deployments"
2. Найдите нужную версию
3. Нажмите "⋯" → "Promote to Production"

## Полезные ссылки

- **GitHub репозиторий**: https://github.com/nikita-tita/m2split
- **Vercel документация**: https://vercel.com/docs
- **Next.js документация**: https://nextjs.org/docs

## Troubleshooting

### Ошибка сборки

1. Проверьте логи в Vercel Dashboard
2. Убедитесь, что локально выполняется `npm run build`
3. Проверьте версию Node.js в настройках Vercel

### Проблемы с зависимостями

\`\`\`bash
# Очистите кэш и переустановите
rm -rf node_modules package-lock.json
npm install
npm run build
\`\`\`

### 404 ошибки на роутах

- Убедитесь, что используется Next.js App Router (директория `app/`)
- Проверьте правильность путей в компонентах Link

## Контакты поддержки

Для вопросов по деплою:
- Email: support@m2split.ru
- GitHub Issues: https://github.com/nikita-tita/m2split/issues
