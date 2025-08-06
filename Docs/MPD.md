```sql
CREATE TABLE structures (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    postal_code VARCHAR(10),
    city VARCHAR(50),
    school_vacation_zone VARCHAR(10),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) CHECK (role IN ('admin', 'director', 'animator')),
    contract_type VARCHAR(20),
    weekly_hours DECIMAL(4,2),
    annual_hours DECIMAL(6,2),
    contract_start_date DATE,
    contract_end_date DATE,
    active BOOLEAN DEFAULT true,
    structure_id INTEGER REFERENCES structures(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE time_tracking (
    id SERIAL PRIMARY KEY,
    date_time TIMESTAMP NOT NULL,
    tracking_type VARCHAR(20) CHECK (tracking_type IN ('arrival', 'departure', 'break_start', 'break_end')),
    comment TEXT,
    validated BOOLEAN DEFAULT false,
    validated_by INTEGER REFERENCES users(id),
    user_id INTEGER REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE planned_schedules (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    break_start TIME,
    break_end TIME,
    comment TEXT,
    is_template BOOLEAN DEFAULT false,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
    structure_id INTEGER REFERENCES structures(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    estimated_time DECIMAL(5,2),
    start_date DATE,
    due_date DATE,
    status VARCHAR(20) CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    recurrence VARCHAR(20),
    project_id INTEGER REFERENCES projects(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_assignments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    task_id INTEGER REFERENCES tasks(id) NOT NULL,
    time_worked DECIMAL(5,2),
    work_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, task_id, work_date)
);

CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action_type VARCHAR(50) NOT NULL,
    description TEXT,
    ip_address INET,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE school_vacations (
    id SERIAL PRIMARY KEY,
    zone VARCHAR(10) NOT NULL,
    period_name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    school_year VARCHAR(9) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== INDEXES FOR PERFORMANCE =====

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_structure ON users(structure_id);
CREATE INDEX idx_time_tracking_user_date ON time_tracking(user_id, date_time);
CREATE INDEX idx_planned_schedules_user_date ON planned_schedules(user_id, date);
CREATE INDEX idx_task_assignments_user_task ON task_assignments(user_id, task_id);
CREATE INDEX idx_activity_logs_user_date ON activity_logs(user_id, action_date);

-- ===== CONSTRAINTS =====

ALTER TABLE time_tracking 
ADD CONSTRAINT chk_tracking_validated 
CHECK (validated = false OR (validated = true AND validated_by IS NOT NULL));

ALTER TABLE users 
ADD CONSTRAINT chk_contract_dates 
CHECK (contract_end_date IS NULL OR contract_end_date >= contract_start_date);

ALTER TABLE projects 
ADD CONSTRAINT chk_project_dates 
CHECK (end_date IS NULL OR end_date >= start_date);

ALTER TABLE tasks 
ADD CONSTRAINT chk_task_dates 
CHECK (due_date IS NULL OR due_date >= start_date);
```