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
      ranking: cachedData?.ranking || Number.MAX_SAFE_INTEGER, // Set high ranking for error state
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

// Helper function to render ranking change indicator
const renderRankingChange = (rankingChange) => {
  if (!rankingChange || rankingChange.direction === 'same') return '';
  
  const arrow = rankingChange.direction === 'up' ? '▲' : '▼';
  const colorClass = rankingChange.direction === 'up' ? 'rank-up' : 'rank-down';
  
  return `<div class="ranking-change ${colorClass}" title="Ranking changed by ${rankingChange.value}">${arrow}${rankingChange.value}</div>`;
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
          <div>${data.ranking ? data.ranking.toLocaleString() : 'N/A'}</div>
          ${rankingChangeIndicator}
        </div>
      </div>
    </div>
    <button class="remove-user" data-username="${username}">×</button>
    ${loadingOverlay}
  `;
};

// Add a function to update ranking positions after sorting
const updateRankingPositions = () => {
  userData.forEach((user, index) => {
    if (user.box && user.ranking) {
      // Position is index + 1 for 1-based ranking
      const position = index + 1;
      user.box.setAttribute('data-rank', position.toString());
    }
  });
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
  } else if (sortType === "questions") {
    userData.sort((a, b) => (b.totalSolved || 0) - (a.totalSolved || 0));
  } else { // rating (default)
    userData.sort((a, b) => {
      // Handle cases where ranking might be null/undefined
      const rankingA = a.ranking || Number.MAX_SAFE_INTEGER;
      const rankingB = b.ranking || Number.MAX_SAFE_INTEGER;
      return rankingA - rankingB; // Lower ranking number is better
    });
  }
  
  // Clear container and re-append in sorted order
  statsContainer.innerHTML = "";
  userData.forEach(user => {
    if (user.box) {
      statsContainer.appendChild(user.box);
    }
  });
  
  // Update ranking positions for medal indicators
  updateRankingPositions();
};

const loadUsers = async () => {
  const statsContainer = document.getElementById("user-stats");
  statsContainer.innerHTML = "";
  userData = []; // Reset user data
  
  chrome.storage.local.get(["usernames", "sortedUserData"], async (result) => {
    const usernames = result.usernames || [];
    const sortedUserData = result.sortedUserData || [];
    
    // Create a map of last known order based on stored sorted data
    const lastOrderMap = new Map();
    sortedUserData.forEach((user, index) => {
      lastOrderMap.set(user.username, index);
    });
    
    // Sort usernames based on last known order, then alphabetically for new users
    const orderedUsernames = usernames.sort((a, b) => {
      const orderA = lastOrderMap.get(a) ?? Number.MAX_SAFE_INTEGER;
      const orderB = lastOrderMap.get(b) ?? Number.MAX_SAFE_INTEGER;
      
      if (orderA === orderB) {
        return a.localeCompare(b); // Alphabetical for new users
      }
      return orderA - orderB;
    });
    
    // Create all user boxes immediately with loading states in the correct order
    const fetchPromises = orderedUsernames.map(username => {
      return fetchStats(username); // This already handles parallel loading
    });
    
    // Wait for all users to load in parallel
    await Promise.all(fetchPromises);
    
    // Sort after all users are loaded (will use default rating sort)
    sortUsers();
    
    // Store sorted user data locally for persistence
    const newSortedUserData = userData.map(user => ({
      username: user.username,
      totalSolved: user.totalSolved,
      ranking: user.ranking,
      easySolved: user.easySolved,
      mediumSolved: user.mediumSolved,
      hardSolved: user.hardSolved,
      timestamp: Date.now()
    }));
    
    chrome.storage.local.set({ sortedUserData: newSortedUserData });
  });
};

// Function to load stored user data order on startup
const loadStoredUserOrder = async () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['sortedUserData'], (result) => {
      resolve(result.sortedUserData || []);
    });
  });
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

const addUser = async (username) => {
  // Check if user already exists
  chrome.storage.local.get(["usernames"], (result) => {
    const usernames = result.usernames || [];
    if (usernames.includes(username)) {
      alert("User already added!");
      return;
    }
    
    // Add new user
    usernames.push(username);
    chrome.storage.local.set({ usernames }, () => {
      // Fetch stats for the new user
      fetchStats(username).then(() => {
        // Re-sort after adding new user
        sortUsers();
        
        // Update stored sorted data
        const newSortedUserData = userData.map(user => ({
          username: user.username,
          totalSolved: user.totalSolved,
          ranking: user.ranking,
          easySolved: user.easySolved,
          mediumSolved: user.mediumSolved,
          hardSolved: user.hardSolved,
          timestamp: Date.now()
        }));
        
        chrome.storage.local.set({ sortedUserData: newSortedUserData });
      });
    });
  });
};

const removeUser = (username) => {
  chrome.storage.local.get(["usernames"], (result) => {
    const usernames = result.usernames || [];
    const updatedUsernames = usernames.filter(u => u !== username);
    
    chrome.storage.local.set({ usernames: updatedUsernames }, () => {
      // Remove from userData array
      userData = userData.filter(u => u.username !== username);
      
      // Remove from DOM
      const userBox = document.querySelector(`[data-username="${username}"]`)?.closest('.user-box');
      if (userBox) {
        userBox.remove();
      }
      
      // Update ranking positions
      updateRankingPositions();
      
      // Update stored sorted data
      const newSortedUserData = userData.map(user => ({
        username: user.username,
        totalSolved: user.totalSolved,
        ranking: user.ranking,
        easySolved: user.easySolved,
        mediumSolved: user.mediumSolved,
        hardSolved: user.hardSolved,
        timestamp: Date.now()
      }));
      
      chrome.storage.local.set({ sortedUserData: newSortedUserData });
      
      // Clear cached data for removed user
      chrome.storage.local.remove([`user_${username}`]);
    });
  });
};

const openLeetCodeProfile = (username) => {
  chrome.tabs.create({
    url: `https://leetcode.com/u/${username}/`
  });
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
    document.getElementById('notifications-enabled').checked = result.notificationsEnabled !== false; // Default to true
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
};

const testNotification = () => {
  chrome.runtime.sendMessage({ action: 'testNotification' }, (response) => {
    if (response && response.success) {
      console.log('Test notification sent successfully');
    } else {
      console.error('Failed to send test notification:', response?.error);
    }
  });
};
