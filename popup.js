const API_BASE = "https://leetcode-api-faisalshohag.vercel.app";

// Store user data globally for sorting
let userData = [];

const fetchStats = async (username) => {
  const box = document.createElement("div");
  box.className = "user-box";
  
  // First, try to load cached data
  const cachedData = await getCachedUserData(username);
  
  if (cachedData) {
    // Show cached data immediately
    renderUserBox(box, username, cachedData, true); // true indicates loading state
  } else {
    // Show loading state if no cached data
    box.innerHTML = `
      <div class="username clickable" data-username="${username}">${username}</div>
      <div class="loader"></div>
    `;
  }

  // Add the box to the container immediately
  const statsContainer = document.getElementById("user-stats");
  statsContainer.appendChild(box);

  try {
    const res = await fetch(`${API_BASE}/${username}`);
    const data = await res.json();

    if (!data || !data.totalSolved) throw new Error("Invalid response");

    // Calculate ranking change if we have previous data
    const rankingChange = cachedData ? calculateRankingChange(cachedData.ranking, data.ranking) : null;

    // Store user data for sorting
    const userInfo = {
      username,
      totalSolved: data.totalSolved,
      ranking: data.ranking,
      easySolved: data.easySolved,
      totalEasy: data.totalEasy,
      mediumSolved: data.mediumSolved,
      totalMedium: data.totalMedium,
      hardSolved: data.hardSolved,
      totalHard: data.totalHard,
      rankingChange,
      box
    };

    // Update or add to userData array
    const existingIndex = userData.findIndex(u => u.username === username);
    if (existingIndex >= 0) {
      userData[existingIndex] = userInfo;
    } else {
      userData.push(userInfo);
    }

    // Render updated data
    renderUserBox(box, username, data, false, rankingChange);

    // Cache the new data
    await cacheUserData(username, data);

    // Store stats for comparison in background
    chrome.storage.local.get(['lastStats'], (result) => {
      const lastStats = result.lastStats || {};
      lastStats[username] = data.totalSolved;
      chrome.storage.local.set({ lastStats });
    });

  } catch (err) {
    console.error(err);
    renderErrorState(box, username);
    
    // Store error state for consistency
    const userInfo = {
      username,
      totalSolved: cachedData?.totalSolved || 0,
      error: true,
      box
    };
    
    const existingIndex = userData.findIndex(u => u.username === username);
    if (existingIndex >= 0) {
      userData[existingIndex] = userInfo;
    } else {
      userData.push(userInfo);
    }
  }

  return box;
};

// Helper function to get cached user data
const getCachedUserData = async (username) => {
  return new Promise((resolve) => {
    chrome.storage.local.get([`user_${username}`], (result) => {
      resolve(result[`user_${username}`] || null);
    });
  });
};

// Helper function to cache user data
const cacheUserData = async (username, data) => {
  const cacheData = {
    ...data,
    timestamp: Date.now()
  };
  chrome.storage.local.set({ [`user_${username}`]: cacheData });
};

// Helper function to calculate ranking change
const calculateRankingChange = (oldRanking, newRanking) => {
  if (!oldRanking || !newRanking) return null;
  
  const change = oldRanking - newRanking; // Positive means rank improved (lower number is better)
  return {
    value: Math.abs(change),
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same'
  };
};

// Helper function to render user box with data
const renderUserBox = (box, username, data, isLoading = false, rankingChange = null) => {
  const loadingOverlay = isLoading ? '<div class="loading-overlay"></div>' : '';
  const rankingChangeIndicator = rankingChange ? renderRankingChange(rankingChange) : '';
  
  box.innerHTML = `
    <div class="username clickable" data-username="${username}" title="Click to visit ${username}'s LeetCode profile">${username}</div>
    <div class="stats-container">
      <div class="stat-group">
        <div class="stat-label">Total</div>
        <div class="stat-value total">${data.totalSolved}</div>
      </div>
      <div class="stat-group">
        <div class="stat-label">Easy</div>
        <div class="stat-value easy">${data.easySolved}</div>
      </div>
      <div class="stat-group">
        <div class="stat-label">Medium</div>
        <div class="stat-value medium">${data.mediumSolved}</div>
      </div>
      <div class="stat-group">
        <div class="stat-label">Hard</div>
        <div class="stat-value hard">${data.hardSolved}</div>
      </div>
      <div class="stat-group">
        <div class="stat-label">Rating</div>
        <div class="stat-value ranking">
          ${data.ranking ? data.ranking.toLocaleString() : 'N/A'}
          ${rankingChangeIndicator}
        </div>
      </div>
    </div>
    <button class="remove-user" data-username="${username}">×</button>
    ${loadingOverlay}
  `;
};

// Helper function to render ranking change indicator
const renderRankingChange = (rankingChange) => {
  if (!rankingChange || rankingChange.direction === 'same') return '';
  
  const arrow = rankingChange.direction === 'up' ? '↗️' : '↘️';
  const colorClass = rankingChange.direction === 'up' ? 'rank-up' : 'rank-down';
  
  return `<div class="ranking-change ${colorClass}" title="Ranking changed by ${rankingChange.value}">${arrow}${rankingChange.value}</div>`;
};

// Helper function to render error state
const renderErrorState = (box, username) => {
  box.innerHTML = `
    <div class="username clickable" data-username="${username}" title="Click to visit ${username}'s LeetCode profile">${username}</div>
    <div class="error-state">⚠️ Error loading data</div>
    <button class="remove-user" data-username="${username}">×</button>
  `;
};

