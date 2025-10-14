-- Minimalna baza danych dla systemu pomiarów IoT
-- Przygotowana pod Entity Framework Core

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabele

-- Użytkownicy (ASP.NET Identity stworzy własne tabele, to tylko dla aplikacji)
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username    TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'User',
    created_by  TEXT NOT NULL DEFAULT 'system',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Serie pomiarowe
CREATE TABLE series (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL UNIQUE,
    min_value   DOUBLE PRECISION NOT NULL,
    max_value   DOUBLE PRECISION NOT NULL,
    color       TEXT NOT NULL DEFAULT '#007bff',
    created_by  TEXT NOT NULL DEFAULT 'system',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_range CHECK (max_value > min_value)
);

-- Pomiary
CREATE TABLE measurements (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    series_id   UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    value       DOUBLE PRECISION NOT NULL,
    timestamp   TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by  TEXT NOT NULL DEFAULT 'system',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indeks dla zapytań po czasie i serii
CREATE INDEX idx_measurements_series_time ON measurements(series_id, timestamp);

-- Dane przykładowe
INSERT INTO users (username, password, role) VALUES ('admin', '$2a$12$XY0Kc0vATrMrVnLTSuOMJuXmFtdDCFCRNH8alsTgEkiOz/Wu/l.Si', 'Admin'), ('user', '$2a$12$Fcfr/dvOLbDyRhh9qsTcN.8eKLBmQbdDjUP5lLQ1J/sukiga6X0mW', 'User');

-- Dwie serie przykładowe
INSERT INTO series (name, min_value, max_value, color) VALUES 
    ('Temperatura', -30, 60, '#FF6B6B'),
    ('Wilgotność', 0, 100, '#4D96FF');

-- Wygeneruj kilka przykładowych pomiarów dla ostatnich 7 dni
DO $$
DECLARE
    s_temp UUID;
    s_hum  UUID;
    d TIMESTAMPTZ := now() - INTERVAL '7 days';
BEGIN
    SELECT id INTO s_temp FROM series WHERE name = 'Temperatura' LIMIT 1;
    SELECT id INTO s_hum  FROM series WHERE name = 'Wilgotność' LIMIT 1;

    WHILE d <= now() LOOP
        INSERT INTO measurements(series_id, value, timestamp)
        VALUES
          (s_temp, (random()*25 + 5)::numeric(5,2), d),
          (s_hum,  (random()*40 + 40)::numeric(5,2), d);
        d := d + INTERVAL '6 hours';
    END LOOP;
END$$;
