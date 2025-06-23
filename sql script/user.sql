CREATE TABLE
    users (
        id UUID PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT,
        phone TEXT,
        address TEXT,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        created_at TIMESTAMP
        WITH
            TIME ZONE DEFAULT NOW ()
    );