import pool from './config/db.js';

async function check() {
  try {
    console.log('--- RE-CHECK DIAGNOSTICS ---');
    
    // 1. Query questgrow6767@gmail.com
    const userRes = await pool.query(
      "SELECT id, family_id, email, name, role, child_id FROM users WHERE email = $1",
      ['questgrow6767@gmail.com']
    );
    console.log('questgrow6767 User:', userRes.rows[0]);
    
    if (userRes.rows[0]) {
      // 2. Query family users
      const familyUsers = await pool.query(
        "SELECT id, email, name, role, child_id FROM users WHERE family_id = $1",
        [userRes.rows[0].family_id]
      );
      console.log('Family Users:', familyUsers.rows);
      
      // 3. Query family children
      const familyChildren = await pool.query(
        "SELECT id, name, user_id FROM children WHERE user_id IN (SELECT id FROM users WHERE family_id = $1)",
        [userRes.rows[0].family_id]
      );
      console.log('Family Children:', familyChildren.rows);
    }
    
    // 4. Query ggg@questgrow.com
    const gggRes = await pool.query(
      "SELECT id, family_id, email, name, role, child_id FROM users WHERE email = $1",
      ['ggg@questgrow.com']
    );
    console.log('ggg@questgrow.com User:', gggRes.rows[0]);
    
    if (gggRes.rows[0]) {
      const gggChild = await pool.query(
        "SELECT * FROM children WHERE user_id = $1",
        [gggRes.rows[0].id]
      );
      console.log('ggg@questgrow.com Child profile:', gggChild.rows[0]);
    }
    
  } catch (err) {
    console.error('Error during database check:', err);
  } finally {
    await pool.end();
  }
}

check();
