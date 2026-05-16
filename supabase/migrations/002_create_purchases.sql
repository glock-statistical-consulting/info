CREATE TABLE purchases (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  product_key TEXT NOT NULL,
  stripe_session_id TEXT,
  stripe_customer_id TEXT,
  customer_email TEXT,
  customer_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  amount_total BIGINT
);

CREATE TABLE user_access (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  email TEXT NOT NULL,
  product_key TEXT NOT NULL,
  stripe_session_id TEXT,
  granted BOOLEAN DEFAULT TRUE,
  UNIQUE(email, product_key)
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert purchases"
  ON purchases FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can insert user_access"
  ON user_access FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Only authenticated can select purchases"
  ON purchases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only authenticated can select user_access"
  ON user_access FOR SELECT
  TO authenticated
  USING (true);
