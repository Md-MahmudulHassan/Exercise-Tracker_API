const apiBase = '/api';

// Create user
document.getElementById('createUserBtn').onclick = async () => {
  const username = document.getElementById('newUsername').value.trim();
  const result = document.getElementById('createUserResult');
  result.textContent = '';
  if (!username) {
    result.textContent = 'Username is required.';
    return;
  }
  try {
    const res = await fetch(`${apiBase}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create user');
    result.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    result.textContent = e.message;
  }
};

// List users
document.getElementById('listUsersBtn').onclick = async () => {
  const result = document.getElementById('listUsersResult');
  result.textContent = 'Loading...';
  try {
    const res = await fetch(`${apiBase}/users`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load users');
    if (data.length === 0) {
      result.textContent = 'No users found.';
      return;
    }
    result.textContent = data.map(u => `${u.username} (${u._id})`).join('\n');
  } catch (e) {
    result.textContent = e.message;
  }
};

// Add exercise
document.getElementById('addExerciseBtn').onclick = async () => {
  const userId = document.getElementById('exerciseUserId').value.trim();
  const description = document.getElementById('exerciseDescription').value.trim();
  const duration = document.getElementById('exerciseDuration').value.trim();
  const date = document.getElementById('exerciseDate').value;

  const result = document.getElementById('addExerciseResult');
  result.textContent = '';

  if (!userId || !description || !duration) {
    result.textContent = 'User ID, description, and duration are required.';
    return;
  }

  try {
    const body = new URLSearchParams();
    body.append('description', description);
    body.append('duration', duration);
    if (date) body.append('date', date);

    const res = await fetch(`${apiBase}/users/${userId}/exercises`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add exercise');
    result.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    result.textContent = e.message;
  }
};

// Get logs
document.getElementById('getLogsBtn').onclick = async () => {
  const userId = document.getElementById('logUserId').value.trim();
  const from = document.getElementById('logFrom').value;
  const to = document.getElementById('logTo').value;
  const limit = document.getElementById('logLimit').value;

  const result = document.getElementById('getLogsResult');
  result.textContent = '';

  if (!userId) {
    result.textContent = 'User ID is required.';
    return;
  }

  try {
    let query = [];
    if (from) query.push(`from=${encodeURIComponent(from)}`);
    if (to) query.push(`to=${encodeURIComponent(to)}`);
    if (limit) query.push(`limit=${encodeURIComponent(limit)}`);
    const queryString = query.length > 0 ? '?' + query.join('&') : '';

    const res = await fetch(`${apiBase}/users/${userId}/logs${queryString}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to get logs');
    result.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    result.textContent = e.message;
  }
};
