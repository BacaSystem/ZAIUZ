# System Zarządzania Pomiarami ZAIUZ

Kompleksowy system zarządzania danymi pomiarowymi IoT zbudowany w oparciu o Spring Boot, Angular i PostgreSQL. Aplikacja zapewnia zbieranie pomiarów w czasie rzeczywistym, wizualizację danych oraz funkcje administracyjne dla danych z czujników IoT.

## Spis treści

- Przegląd
- Funkcjonalności  
- Architektura
- Stos technologiczny
- Schema bazy danych
- Dokumentacja API
- Struktura frontend
- Szybki start
- Konfiguracja środowiska lokalnego
- Wdrożenie Docker
- Uwierzytelnianie i autoryzacja
- Konfiguracja
- Testowanie

## Przegląd

ZAIUZ to pełnowarstwowy system pomiarów IoT przeznaczony do zbierania, przechowywania i wizualizacji danych z czujników z różnych serii pomiarowych (temperatura, wilgotność, itp.). System zapewnia kontrolę dostępu opartą na rolach z oddzielnymi interfejsami dla zwykłych użytkowników i administratorów.

### Kluczowe możliwości

- Zbieranie pomiarów w czasie rzeczywistym: Pozyskiwanie i przechowywanie pomiarów z czujników IoT
- Wizualizacja danych: Interaktywne wykresy i dashboardy do analizy pomiarów
- Obsługa wielu serii: Obsługa wielu typów pomiarów z konfigurowalnymi zakresami i kolorami
- Zarządzanie użytkownikami: Kontrola dostępu oparta na rolach (role Admin/User)
- RESTful API: Kompleksowe REST API z dokumentacją Swagger
- Responsywny UI: Nowoczesny interfejs użytkownika oparty na Angular z Material Design

## Funkcjonalności

### Podstawowe funkcje
- Interaktywny Dashboard: Wizualizacja pomiarów w czasie rzeczywistym z Chart.js
- ![img.png](documentation/dahsboard.png)
- Uwierzytelnianie JWT: Bezpieczny system uwierzytelniania oparty na tokenach
- ![img.png](documentation/login.png)
- Zarządzanie użytkownikami: Panel administratora do tworzenia i zarządzania użytkownikami
- ![img.png](documentation/admin_users.png)
- Zarządzanie seriami: Konfiguracja serii pomiarowych z niestandardowymi zakresami i kolorami
- ![img.png](documentation/admin_series.png)
- ![img.png](documentation/admin_measurements.png)
- Zaawansowane filtrowanie: Zapytania o pomiary według zakresu czasowego, serii i paginacji
- Responsywny design: Interfejs przyjazny dla urządzeń mobilnych używający Angular Material
- Możliwośc zmiana hasła przez zalogowanego uzytkownika
- ![img.png](documentation/change_password.png)

### Funkcje administracyjne
- Konfiguracja serii: Tworzenie i zarządzanie seriami pomiarowymi
- Zarządzanie pomiarami: Operacje CRUD dla danych pomiarowych
- Administracja użytkowników: Zarządzanie kontami użytkowników i rolami
- Eksport danych: Zapytania i eksport danych pomiarowych
- Dostęp oparty na rolach: Oddzielne interfejsy administratora i użytkownika

### Technical Features
- Gotowość na mikrousługi: Architektura kontenerowa z Docker
- Dokumentacja API: Interaktywna dokumentacja Swagger UI
- Monitorowanie stanu: Kontrole stanu aplikacji i monitorowanie
- PostgreSQL: Solidna relacyjna baza danych z zoptymalizowanymi zapytaniami
- Zarządzanie konfiguracją: Konfiguracja oparta na środowisku

## Architektura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│                 │    │                 │    │                 │
│   Angular 20    │───▶│  Spring Boot 3  │───▶│ PostgreSQL 16   │
│   Material UI   │    │    Java 21      │    │                 │
│   Chart.js      │    │  JWT Security   │    │ Measurement     │
│   Nginx         │    │  Swagger API    │    │ Data Storage    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
      Port 80              Port 8080              Port 5432
