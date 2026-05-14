-- Enable the native UUID generation function extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Borrowers Table
CREATE TABLE borrowers (
    borrower_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Loan Status Lookup Table
CREATE TABLE loan_statuses (
    status_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status_name VARCHAR(20) UNIQUE NOT NULL
);

-- 4. Loans Table
CREATE TABLE loans (
    loan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    custom_loan_number VARCHAR(20) UNIQUE NOT NULL, -- Keep this for human-readable IDs like '#L001245'
    borrower_id UUID REFERENCES borrowers(borrower_id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    interest_rate NUMERIC(5, 2) NOT NULL CHECK (interest_rate >= 0),
    status_id UUID REFERENCES loan_statuses(status_id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_dates CHECK (due_date >= start_date)
);

-- 5. Payment Status Lookup Table
CREATE TABLE payment_statuses (
    status_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status_name VARCHAR(20) UNIQUE NOT NULL
);

-- 6. Repayment Schedule Table
CREATE TABLE repayment_schedules (
    schedule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID REFERENCES loans(loan_id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    principal_amount NUMERIC(15, 2) NOT NULL CHECK (principal_amount >= 0),
    interest_amount NUMERIC(15, 2) NOT NULL CHECK (interest_amount >= 0),
    status_id UUID REFERENCES payment_statuses(status_id) ON DELETE RESTRICT
);

-- 7. Collections Table
CREATE TABLE collections (
    collection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES repayment_schedules(schedule_id) ON DELETE RESTRICT,
    amount_collected NUMERIC(15, 2) NOT NULL CHECK (amount_collected > 0),
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ⚡ Foreign Key Indexes (Crucial for UUID query speeds)
CREATE INDEX idx_loans_borrower ON loans(borrower_id);
CREATE INDEX idx_loans_status ON loans(status_id);
CREATE INDEX idx_repayment_loan ON repayment_schedules(loan_id);
CREATE INDEX idx_repayment_status ON repayment_schedules(status_id);
CREATE INDEX idx_collections_schedule ON collections(schedule_id);

-- 📆 Date Filters For Dashboard Optimization
CREATE INDEX idx_loans_start_date ON loans(start_date);
CREATE INDEX idx_collections_date ON collections(collected_at);

-- Base lookup values
INSERT INTO loan_statuses (status_name) VALUES ('New'), ('Approved'), ('Rejected'), ('Active'), ('Completed');
INSERT INTO payment_statuses (status_name) VALUES ('Successful'), ('Pending'), ('Overdue'), ('Defaulted');
