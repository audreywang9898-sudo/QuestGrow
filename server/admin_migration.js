import bcrypt from 'bcryptjs';
import pool from './config/db.js';

async function run() {
  console.log('Starting Admin Role migration...');
  try {
    // 1. Drop existing role check constraint and add updated check constraint (parent, kid, admin)
    console.log('Updating users role check constraint...');
    
    // Find constraint name (usually users_role_check, but let's drop users_role_check and run alter)
    await pool.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    await pool.query("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('parent', 'kid', 'admin'))");
    console.log('Constraint updated successfully.');

    // 2. Hash password for admin if needed
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('password123', salt);
    const email = 'audreywang9898@gmail.com';

    // 3. Check if user already exists
    const checkUser = await pool.query('SELECT id, role FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      console.log(`User ${email} already exists. Updating role to admin...`);
      await pool.query("UPDATE users SET role = 'admin' WHERE email = $1", [email]);
      console.log('User role updated to admin.');
    } else {
      console.log(`User ${email} does not exist. Creating family and admin user...`);
      // Start transaction
      await pool.query('BEGIN');
      
      const newFamily = await pool.query("INSERT INTO families (name) VALUES ('管理員家庭') RETURNING id");
      const familyId = newFamily.rows[0].id;

      await pool.query(
        `INSERT INTO users (family_id, email, password_hash, name, role, avatar) 
         VALUES ($1, $2, $3, 'Audrey (Admin)', 'admin', 'girl')`,
        [familyId, email, passwordHash]
      );
      
      await pool.query('COMMIT');
      console.log('Admin user and family created successfully. Password is password123');
    }
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
    console.log('Database pool closed.');
  }
}

run();
