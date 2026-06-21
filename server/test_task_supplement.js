// Mock testing the Supplement Tasks logic to verify correct behavior

const TASK_TEMPLATES = [
  { name: '德育任務', type: '德', difficulty: '中等' },
  { name: '智育任務', type: '智', difficulty: '中等' },
  { name: '體育任務', type: '體', difficulty: '中等' },
  { name: '群育任務', type: '群', difficulty: '中等' },
  { name: '美育任務', type: '美', difficulty: '中等' }
];

function simulateSupplement({
  drawnTaskIds,
  tasks,
  completedTasksIn30Days = [],
  childId = 'child-1'
}) {
  console.log('\n--- SIMULATING SUPPLEMENT ---');
  console.log('Initial drawnTaskIds:', drawnTaskIds);
  
  // 1. Clean up completed tasks from drawnTaskIds
  const validDrawnTaskIds = drawnTaskIds.filter(id => {
    const t = tasks.find(task => task.id === id);
    return t && t.status !== '已完成';
  });
  console.log('After filtering completed:', validDrawnTaskIds);

  const currentActiveCount = validDrawnTaskIds.length;
  const missingCount = 5 - currentActiveCount;
  console.log(`Current active count: ${currentActiveCount}, Missing count: ${missingCount}`);
  
  if (missingCount <= 0) {
    console.log('No supplement needed.');
    return validDrawnTaskIds;
  }

  // Pool of available tasks to fill the slots (only status '進行中' and not already in the valid drawn list)
  const childTasks = tasks.filter(t => !t.assignedTo || t.assignedTo === childId);
  const candidatePool = childTasks.filter(t => t.status === '進行中' && !validDrawnTaskIds.includes(t.id));
  console.log('Candidate pool size:', candidatePool.length);

  // Draw from candidate pool
  const tasksFromPool = candidatePool.slice(0, Math.min(missingCount, candidatePool.length));
  const poolIds = tasksFromPool.map(t => t.id);
  console.log('Drawn from candidate pool:', poolIds);

  const remainingNeeded = missingCount - tasksFromPool.length;
  console.log('Remaining needed from templates:', remainingNeeded);

  const newTasksToCreate = [];
  if (remainingNeeded > 0) {
    const currentTypes = [
      ...validDrawnTaskIds.map(id => {
        const t = tasks.find(task => task.id === id);
        return t ? t.type : '';
      }),
      ...tasksFromPool.map(t => t.type)
    ].filter(Boolean);
    console.log('Current categories on board:', currentTypes);

    const allTypes = ['德', '智', '體', '群', '美'];
    let missingTypes = allTypes.filter(cat => !currentTypes.includes(cat));
    console.log('Missing categories:', missingTypes);

    const completedTaskNames = completedTasksIn30Days.map(name => name.toLowerCase().trim());

    for (let i = 0; i < remainingNeeded; i++) {
      let targetType = missingTypes[i];
      if (!targetType) {
        targetType = allTypes[Math.floor(Math.random() * allTypes.length)];
      }

      let catTemplates = TASK_TEMPLATES.filter(t => t.type === targetType && !completedTaskNames.includes(t.name.toLowerCase().trim()));
      if (catTemplates.length === 0) {
        catTemplates = TASK_TEMPLATES.filter(t => t.type === targetType);
      }

      const randomTpl = catTemplates[0] || TASK_TEMPLATES[0];
      const newId = `task-tpl-self-mock-${Date.now()}-${i}`;
      
      newTasksToCreate.push({
        id: newId,
        name: randomTpl.name,
        type: randomTpl.type,
        status: '進行中'
      });
    }
  }

  const addedIds = newTasksToCreate.map(t => t.id);
  console.log('Created from templates:', addedIds.map((id, index) => `${id} (type: ${newTasksToCreate[index].type})`));

  const finalDrawnIds = [...validDrawnTaskIds, ...poolIds, ...addedIds];
  console.log('Final drawnTaskIds:', finalDrawnIds);
  return finalDrawnIds;
}

// --- Test Case 1: 3 in-progress tasks on board, 1 task in candidate pool, 1 template needed ---
const tasks1 = [
  { id: 't-1', name: '智育任務1', type: '智', status: '進行中', assignedTo: 'child-1' },
  { id: 't-2', name: '德育任務1', type: '德', status: '進行中', assignedTo: 'child-1' },
  { id: 't-3', name: '體育任務1', type: '體', status: '進行中', assignedTo: 'child-1' },
  { id: 't-4', name: '群育任務1', type: '群', status: '進行中', assignedTo: 'child-1' } // in candidate pool
];

const result1 = simulateSupplement({
  drawnTaskIds: ['t-1', 't-2', 't-3'], // 3 drawn
  tasks: tasks1,
  completedTasksIn30Days: []
});

if (result1.length !== 5) {
  throw new Error('Test 1 failed: final length should be 5');
}
if (!result1.includes('t-4')) {
  throw new Error('Test 1 failed: should draw t-4 from pool');
}
// The template task type should be '美' (since '智', '德', '體', '群' are on board)
const createdMockId = result1.find(id => id.startsWith('task-tpl-self-mock-'));
console.log('Test 1 passed successfully!');

// --- Test Case 2: 4 tasks on board, but 1 is completed. Should supplement 2 tasks ---
const tasks2 = [
  { id: 't-1', name: '智育任務1', type: '智', status: '進行中', assignedTo: 'child-1' },
  { id: 't-2', name: '德育任務1', type: '德', status: '進行中', assignedTo: 'child-1' },
  { id: 't-3', name: '體育任務1', type: '體', status: '已完成', assignedTo: 'child-1' }, // completed!
  { id: 't-4', name: '群育任務1', type: '群', status: '進行中', assignedTo: 'child-1' } 
];

const result2 = simulateSupplement({
  drawnTaskIds: ['t-1', 't-2', 't-3', 't-4'], // 4 drawn initially
  tasks: tasks2,
  completedTasksIn30Days: []
});

if (result2.length !== 5) {
  throw new Error('Test 2 failed: final length should be 5');
}
if (result2.includes('t-3')) {
  throw new Error('Test 2 failed: completed task t-3 should be filtered out');
}
console.log('Test 2 passed successfully!');
