```sql
CREATE TABLE structures (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(5) NOT NULL CHECK (postal_code ~ '^[0-9]{5}$'),
  school_vacation_zone CHAR(1) NOT NULL CHECK (school_vacation_zone IN ('A', 'B', 'C')),
  phone VARCHAR(20),
  email VARCHAR(255) CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  manager_name VARCHAR(200),
  manager_email VARCHAR(255) CHECK (manager_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  capacity INTEGER CHECK (capacity > 0),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimisation
CREATE INDEX idx_structures_active ON structures(active);
CREATE INDEX idx_structures_city ON structures(city);
CREATE INDEX idx_structures_zone ON structures(school_vacation_zone);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_structures_updated_at 
  BEFORE UPDATE ON structures 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```