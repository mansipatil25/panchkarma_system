USE panchakarma_db;

-- Insert demo users (passwords are hashed for: admin123, doctor123)
-- Hash for 'admin123': $2a$10$7SpZXQ7vqQ7YYVg3pZ5qmOGKJ9H0fR3qE9p7Y7vHqN5YxF5mR5F5m
-- Hash for 'doctor123': $2a$10$7SpZXQ7vqQ7YYVg3pZ5qmOGKJ9H0fR3qE9p7Y7vHqN5YxF5mR5F5m
-- INSERT INTO users (name, email, password, role, phone, specialization, status) VALUES
-- ('Dr. Admin', 'admin@niramay.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin', '+91-9876543210', 'System Administration', '10 years', NULL, NULL, 'active'),
-- ('Dr.Radha Mahale', 'radhamahale09@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor', '+91-9876543271', 'Panchakarma Specialist', 'active');
-- ('Dr. Priya Sharma', 'doctor@niramay.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor', '+91-9876543211', 'Panchakarma Specialist', '8 years', 'BAMS, MD (Ayurveda)', 'Experienced Ayurvedic doctor specializing in Panchakarma treatments and detoxification therapies.', 'active'),
-- ('Dr. Rajesh Kumar', 'doctor2@niramay.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor', '+91-9876543212', 'Ayurvedic Medicine', '12 years', 'BAMS, PhD (Ayurveda)', 'Senior consultant with expertise in traditional Ayurvedic treatments and wellness programs.', 'active')
-- ON DUPLICATE KEY UPDATE name=name;

-- Ensure doctor_profiles rows exist for all doctors (normalized doctor data)
-- INSERT INTO doctor_profiles (user_id, phone, specialization)
-- SELECT id, phone, specialization
-- FROM users
-- WHERE role = 'doctor'
-- ON DUPLICATE KEY UPDATE
--   phone = VALUES(phone),
--   specialization = VALUES(specialization);


-- Add core Panchakarma therapies if missing
INSERT INTO therapies (name, description, duration, price, benefits, procedures, image, category, availability)
SELECT 'Vamana', 'Therapeutic emesis to expel aggravated Kapha dosha from the body', '1 day (procedure 2 to 4 hours)', 4000.00,
  '["Cleanses Kapha", "Improves respiration", "Reduces allergies", "Enhances digestion"]',
  '["Poorva Karma (Snehana & Swedana)", "Medicated emesis", "Samsarjana Krama (diet regimen)"]',
  'https://fazlaninaturesnest.com/wp-content/uploads/2023/10/Vamana-Therapy-1_comprss-768x513-1.jpg', 'Panchakarma', true
WHERE NOT EXISTS (SELECT 1 FROM therapies WHERE name='Vamana');

INSERT INTO therapies (name, description, duration, price, benefits, procedures, image, category, availability)
SELECT 'Virechana', 'Medicated purgation to eliminate aggravated Pitta dosha', '1 day (procedure 2 to 3 hours)', 4500.00,
  '["Liver detox", "Skin purification", "Relieves acidity", "Improves metabolism"]',
  '["Poorva Karma (Snehana & Swedana)", "Medicated purgation", "Samsarjana Krama"]',
  'https://health-e.in/wp-content/uploads/2024/01/vierchana-treatment-in-ayurveda.webp', 'Panchakarma', true
WHERE NOT EXISTS (SELECT 1 FROM therapies WHERE name='Virechana');

INSERT INTO therapies (name, description, duration, price, benefits, procedures, image, category, availability)
SELECT 'Basti', 'Medicated enema therapy effective for Vata disorders', '60 minutes', 3000.00,
  '["Relieves constipation", "Back & joint pain relief", "Nervine strengthening", "Improves mobility"]',
  '["Anuvasana (oil basti)", "Niruha (decoction basti)"]',
  'https://fazlaninaturesnest.com/wp-content/uploads/2023/11/768x318-1-1.webp', 'Panchakarma', true
WHERE NOT EXISTS (SELECT 1 FROM therapies WHERE name='Basti');

INSERT INTO therapies (name, description, duration, price, benefits, procedures, image, category, availability)
SELECT 'Nasya', 'Medicated nasal instillation to cleanse and nourish the head region', '45 minutes', 2000.00,
  '["Relieves sinusitis", "Improves memory", "Reduces headaches", "Enhances clarity of senses"]',
  '["Face & head massage", "Mild steam", "Medicated drops instillation"]',
  'https://th.bing.com/th/id/R.23bb154a6200006f6131b95d480749bc?rik=5IexmHI%2b2EblIQ&riu=http%3a%2f%2fanantamayurveda.com%2fwp-content%2fuploads%2f2023%2f07%2f11-3.jpg&ehk=Cu906u62ZYfFy%2fL8hdw6EMGK8eBePYzhSmY0%2bVQ1xTI%3d&risl=&pid=ImgRaw&r=0', 'Panchakarma', true
WHERE NOT EXISTS (SELECT 1 FROM therapies WHERE name='Nasya');

INSERT INTO therapies (name, description, duration, price, benefits, procedures, image, category, availability)
SELECT 'Raktamokshana', 'Therapeutic bloodletting to eliminate aggravated Rakta (blood) and Pitta', '60 minutes', 5000.00,
  '["Improves skin disorders", "Reduces inflammation", "Relieves varicose veins discomfort", "Detoxifies blood"]',
  '["Pracchana (scarification) / Siravyadha (venesection) as indicated"]',
  'https://www.sgvpholistichospital.org/wp-content/uploads/2025/03/Side-img-copy-5.jpg', 'Panchakarma', true
WHERE NOT EXISTS (SELECT 1 FROM therapies WHERE name='Raktamokshana');

-- Note: Run this file after creating the schema
-- Command: mysql -u root -p panchakarma_db < seed.sql

