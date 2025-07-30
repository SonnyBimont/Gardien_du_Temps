```sql
USERS (
  #id: INTEGER,
  email: VARCHAR(255) UNIQUE NOT NULL,
  password: VARCHAR(255) NOT NULL,
  first_name: VARCHAR(100) NOT NULL,
  last_name: VARCHAR(100) NOT NULL,
  role: ENUM('admin', 'director', 'animator') NOT NULL,
  structure_id: INTEGER REFERENCES STRUCTURES(id),
  active: BOOLEAN DEFAULT true,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
)

STRUCTURES (
  #id: INTEGER,
  name: VARCHAR(200) NOT NULL,
  address: TEXT NOT NULL,
  city: VARCHAR(100) NOT NULL,
  postal_code: VARCHAR(5) NOT NULL,
  school_vacation_zone: ENUM('A', 'B', 'C') NOT NULL,
  phone: VARCHAR(20),
  email: VARCHAR(255),
  manager_name: VARCHAR(200),
  manager_email: VARCHAR(255),
  capacity: INTEGER,
  active: BOOLEAN DEFAULT true,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
)

TIME_TRACKINGS (
  #id: INTEGER,
  user_id: INTEGER REFERENCES USERS(id) NOT NULL,
  structure_id: INTEGER REFERENCES STRUCTURES(id) NOT NULL,
  date: DATE NOT NULL,
  clock_in: TIME,
  clock_out: TIME,
  break_duration: INTEGER DEFAULT 0,
  total_hours: DECIMAL(4,2),
  status: ENUM('present', 'absent', 'incomplete') DEFAULT 'incomplete',
  notes: TEXT,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP,
  UNIQUE(user_id, date)
)
```