```

### Architektura komponentów

#### Frontend (Angular)
- Komponenty autonomiczne: Nowoczesna architektura komponentów autonomicznych Angular
- Usługi: Usługi klienta HTTP do komunikacji z API
- Strażnicy: Ochrona tras z kontrolą dostępu opartą na rolach
- Interceptory: Automatyczne wstrzykiwanie tokenów JWT dla wywołań API
- Material Design: Spójny interfejs użytkownika używający komponentów Angular Material

#### Backend (Spring Boot)
- Kontrolery: Punkty końcowe RESTful API z dokumentacją OpenAPI
- Usługi: Warstwa logiki biznesowej do przetwarzania danych
- Repozytoria: Repozytoria JPA do dostępu do bazy danych
- Bezpieczeństwo: Uwierzytelnianie oparte na JWT z autoryzacją opartą na rolach
- Encje: Encje JPA mapowane na tabele bazy danych

#### Baza danych (PostgreSQL)
- Zoptymalizowana schema: Tabele z indeksami dla szybkiej wydajności zapytań
- Przykładowe dane: Wstępnie wypełnione seriami temperatury i wilgotności
- Pola audytu: Znaczniki czasu utworzenia/aktualizacji i śledzenie użytkowników

## Stos technologiczny

### Backend
- Framework: Spring Boot 3.5.6
- Język: Java 21
- Bezpieczeństwo: Spring Security z JWT (jsonwebtoken 0.11.2)
- Baza danych: PostgreSQL z Spring Data JPA
- Dokumentacja: SpringDoc OpenAPI 3 (Swagger)
- Narzędzie budowania: Gradle
- Walidacja: Bean Validation (JSR-303)
- Narzędzia: Lombok, ModelMapper

### Frontend
- Framework: Angular 20.3.0
- Biblioteka UI: Angular Material 20.2.9
- Wykresy: Chart.js 4.5.1 z ng2-charts
- Stylowanie: SCSS z niestandardowymi motywami
- HTTP: Angular HTTP Client z interceptorami
- Uwierzytelnianie: Biblioteka JWT decode
- Narzędzie budowania: Angular CLI

### Infrastruktura
- Konteneryzacja: Docker z budowami wieloetapowymi
- Serwer WWW: Nginx (do serwowania frontend)
- Baza danych: PostgreSQL 16 z trwałymi wolumenami
- Orkiestracja: Docker Compose
- Kontrole stanu: Monitorowanie stanu kontenerów

## Schema bazy danych

### Przegląd tabel

#### Tabela `users`
```sql
- id (UUID, Primary Key)
- username (TEXT, Unique)
- password (TEXT, Hashed)
- role (TEXT) - 'Admin' lub 'User'
- created_by (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### Tabela `series`
```sql
- id (UUID, Primary Key)
- name (TEXT, Unique) - np. 'Temperature', 'Humidity'
- min_value (DOUBLE PRECISION)
- max_value (DOUBLE PRECISION)
- color (TEXT) - Kod koloru Hex dla wykresów
- created_by (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### Tabela `measurements`
```sql
- id (UUID, Primary Key)
- series_id (UUID, Foreign Key → series.id)
- value (DOUBLE PRECISION)
- timestamp (TIMESTAMPTZ)
- created_by (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

Index: idx_measurements_series_time (series_id, timestamp)
```

### Diagram schematyczny bazy danych

```
┌─────────────────────┐
│      USERS          │
├─────────────────────┤
│ • id (UUID) PK      │
│ • username (TEXT)   │
│ • password (TEXT)   │
│ • role (TEXT)       │
│ • created_by        │
│ • created_at        │
│ • updated_at        │
└─────────────────────┘

┌─────────────────────┐
│      SERIES         │
├─────────────────────┤
│ • id (UUID) PK      │
│ • name (TEXT)       │
│ • min_value (FLOAT) │
│ • max_value (FLOAT) │
│ • color (TEXT)      │
│ • created_by        │
│ • created_at        │
│ • updated_at        │
└─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐
│   MEASUREMENTS      │
├─────────────────────┤
│ • id (UUID) PK      │
│ • series_id (UUID)  │─────┐
│ • value (FLOAT)     │     │
│ • timestamp         │     │
│ • created_by        │     │
│ • created_at        │     │
│ • updated_at        │     │
└─────────────────────┘     │
                            │
                            └─FK→ SERIES.id
```

### Relacje
- Jeden-do-wielu: Series → Measurements (z CASCADE delete)
- Zoptymalizowane zapytania: Indeks złożony na series_id i timestamp dla szybkich zapytań szeregów czasowych

### Przykładowe dane
- Domyślni użytkownicy: admin/admin, user/user (oba z hasłem 'password')
- Domyślne serie: Temperature (-30°C do 60°C), Humidity (0% do 100%)
- Przykładowe pomiary: 7 dni przykładowych danych z 6-godzinnymi interwałami

## Dokumentacja API

API zapewnia kompleksowe punkty końcowe RESTful z pełną dokumentacją Swagger.

### Punkty końcowe uwierzytelniania
| Metoda | Punkt końcowy | Opis | Wymagane uwierzytelnianie |
|--------|---------------|------|---------------------------|
| POST | `/auth/login` | Uwierzytelnianie użytkownika | Nie |
| POST | `/auth/register` | Rejestracja użytkownika | Nie |
| POST | `/auth/logout` | Wylogowanie użytkownika | Nie |
| GET | `/auth/me` | Pobierz informacje o bieżącym użytkowniku | Tak |
| POST | `/auth/change-password` | Zmień hasło użytkownika | Tak |

### Publiczne punkty końcowe
| Metoda | Punkt końcowy | Opis | Wymagane uwierzytelnianie |
|--------|---------------|------|---------------------------|
| GET | `/api/series` | Pobierz wszystkie serie pomiarowe | Nie |
| GET | `/api/series/{id}` | Pobierz konkretną serię | Nie |
| GET | `/api/measurement` | Zapytaj o pomiary (z filtrami) | Nie |

### Punkty końcowe administratora (Wymagana rola Admin)
| Metoda | Punkt końcowy | Opis |
|--------|---------------|------|
| POST | `/api/admin/series` | Utwórz nową serię |
| PUT | `/api/admin/series/{id}` | Aktualizuj serię |
| DELETE | `/api/admin/series/{id}` | Usuń serię |
| POST | `/api/admin/measurements` | Utwórz pomiar |
| PUT | `/api/admin/measurements/{id}` | Aktualizuj pomiar |
| DELETE | `/api/admin/measurements/{id}` | Usuń pomiar |
| GET | `/api/admin/users` | Pobierz wszystkich użytkowników |
| POST | `/api/admin/users` | Utwórz użytkownika |
| PUT | `/api/admin/users/{id}` | Aktualizuj użytkownika |
| DELETE | `/api/admin/users/{id}` | Usuń użytkownika |

### Funkcje API
- Paginacja: Wszystkie punkty końcowe list obsługują paginację z parametrami `page`, `size` i `sort`
- Filtrowanie: Zapytania o pomiary obsługują filtrowanie według `seriesIds`, zakresów dat `from` i `to`
- Walidacja: Walidacja żądań z szczegółowymi komunikatami błędów
- CORS: Skonfigurowane dla pochodzenia frontend z odpowiednimi nagłówkami
- Dokumentacja: Interaktywny Swagger UI pod adresem `/swagger-ui.html`

## Struktura Frontend

### Routing
```typescript
/ → Dashboard (Publiczny)
/auth/login → Strona logowania
/admin → Panel administratora (Wymagana rola Admin)
/change-password → Zmiana hasła (Uwierzytelniony)
```

### Architektura komponentów

#### Moduły funkcjonalne
- Dashboard: Główny dashboard wizualizacji pomiarów
- Admin: Interfejs administracyjny z sekcjami w kartach
- Auth: Komponenty uwierzytelniania (logowanie, rejestracja)
- Change Password: Zarządzanie hasłami użytkowników

#### Komponenty współdzielone
- Navigation Bar: Nagłówek aplikacji z menu użytkownika
- Confirm Dialog: Wielokrotnego użytku dialogi potwierdzenia
- Form Components: Formularze serii, pomiarów i użytkowników
- Table Components: Wyświetlanie danych z paginacją i akcjami

#### Usługi
- AuthService: Zarządzanie stanem uwierzytelniania i obsługa JWT
- MeasurementService: Operacje na danych pomiarowych
- SeriesService: Operacje na danych serii
- AdminService: Operacje administracyjne

#### Strażnicy i Interceptory
- AuthGuard: Ochrona tras z dostępem opartym na rolach
- AuthInterceptor: Automatyczne wstrzykiwanie tokenów JWT

### Zarządzanie stanem
- Angular Signals: Nowoczesne reaktywne zarządzanie stanem
- Local Storage: Trwałość tokenów JWT i sesji użytkownika
- RxJS: Reaktywne strumienie danych i operacje HTTP

## Szybki start

### Wymagania wstępne
- Docker i Docker Compose
- Node.js 18+ (do rozwoju lokalnego)
- Java 21 (do rozwoju lokalnego)
- PostgreSQL (do rozwoju lokalnego)

### Używanie Docker (Zalecane)

1. Sklonuj repozytorium
   ```bash
   git clone <repository-url>
   cd ZAIUZ
   ```

2. Uruchom wszystkie usługi
   ```bash
   cd ops
   docker-compose up --build -d
   ```

3. Uzyskaj dostęp do aplikacji
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Swagger UI: http://localhost:8080/swagger-ui.html

4. Domyślne dane logowania
   - Admin: `admin` / `password`
   - User: `user` / `password`

## Konfiguracja środowiska lokalnego

### Rozwój Backend

1. Wymagania wstępne
   ```bash
   # Upewnij się, że Java 21 jest zainstalowana
   java -version
   
   # Uruchom PostgreSQL (lub użyj Docker)
   docker run --name measurements-db -e POSTGRES_DB=measurements_db -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -p 5433:5432 -d postgres:16
   ```

2. Uruchom backend
   ```bash
   cd backend
   ./gradlew bootRun
   
   # Lub na Windows
   gradlew.bat bootRun
   ```

3. Zweryfikuj backend
   - API: http://localhost:8080
   - Swagger: http://localhost:8080/swagger-ui.html
   - Health: http://localhost:8080/actuator/health

### Rozwój Frontend

1. Wymagania wstępne
   ```bash
   # Upewnij się, że Node.js 18+ jest zainstalowany
   node --version
   npm --version
   ```

2. Zainstaluj zależności
   ```bash
   cd frontend
   npm install
   ```

3. Uruchom frontend
   ```bash
   ng serve
   
   # Lub z określoną konfiguracją
   ng serve --configuration development
   ```

4. Uzyskaj dostęp do aplikacji
   - Frontend: http://localhost:4200
   - Proxy development przekieruje wywołania API do backendu

### Konfiguracja bazy danych

Baza danych jest automatycznie inicjalizowana z:
- Wymaganymi tabelami i indeksami
- Przykładowymi danymi (serie temperatury i wilgotności)
- Domyślnymi kontami użytkowników

## Wdrożenie Docker

### Wdrożenie rozwojowe
```bash
cd ops
docker-compose up --build -d
```

### Wdrożenie produkcyjne
```bash
cd ops
docker-compose -f docker-compose.production.yml --env-file .env.production up --build -d
```

### Konfiguracja środowiska

Utwórz plik `.env` w katalogu `ops`:
```bash
# Konfiguracja bazy danych
POSTGRES_DB=measurements_db
POSTGRES_USER=user
POSTGRES_PASSWORD=your_secure_password

# Konfiguracja JWT
JWT_SECRET_KEY=your_secure_jwt_secret_key
JWT_EXPIRATION_TIME=3600000

# Porty aplikacji
BACKEND_PORT=8080
FRONTEND_PORT=3000
PG_PORT=5433

# Konfiguracja CORS
FRONTEND_ORIGIN=http://localhost:4200
```

### Uwagi dotyczące produkcji
- Użyj silnych haseł i sekretów JWT
- Skonfiguruj HTTPS z reverse proxy
- Użyj zarządzanych usług bazy danych
- Włącz odpowiednie logowanie i monitorowanie
- Skonfiguruj strategie kopii zapasowych

## Uwierzytelnianie i autoryzacja

### Implementacja JWT
- Oparte na tokenach: Bezstanowe uwierzytelnianie używające tokenów JWT
- Wygaśnięcie: Konfigurowalne wygaśnięcie tokena (domyślnie: 1 godzina)
- Odświeżanie: Wymagane ręczne ponowne uwierzytelnienie po wygaśnięciu
- Przechowywanie: Tokeny przechowywane w localStorage przeglądarki

### Role
- Admin: Pełny dostęp do systemu włączając zarządzanie użytkownikami i administrację danych
- User: Dostęp tylko do odczytu danych pomiarowych i serii

### Funkcje bezpieczeństwa
- Hashowanie haseł: Hashowanie haseł BCrypt
- Ochrona CORS: Skonfigurowane dozwolone źródła
- Strażnicy tras: Ochrona tras frontend oparta na rolach
- Bezpieczeństwo API: Ochrona punktów końcowych oparta na rolach

## Konfiguracja

### Konfiguracja Backend (`application.properties`)
```properties
# Baza danych
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5433/measurements_db}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:user}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:password}

