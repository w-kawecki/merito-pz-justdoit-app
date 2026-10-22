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