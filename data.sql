-- PostgreSQL schema and sample data for LoanSkill loan management system
DROP TABLE IF EXISTS collections;

DROP TABLE IF EXISTS loans;

DROP TABLE IF EXISTS applications;

DROP TABLE IF EXISTS borrowers;

DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS settings;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  phone VARCHAR(50),
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE borrowers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  phone VARCHAR(50),
  credit_score INTEGER,
  created_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  borrower_id INTEGER REFERENCES borrowers(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (
    amount BETWEEN 46000
    AND 500000
  ),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  credit_score INTEGER,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE loans (
  id SERIAL PRIMARY KEY,
  borrower_id INTEGER REFERENCES borrowers(id) ON DELETE CASCADE,
  application_id INTEGER REFERENCES applications(id) ON DELETE
  SET
    NULL,
    amount INTEGER NOT NULL CHECK (
      amount BETWEEN 46000
      AND 500000
    ),
    interest_amount INTEGER NOT NULL CHECK (interest_amount >= 0),
    repayment_amount INTEGER NOT NULL CHECK (repayment_amount >= amount),
    term_months INTEGER NOT NULL DEFAULT 1 CHECK (term_months = 1),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    loan_type VARCHAR(50) NOT NULL DEFAULT 'Personal',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    due_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days')
);

CREATE TABLE collections (
  id SERIAL PRIMARY KEY,
  loan_id INTEGER REFERENCES loans(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  method VARCHAR(30) NOT NULL DEFAULT 'Online',
  status VARCHAR(20) NOT NULL DEFAULT 'completed'
);

CREATE TABLE settings (
  key VARCHAR(80) PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO
  users (
    name,
    email,
    phone,
    role,
    status,
    joined_date,
    last_login
  )
VALUES
  (
    'John Anderson',
    'john.anderson@email.com',
    '(555) 123-4567',
    'Admin',
    'active',
    '2025-01-15',
    NOW()
  ),
  (
    'Sarah Johnson',
    'sarah.johnson@email.com',
    '(555) 234-5678',
    'Staff',
    'active',
    '2025-02-20',
    NOW()
  ),
  (
    'Michael Chen',
    'michael.chen@email.com',
    '(555) 345-6789',
    'Admin',
    'active',
    '2025-03-10',
    NOW()
  ),
  (
    'Emily Rodriguez',
    'emily.rodriguez@email.com',
    '(555) 456-7890',
    'Staff',
    'inactive',
    '2024-10-05',
    NOW() - INTERVAL '15 days'
  ),
  (
    'David Kim',
    'david.kim@email.com',
    '(555) 567-8901',
    'Viewer',
    'active',
    '2025-04-08',
    NOW() - INTERVAL '1 hour'
  );

INSERT INTO
  borrowers (name, email, phone, credit_score, created_date)
VALUES
  (
    'Jennifer White',
    'jennifer.white@email.com',
    '(555) 234-5678',
    720,
    CURRENT_DATE - INTERVAL '15 days'
  ),
  (
    'Robert Martinez',
    'robert.martinez@email.com',
    '(555) 345-6789',
    680,
    CURRENT_DATE - INTERVAL '18 days'
  ),
  (
    'Amanda Lee',
    'amanda.lee@email.com',
    '(555) 456-7890',
    750,
    CURRENT_DATE - INTERVAL '20 days'
  ),
  (
    'Thomas Brown',
    'thomas.brown@email.com',
    '(555) 567-8901',
    710,
    CURRENT_DATE - INTERVAL '22 days'
  ),
  (
    'Victoria Garcia',
    'victoria.garcia@email.com',
    '(555) 678-9012',
    695,
    CURRENT_DATE - INTERVAL '10 days'
  ),
  (
    'Christopher Davis',
    'chris.davis@email.com',
    '(555) 789-0123',
    760,
    CURRENT_DATE - INTERVAL '8 days'
  );

INSERT INTO
  applications (
    borrower_id,
    amount,
    priority,
    status,
    credit_score,
    submitted_at
  )
VALUES
  (
    1,
    25000,
    'high',
    'pending',
    720,
    NOW() - INTERVAL '1 day'
  ),
  (
    2,
    15000,
    'medium',
    'under_review',
    680,
    NOW() - INTERVAL '2 days'
  ),
  (
    3,
    8500,
    'low',
    'pending',
    750,
    NOW() - INTERVAL '3 days'
  ),
  (
    4,
    45000,
    'high',
    'pending',
    710,
    NOW() - INTERVAL '4 days'
  ),
  (
    5,
    32000,
    'medium',
    'pending',
    695,
    NOW() - INTERVAL '5 days'
  ),
  (
    6,
    12500,
    'low',
    'pending',
    760,
    NOW() - INTERVAL '6 days'
  );

INSERT INTO
  loans (
    borrower_id,
    application_id,
    amount,
    interest_amount,
    repayment_amount,
    loan_type,
    priority,
    status,
    created_at,
    due_date
  )
VALUES
  (
    1,
    1,
    5000,
    425,
    5425,
    'Personal',
    'high',
    'active',
    NOW() - INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '20 days'
  ),
  (
    2,
    2,
    10000,
    725,
    10725,
    'Business',
    'medium',
    'active',
    NOW() - INTERVAL '20 days',
    CURRENT_DATE + INTERVAL '10 days'
  ),
  (
    3,
    3,
    8500,
    680,
    9180,
    'Personal',
    'low',
    'at_risk',
    NOW() - INTERVAL '35 days',
    CURRENT_DATE - INTERVAL '5 days'
  ),
  (
    4,
    4,
    15000,
    975,
    15975,
    'Auto',
    'high',
    'completed',
    NOW() - INTERVAL '400 days',
    CURRENT_DATE - INTERVAL '370 days'
  ),
  (
    5,
    5,
    7200,
    648,
    7848,
    'Personal',
    'medium',
    'default',
    NOW() - INTERVAL '60 days',
    CURRENT_DATE - INTERVAL '30 days'
  ),
  (
    6,
    6,
    12000,
    936,
    12936,
    'Home',
    'low',
    'active',
    NOW() - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '25 days'
  );

INSERT INTO
  collections (loan_id, amount, paid_at, method, status)
VALUES
  (
    1,
    2500,
    NOW() - INTERVAL '5 days',
    'Online',
    'completed'
  ),
  (
    2,
    4200,
    NOW() - INTERVAL '3 days',
    'Bank Transfer',
    'completed'
  ),
  (
    3,
    2500,
    NOW() - INTERVAL '12 days',
    'Cash',
    'pending'
  ),
  (
    4,
    15000,
    NOW() - INTERVAL '365 days',
    'Online',
    'completed'
  ),
  (
    5,
    1500,
    NOW() - INTERVAL '35 days',
    'Phone',
    'pending'
  ),
  (
    6,
    500,
    NOW() - INTERVAL '2 days',
    'Online',
    'completed'
  );

INSERT INTO
  settings (key, value)
VALUES
  ('orgName', 'LoanSkill Financial Services'),
  ('orgEmail', 'admin@loanskill.com'),
  ('supportPhone', '+1 (555) 123-4567'),
  ('timeZone', 'UTC (GMT)'),
  ('currency', 'TZS'),
  ('sessionTimeout', '30 minutes'),
  ('smtpServer', 'smtp.gmail.com'),
  ('smtpPort', '587'),
  ('smtpEmail', 'noreply@loanskill.com'),
  ('require2fa', 'true'),
  ('ipWhitelisting', 'false'),
  ('requireCreditCheck', 'true'),
  ('minimumLoanAmount', '46000'),
  ('maximumLoanAmount', '500000'),
  ('minimumInterest', '6.0'),
  ('maximumInterest', '12.0');