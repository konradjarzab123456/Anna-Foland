# PRD — Strona wizytówkowa z zakładkami (Studio Verto — placeholder)

## Problem statement (original)
"Potrzebuję strony internetowej z kilkoma zakładkami" — user later chose: strona firmowa (wizytówka), jasny minimalistyczny + klasyczno-firmowy styl, prosty panel administracyjny do edycji treści, własne teksty do każdej zakładki (do wklejenia przez panel).

## Personas
- Właściciel firmy (admin): loguje się do /admin, wkleja własne teksty/zdjęcia, zapisuje.
- Klient firmy (gość): przegląda zakładki, wysyła zapytanie przez formularz kontaktowy.

## Architecture
- Frontend: React 19 (CRA/craco) + Tailwind + framer-motion + lenis + react-query + sonner. Strony: Start, O firmie, Oferta, Realizacje, Kontakt, /admin.
- Backend: FastAPI (0.0.0.0:8001, routes /api/*): auth JWT (bcrypt, httpOnly cookies + Bearer fallback, brute-force lockout), GET/PUT /api/content (singleton "site_content"), POST /api/contact, GET /api/messages.
- DB: MongoDB (MONGO_URL, DB_NAME). Kolekcje: users, login_attempts, contact_messages, site_content.

## Core requirements (static)
- Kilka zakładek (5 publicznych), wspólna nawigacja, stopka.
- Panel /admin z logowaniem i edycją WSZYSTKICH treści strony (nazwa, hero, statystyki, marquee, O firmie, oferta, realizacje, kontakt, stopka) + odbiór wiadomości z formularzy.
- Formularz kontaktowy zapisany w bazie.

## Implemented (2026-10-14)
- Pełny frontend 6 widoków; kinetic masked-line hero, marquee, tilt+spotlight+parallax, kalkulator wyceny, filtry+modal realizacji, formularze z toastami, lenis smooth scroll, ErrorBoundary, logo SVG + favicon.
- Backend: JWT auth wg playbooka (seed admina, lockout 5 prób/15 min), content API, contact API. Zweryfikowano curl-em: login, /me, PUT/GET content (401 bez tokenu), POST contact, GET messages.
- Zrzuty: desktop 1440 + mobile 390 (home, realizacje filtr+modal, oferta kalkulator, admin login→edycja→zapis).

## Treści
- WSZYSTKIE treści (nazwa "Studio Verto", liczby typu "280+ projektów", "od 2008", nagrody, dane rejestrowe) są TREŚCIĄ DEMONSTRACYJNĄ / placeholderem — do podmiany w /admin. Notka o tym jest w stopce strony.

## Backlog (P0/P1/P2)
- P0: wklejenie realnych tekstów i nazwy firmy przez /admin; podmiana zdjęć (URL-e lub upload).
- P1: upload zdjęć (object storage) w panelu; edycja maila odbiorcy formularzy; powiadomienie e-mail o zapytaniu (Resend).
- P2: SEO/meta per strona, mapa dojazdu,wersja EN.

## Next tasks
- Wkleić teksty firmy w /admin (zakładki Start / O firmie / Oferta / Realizacje / Kontakt).
- Dodać upload zdjęć do panelu (object storage playbook).
- E-mail powiadomienie o nowych zapytaniach (Resend playbook).
