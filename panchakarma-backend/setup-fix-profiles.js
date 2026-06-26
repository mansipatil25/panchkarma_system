const { pool } = require('./config/database');

(async () => {
  try {
    console.log('🔧 Ensuring patient_profiles table exists...');

    const sql = `
      CREATE TABLE IF NOT EXISTS patient_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        address VARCHAR(255),
        date_of_birth DATE,
        emergency_contact VARCHAR(255),
        medical_history TEXT,
        avatar VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_patient_profiles_user FOREIGN KEY (user_id)
          REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await pool.query(sql);
    console.log('✅ patient_profiles table is present.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create patient_profiles table:', err.message);
    process.exit(1);
  }
})();