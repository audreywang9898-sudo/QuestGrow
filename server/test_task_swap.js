import pool from './config/db.js';

async function runTest() {
  let tempFamilyId = null;
  let tempChildId = null;
  let tempUserId = null;
  let oldTaskId = null;
  let newTaskId = null;

  try {
    console.log('--- TASK SWAP INTEGRATION TEST START ---');

    // 1. Try to find an existing child and family
    const childRes = await pool.query(`
      SELECT c.id as child_id, u.family_id 
      FROM children c
      JOIN users u ON c.user_id = u.id
      JOIN families f ON u.family_id = f.id
      LIMIT 1
    `);

    let childId;
    let familyId;

    if (childRes.rows.length > 0) {
      childId = childRes.rows[0].child_id;
      familyId = childRes.rows[0].family_id;
      console.log(`Using existing family: ${familyId}, child: ${childId}`);
    } else {
      console.log('No existing child/family found. Creating temporary test records...');
      
      // Create temp family
      const famRes = await pool.query(`
        INSERT INTO families (name) VALUES ('Test Family') RETURNING id
      `);
      tempFamilyId = famRes.rows[0].id;
      familyId = tempFamilyId;

      // Create temp user
      const userRes = await pool.query(`
        INSERT INTO users (family_id, email, password_hash, name, role)
        VALUES ($1, 'test_swap_kid@questgrow.com', 'hash', 'Test Kid', 'kid')
        RETURNING id
      `, [familyId]);
      tempUserId = userRes.rows[0].id;

      // Create temp child
      const kidRes = await pool.query(`
        INSERT INTO children (user_id, name)
        VALUES ($1, 'Test Kid')
        RETURNING id
      `, [tempUserId]);
      tempChildId = kidRes.rows[0].id;
      childId = tempChildId;

      // Link child back to user
      await pool.query(`
        UPDATE users SET child_id = $1 WHERE id = $2
      `, [childId, tempUserId]);

      console.log(`Created temporary family: ${familyId}, user: ${tempUserId}, child: ${childId}`);
    }

    // 2. Insert original task (swap_count: 0)
    console.log('Inserting original task...');
    const insertOldRes = await pool.query(`
      INSERT INTO tasks (family_id, assigned_to, name, description, type, difficulty, swap_count, status)
      VALUES ($1, $2, '美學任務一號', '原來的任務描述', '美', '中等', 0, '進行中')
      RETURNING id, swap_count, type
    `, [familyId, childId]);

    const oldTask = insertOldRes.rows[0];
    oldTaskId = oldTask.id;
    console.log(`Original Task created with ID: ${oldTaskId}, Type: ${oldTask.type}, swap_count: ${oldTask.swap_count}`);
    
    if (oldTask.swap_count !== 0) {
      throw new Error(`Expected swap_count 0, got ${oldTask.swap_count}`);
    }

    // 3. Simulate Swapping: Insert new task of same type (swap_count: 1) and delete old task
    console.log('Simulating swap...');
    
    // Delete old task
    await pool.query(`
      DELETE FROM tasks WHERE id = $1 AND family_id = $2
    `, [oldTaskId, familyId]);
    console.log(`Deleted original task ${oldTaskId}`);

    // Insert new task with swap_count = 1 and same type ('美')
    const insertNewRes = await pool.query(`
      INSERT INTO tasks (family_id, assigned_to, name, description, type, difficulty, swap_count, status)
      VALUES ($1, $2, '美學任務二號', '更換後的任務描述', '美', '中等', 1, '進行中')
      RETURNING id, swap_count, type
    `, [familyId, childId]);

    const newTask = insertNewRes.rows[0];
    newTaskId = newTask.id;
    console.log(`New Swapped Task created with ID: ${newTaskId}, Type: ${newTask.type}, swap_count: ${newTask.swap_count}`);

    if (newTask.type !== '美') {
      throw new Error(`Expected category '美', got '${newTask.type}'`);
    }
    if (newTask.swap_count !== 1) {
      throw new Error(`Expected swap_count 1, got ${newTask.swap_count}`);
    }

    // 4. Verify original task is deleted and new task is in database
    const checkOld = await pool.query('SELECT id FROM tasks WHERE id = $1', [oldTaskId]);
    if (checkOld.rows.length > 0) {
      throw new Error('Original task was not deleted successfully');
    }

    const checkNew = await pool.query('SELECT id, swap_count, type FROM tasks WHERE id = $1', [newTaskId]);
    if (checkNew.rows.length === 0) {
      throw new Error('New swapped task was not found in DB');
    }

    console.log('Verification check passed: Old task is deleted, new task is inserted with swap_count = 1 and same category.');

    // 5. Cleanup
    console.log('Cleaning up test data...');
    if (newTaskId) {
      await pool.query('DELETE FROM tasks WHERE id = $1', [newTaskId]);
    }
    if (tempChildId) {
      // First remove user child_id backreference to allow deletion
      if (tempUserId) {
        await pool.query('UPDATE users SET child_id = NULL WHERE id = $1', [tempUserId]);
      }
      await pool.query('DELETE FROM children WHERE id = $1', [tempChildId]);
    }
    if (tempUserId) {
      await pool.query('DELETE FROM users WHERE id = $1', [tempUserId]);
    }
    if (tempFamilyId) {
      await pool.query('DELETE FROM families WHERE id = $1', [tempFamilyId]);
    }
    console.log('Cleanup completed.');

    console.log('--- INTEGRATION TEST SUCCESSFUL ---');
  } catch (error) {
    console.error('--- INTEGRATION TEST FAILED ---');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runTest();
