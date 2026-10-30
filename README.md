# Just do it!
Aplikacja do zarządzania zadaniami w stylu „To-Do”. Umożliwia zalogowanym użytkownikom na przeglądanie, tworzenie, zarządzanie i usuwanie swoich zadań. Oparta na architekturze 3-tier, zaprojektowana do wdrożenia w chmurze Azure.

## Wykorzystane technologie
- Cloud - Microsoft Azure
- IaC - Terraform
- Frontend - React + Vite
- Backend - Node.js + Express
- DB - PostgreSQL
- Konteneryzacja - Docker + Nginx

## Struktura repozytorium
- `/backend` - Logika aplikacji oraz REST API (Node.js/Express)
- `/config` - Pliki konfiguracyjne
  - `/config/terraform` - Infrastruktura jako kod (Terraform)
- `/docs` - Dokumentacja techniczna i schematy
- `/frontend` - Aplikacja warstwy dostępowej (React + Vite)

## Schemat Architektury
![Schemat Architektury](./docs/schemat.png)

## Uruchomienie lokalne (Frontend)
1. Przejdź do katalogu warstwy webowej i skopiuj plik zmiennych środowiskowych:
   ```bash
   cd frontend
   cp .env.example .env
2. Zainstaluj zależności i uruchom serwer deweloperski:
    ```bash
    npm install
    npm run dev
3. Alternatywne uruchomienie w kontenerze Docker (Nginx):
    ```bash
    docker build -t justdoit-frontend .
    docker run --rm -p 3000:80 justdoit-frontend

## Dokumentacja REST API (`/api/tasks`)

| Metoda HTTP | Ścieżka (Endpoint) | Opis operacji | Kody odpowiedzi HTTP |
| :--- | :--- | :--- | :--- |
| GET | `/api/health` | Weryfikacja statusu serwera aplikacyjnego | 200 OK |
| GET | `/api/tasks` | Pobranie pełnej listy zadań z bazy danych | 200 OK, 500 Internal Server Error |
| GET | `/api/tasks/:id` | Pobranie szczegółów pojedynczego zadania | 200 OK, 400 Bad Request, 404 Not Found |
| POST | `/api/tasks` | Utworzenie nowego zadania po walidacji danych | 201 Created, 400 Bad Request, 500 Internal Server Error |
| PUT | `/api/tasks/:id` | Aktualizacja istniejącego zadania | 200 OK, 400 Bad Request, 404 Not Found |
| DELETE | `/api/tasks/:id` | Usunięcie zadania o podanym identyfikatorze | 200 OK, 400 Bad Request, 404 Not Found |

### Przykładowe żądanie (POST /api/tasks oraz PUT /api/tasks/:id)
```json
{
  "title": "Integracja frontendu z REST API",
  "category": "Frontend",
  "priority": "Wysoki",
  "status": "W trakcie",
  "dueDate": "2026-10-30"
}
```

### Przykładowa odpowiedź (201 Created oraz 200 OK)
```json
{
  "id": 5,
  "title": "Integracja frontendu z REST API",
  "category": "Frontend",
  "priority": "Wysoki",
  "status": "W trakcie",
  "dueDate": "2026-10-30"
}
```

## Instrukcja uruchomienia lokalnego

### 1. Baza danych (PostgreSQL w Dockerze)
```bash
docker run -d \
  --name justdoit-postgres \
  -e POSTGRES_USER=justdoit_user \
  -e POSTGRES_PASSWORD=justdoit_secret_pass \
  -e POSTGRES_DB=justdoit \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. Warstwa Backend (`/backend`)
```bash
cd backend
cp .env.example .env
npm install
npm start
```
Serwer REST API uruchamia się domyślnie pod adresem `http://localhost:8080`.

### 3. Warstwa Frontend (`/frontend`)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Interfejs użytkownika dostępny jest pod adresem `http://localhost:5173`.