# JWT
security.jwt.secret-key=${JWT_SECRET_KEY:default_secret}
security.jwt.expiration-time=${JWT_EXPIRATION_TIME:3600000}

# CORS
cors.allowed-origins=${FRONTEND_ORIGIN:http://localhost:4200}

# Swagger
springdoc.swagger-ui.path=/swagger-ui.html
```

### Konfiguracja Frontend
```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};
```

### Konfiguracja Docker
- Budowy wieloetapowe dla zoptymalizowanych obrazów kontenerów
- Kontrole stanu dla monitorowania usług
- Trwałość wolumenów dla danych bazy danych
- Izolacja sieci między usługami

## Testowanie

### Testowanie Backend
```bash
cd backend
./gradlew test
```

### Testowanie Frontend
```bash
cd frontend
npm test
npm run test:coverage
```

### Testowanie API
- Użyj Swagger UI do interaktywnego testowania API
- Kolekcja Postman dostępna do kompleksowego testowania
- Testy integracyjne zawarte w pakiecie testów backend

### Development Workflow
1. Fork the repository
## Wymagania projektu

System ZAIUZ realizuje następujące wymagania funkcjonalne:

### Zarządzanie danymi pomiarowymi
- Przechowywanie pomiarów z różnych serii (temperatura, wilgotność)
- Obsługa znaczników czasowych dla każdego pomiaru
- Możliwość definiowania zakresów wartości dla każdej serii
- Kolorowanie serii dla lepszej wizualizacji

### Interfejs użytkownika
- Dashboard z wykresami w czasie rzeczywistym
- Panel administracyjny dla zarządzania danymi
- Responsywny design obsługujący urządzenia mobilne
- Intuicyjne formularze do wprowadzania danych

### Bezpieczeństwo
- System uwierzytelniania oparty na JWT
- Role użytkowników (Administrator, Użytkownik)
- Ochrona tras i punktów końcowych API
- Hashowanie haseł z użyciem BCrypt

### Architektura techniczna
- Architektura trójwarstwowa (Frontend, Backend, Baza danych)
- RESTful API z dokumentacją Swagger
- Konteneryzacja z Docker
- Baza danych PostgreSQL z optymalizacją

### Funkcjonalności administracyjne
- Zarządzanie użytkownikami
- Konfiguracja serii pomiarowych
- Operacje CRUD na pomiarach
- Eksport danych

---

## Wsparcie

W przypadku problemów, pytań lub wkładu:
- Sprawdź istniejącą dokumentację i dokumenty API Swagger
- Przejrzyj przewodnik wdrażania w przypadku problemów z konfiguracją

## Licencja

Ten projekt jest licencjonowany na licencji MIT - zobacz plik LICENSE, aby uzyskać szczegóły.

---

Zbudowany przy użyciu Spring Boot, Angular i PostgreSQL