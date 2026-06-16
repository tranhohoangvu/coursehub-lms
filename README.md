# CourseHub — No Docker, No Prisma

Portfolio project for Backend Developer CV.

Stack:

- Backend: Express.js + pg driver
- Frontend: React Vite
- Database: Supabase PostgreSQL or any cloud PostgreSQL
- Auth: JWT
- Roles: ADMIN / INSTRUCTOR / STUDENT
- Features: courses, lessons, cart, mock checkout, enrollment, progress, reviews, admin dashboard

This version intentionally does **not** use Docker and **does not** use Prisma, so it avoids Prisma engine downloads on weak machines or restricted company networks.

## Backend setup

```bash
cd backend
npm install
copy .env.example .env
```

Edit `backend/.env` and set your Supabase PostgreSQL `DATABASE_URL`.

Then run:

```bash
npm run db:init
npm run seed
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

## Frontend setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Demo accounts

```text
admin@example.com / 123456
teacher@example.com / 123456
student@example.com / 123456
```

## Important notes for Windows

If `node_modules` is locked, close VS Code/terminal, then run:

```powershell
taskkill /F /IM node.exe
rmdir /s /q node_modules
```

Then run `npm install` again.
