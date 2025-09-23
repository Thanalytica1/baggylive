-- Enable RLS on all tables and create policies for trainer-specific data access

-- Profiles table policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE USING (auth.uid() = id);

-- Clients table policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_select_own" ON clients FOR SELECT USING (auth.uid() = trainer_id);
CREATE POLICY "clients_insert_own" ON clients FOR INSERT WITH CHECK (auth.uid() = trainer_id);
CREATE POLICY "clients_update_own" ON clients FOR UPDATE USING (auth.uid() = trainer_id);
CREATE POLICY "clients_delete_own" ON clients FOR DELETE USING (auth.uid() = trainer_id);

-- Sessions table policies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_select_own" ON sessions FOR SELECT USING (auth.uid() = trainer_id);
CREATE POLICY "sessions_insert_own" ON sessions FOR INSERT WITH CHECK (auth.uid() = trainer_id);
CREATE POLICY "sessions_update_own" ON sessions FOR UPDATE USING (auth.uid() = trainer_id);
CREATE POLICY "sessions_delete_own" ON sessions FOR DELETE USING (auth.uid() = trainer_id);

-- Packages table policies
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "packages_select_own" ON packages FOR SELECT USING (auth.uid() = trainer_id);
CREATE POLICY "packages_insert_own" ON packages FOR INSERT WITH CHECK (auth.uid() = trainer_id);
CREATE POLICY "packages_update_own" ON packages FOR UPDATE USING (auth.uid() = trainer_id);
CREATE POLICY "packages_delete_own" ON packages FOR DELETE USING (auth.uid() = trainer_id);

-- Client packages table policies
ALTER TABLE client_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_packages_select_own" ON client_packages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = client_packages.client_id 
    AND clients.trainer_id = auth.uid()
  )
);

CREATE POLICY "client_packages_insert_own" ON client_packages FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = client_packages.client_id 
    AND clients.trainer_id = auth.uid()
  )
);

CREATE POLICY "client_packages_update_own" ON client_packages FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = client_packages.client_id 
    AND clients.trainer_id = auth.uid()
  )
);

CREATE POLICY "client_packages_delete_own" ON client_packages FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = client_packages.client_id 
    AND clients.trainer_id = auth.uid()
  )
);

-- Payments table policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_select_own" ON payments FOR SELECT USING (auth.uid() = trainer_id);
CREATE POLICY "payments_insert_own" ON payments FOR INSERT WITH CHECK (auth.uid() = trainer_id);
CREATE POLICY "payments_update_own" ON payments FOR UPDATE USING (auth.uid() = trainer_id);
CREATE POLICY "payments_delete_own" ON payments FOR DELETE USING (auth.uid() = trainer_id);

-- Leads table policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_select_own" ON leads FOR SELECT USING (auth.uid() = trainer_id);
CREATE POLICY "leads_insert_own" ON leads FOR INSERT WITH CHECK (auth.uid() = trainer_id);
CREATE POLICY "leads_update_own" ON leads FOR UPDATE USING (auth.uid() = trainer_id);
CREATE POLICY "leads_delete_own" ON leads FOR DELETE USING (auth.uid() = trainer_id);