const sortUsers = () => {
  const sortType = document.getElementById("sort-select").value;
  const statsContainer = document.getElementById("user-stats");
  
  // Sort userData based on selected option
  if (sortType === "alphabetical") {
    userData.sort((a, b) => a.username.localeCompare(b.username));
  } else { // questions (default)
    userData.sort((a, b) => (b.totalSolved || 0) - (a.totalSolved || 0));
  }
  
  // Clear container and re-append in sorted order
  statsContainer.innerHTML = "";
  userData.forEach(user => {
    if (user.box) {
      statsContainer.appendChild(user.box);
    }
  });
};

const loadUsers = async () => {
  const statsContainer = document.getElementById("user-stats");
  statsContainer.innerHTML = "";
  userData = []; // Reset user data
  
  chrome.storage.local.get(["usernames"], async (result) => {
    const usernames = result.usernames || [];
    
    // Create all user boxes immediately with loading states
    const fetchPromises = usernames.map(username => {
      return fetchStats(username); // This already handles parallel loading
    });
    
    // Wait for all users to load in parallel
    await Promise.all(fetchPromises);
    
    // Sort after all users are loaded
    sortUsers();
  });
};

const addUser = (username) => {
  if (!username) return;
  chrome.storage.local.get(["usernames"], (result) => {
    let usernames = result.usernames || [];
    if (!usernames.includes(username)) {
      usernames.push(username);
      chrome.storage.local.set({ usernames }, () => {
        loadUsers(); // Reload after adding
      });
    }
  });
};

const removeUser = (username) => {
  chrome.storage.local.get(["usernames"], (result) => {
    let usernames = result.usernames || [];
    usernames = usernames.filter((u) => u !== username);
    chrome.storage.local.set({ usernames }, () => {
      // Remove from userData as well
      userData = userData.filter(u => u.username !== username);
      loadUsers(); // Reload after removing
    });
  });
};

// Function to open LeetCode profile
const openLeetCodeProfile = (username) => {
  const profileUrl = `https://leetcode.com/u/${username}/`;
  chrome.tabs.create({ url: profileUrl });
};

// Settings functions
const loadSettings = () => {
  chrome.storage.local.get([
    'autoRefreshEnabled', 
    'autoRefreshInterval', 
    'notificationsEnabled'
  ], (result) => {
    document.getElementById('auto-refresh-enabled').checked = result.autoRefreshEnabled || false;
    document.getElementById('refresh-interval').value = result.autoRefreshInterval || 15;
    document.getElementById('notifications-enabled').checked = result.notificationsEnabled !== false;
    
    // Show/hide interval setting based on auto-refresh state
    toggleIntervalSetting();
  });
};

const saveSettings = () => {
  const autoRefreshEnabled = document.getElementById('auto-refresh-enabled').checked;
  const autoRefreshInterval = parseInt(document.getElementById('refresh-interval').value);
  const notificationsEnabled = document.getElementById('notifications-enabled').checked;

  chrome.storage.local.set({
    autoRefreshEnabled,
    autoRefreshInterval,
    notificationsEnabled
  });

  // Show/hide interval setting
  toggleIntervalSetting();
};

const toggleIntervalSetting = () => {
  const autoRefreshEnabled = document.getElementById('auto-refresh-enabled').checked;
  const intervalSetting = document.getElementById('refresh-interval-setting');
  intervalSetting.style.display = autoRefreshEnabled ? 'block' : 'none';
};

const testNotification = () => {
  console.log("Test notification button clicked");
  
  // Send message to background script to create notification
  chrome.runtime.sendMessage(
    { action: 'testNotification' },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error("Runtime error:", chrome.runtime.lastError);
      } else if (response && response.success) {
        console.log("Test notification sent successfully:", response.notificationId);
      } else {
        console.error("Test notification failed:", response?.error);
      }
    }
  );
};

document.addEventListener("DOMContentLoaded", () => {
  loadUsers();
  loadSettings();

  // Main functionality event listeners
  document.getElementById("add-user").addEventListener("click", () => {
    const input = document.getElementById("username");
    const username = input.value.trim();
    if (username) {
      addUser(username);
      input.value = "";
    }
  });

  document.getElementById("user-stats").addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-user")) {
      const username = e.target.getAttribute("data-username");
      removeUser(username);
    } else if (e.target.classList.contains("clickable")) {
      // Handle username click to open LeetCode profile
      const username = e.target.getAttribute("data-username");
      if (username) {
        openLeetCodeProfile(username);
      }
    }
  });

  document.getElementById("sort-select").addEventListener("change", sortUsers);

  // Settings event listeners
  document.getElementById("settings-toggle").addEventListener("click", () => {
    const panel = document.getElementById("settings-panel");
    panel.classList.toggle("hidden");
  });

  document.getElementById("auto-refresh-enabled").addEventListener("change", saveSettings);
  document.getElementById("refresh-interval").addEventListener("change", saveSettings);
  document.getElementById("notifications-enabled").addEventListener("change", saveSettings);
  document.getElementById("test-notification").addEventListener("click", testNotification);

  // Allow Enter key to add user
  document.getElementById("username").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const username = e.target.value.trim();
      if (username) {
        addUser(username);
        e.target.value = "";
      }
    }
  });
});
