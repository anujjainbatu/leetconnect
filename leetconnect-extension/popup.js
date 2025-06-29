const API_BASE = "https://leetcode-api-faisalshohag.vercel.app";

// Store user data globally for sorting
let userData = [];

// Cache duration in milliseconds (15 minutes)
const CACHE_DURATION = 15 * 60 * 1000;

const fetchStats = async (username, forceRefresh = false) => {
  const box = document.createElement("div");
  box.className = "user-box";
  
  // Check if we should use cached data
  const cachedData = await getCachedUserData(username);
  const shouldUseCachedData = cachedData && !forceRefresh && isCacheValid(cachedData.timestamp);
  
  if (shouldUseCachedData) {
    // Use cached data without making API call
    renderUserBox(box, username, cachedData, false);
    
    // Store user data for sorting
    const userInfo = {
      username,
      totalSolved: cachedData.totalSolved,
      ranking: cachedData.ranking,
      easySolved: cachedData.easySolved,
      totalEasy: cachedData.totalEasy,
      mediumSolved: cachedData.mediumSolved,
      totalMedium: cachedData.totalMedium,
      hardSolved: cachedData.hardSolved,
      totalHard: cachedData.totalHard,
      box
    };
    
    const existingIndex = userData.findIndex(u => u.username === username);
    if (existingIndex >= 0) {
      userData[existingIndex] = userInfo;
    } else {
      userData.push(userInfo);
    }
    
    return box;
  }
  
  // Show cached data immediately if available, then update
  if (cachedData) {
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
    
    // Check if the response is successful
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("USER_NOT_FOUND");
      } else {
        throw new Error("NETWORK_ERROR");
      }
    }
    
    const data = await res.json();

    // Check if the response contains valid user data
    // Fixed the validation logic - was using !data.totalSolved === undefined which is always true
    if (!data || data.error || data.totalSolved === undefined || data.totalSolved === null) {
      throw new Error("USER_NOT_FOUND");
    }

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
    
    // Determine error type and render appropriate message
    const isInvalidUser = err.message === "USER_NOT_FOUND" || 
                         (err.message.includes("Invalid response") && !cachedData);
    
    renderErrorState(box, username, isInvalidUser);
    
    // Store error state for consistency
    const userInfo = {
      username,
      totalSolved: cachedData?.totalSolved || 0,
      ranking: cachedData?.ranking || Number.MAX_SAFE_INTEGER,
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

// Helper function to check if cache is valid
const isCacheValid = (timestamp) => {
  if (!timestamp) return false;
  return (Date.now() - timestamp) < CACHE_DURATION;
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
const renderErrorState = (box, username, isInvalidUser = false) => {
  const errorMessage = isInvalidUser ? "❌ Invalid username" : "⚠️ Error loading data";
  const errorClass = isInvalidUser ? "error-state invalid-user" : "error-state";
  
  box.innerHTML = `
    <div class="username clickable" data-username="${username}" title="Click to visit ${username}'s LeetCode profile">${username}</div>
    <div class="${errorClass}">${errorMessage}</div>
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

const loadUsers = async (forceRefresh = false) => {
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
    
    // Create all user boxes with caching logic
    const fetchPromises = orderedUsernames.map(username => {
      return fetchStats(username, forceRefresh);
    });
    
    // Wait for all users to load
    await Promise.all(fetchPromises);
    
    // Sort after all users are loaded
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

// Refresh all data function
const refreshAllData = async () => {
  const refreshBtn = document.getElementById("refresh-data");
  refreshBtn.classList.add("refreshing");
  refreshBtn.disabled = true;
  
  try {
    await loadUsers(true); // Force refresh
  } finally {
    refreshBtn.classList.remove("refreshing");
    refreshBtn.disabled = false;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  loadUsers(); // Load without forcing refresh on startup
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

  // Add refresh button event listener
  document.getElementById("refresh-data").addEventListener("click", refreshAllData);

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

  // Share functionality event listeners
  document.getElementById("share-extension").addEventListener("click", () => {
    document.getElementById("share-modal").classList.remove("hidden");
  });

  document.getElementById("close-share").addEventListener("click", () => {
    document.getElementById("share-modal").classList.add("hidden");
  });

  // Close modal when clicking outside
  document.getElementById("share-modal").addEventListener("click", (e) => {
    if (e.target.id === "share-modal") {
      document.getElementById("share-modal").classList.add("hidden");
    }
  });

  // Handle share options
  document.querySelectorAll(".share-option").forEach(option => {
    option.addEventListener("click", (e) => {
      const platform = e.currentTarget.dataset.platform;
      handleShare(platform);
    });
  });
});

// Share functionality
const handleShare = (platform) => {
  const shareMessage = "Just found an amazing Chrome extension called LeetConnect! 🔗 It lets you track your friends' LeetCode progress in real-time, get notifications when they solve problems, and stay motivated together. Perfect for coding study groups! Check it out: https://github.com/anujjainbatu/leetconnect";
  
  const encodedMessage = encodeURIComponent(shareMessage);
  const repoUrl = "https://github.com/anujjainbatu/leetconnect";
  
  switch (platform) {
    case 'whatsapp':
      window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
      break;
      
    case 'linkedin':
      const linkedinText = encodeURIComponent("Just found an amazing Chrome extension called LeetConnect! Perfect for coding study groups and tracking LeetCode progress together.");
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(repoUrl)}&summary=${linkedinText}`, '_blank');
      break;
      
    case 'twitter':
      const twitterText = encodeURIComponent("Just found LeetConnect! 🔗 An amazing Chrome extension to track friends' LeetCode progress in real-time. Perfect for coding study groups! #LeetCode #Coding");
      window.open(`https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(repoUrl)}`, '_blank');
      break;
      
    case 'copy':
      navigator.clipboard.writeText(shareMessage).then(() => {
        // Show feedback
        const copyBtn = document.querySelector('[data-platform="copy"]');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span class="share-icon">✅</span>Copied!';
        copyBtn.style.background = 'rgba(0, 184, 163, 0.2)';
        
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.style.background = '';
        }, 2000);
      }).catch(() => {
        // Fallback for older browsers
        alert('Message copied to clipboard:\n\n' + shareMessage);
      });
      break;
  }
  
  // Close modal after sharing
  if (platform !== 'copy') {
    setTimeout(() => {
      document.getElementById("share-modal").classList.add("hidden");
    }, 500);
  }
};

const addUser = async (username) => {
  // Check if user already exists
  chrome.storage.local.get(["usernames"], async (result) => {
    const usernames = result.usernames || [];
    if (usernames.includes(username)) {
      alert("User already added!");
      return;
    }
    
    // First validate the username by fetching stats
    try {
      const res = await fetch(`${API_BASE}/${username}`);
      
      if (!res.ok) {
        if (res.status === 404) {
          // Show error immediately and don't add to database
          showTemporaryError(username, "❌ Invalid username - User not found");
          return;
        } else {
          throw new Error("NETWORK_ERROR");
        }
      }
      
      const data = await res.json();
      
      // Check if the response contains valid user data
      if (!data || data.error || data.totalSolved === undefined || data.totalSolved === null) {
        showTemporaryError(username, "❌ Invalid username - User not found");
        return;
      }
      
      // Only add to database if validation succeeds
      usernames.push(username);
      chrome.storage.local.set({ usernames }, () => {
        // Fetch stats for the new user (we already have the data, so we can use it)
        renderValidatedUser(username, data);
        
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
      
    } catch (error) {
      console.error(`Error validating username ${username}:`, error);
      showTemporaryError(username, "⚠️ Error validating username - Check connection");
    }
  });
};

// Helper function to show temporary error that auto-removes
const showTemporaryError = (username, errorMessage) => {
  const statsContainer = document.getElementById("user-stats");
  const errorBox = document.createElement("div");
  errorBox.className = "user-box error-box";
  
  errorBox.innerHTML = `
    <div class="username">${username}</div>
    <div class="error-state invalid-user">${errorMessage}</div>
  `;
  
  // Add to container
  statsContainer.appendChild(errorBox);
  
  // Auto-remove after 3 seconds with fade effect
  setTimeout(() => {
    errorBox.style.opacity = '0.5';
    errorBox.style.transform = 'translateX(-10px)';
  }, 2000);
  
  setTimeout(() => {
    if (errorBox.parentNode) {
      errorBox.remove();
    }
  }, 3000);
};

// Helper function to render validated user (similar to fetchStats but for already validated data)
const renderValidatedUser = (username, data) => {
  const box = document.createElement("div");
  box.className = "user-box";
  
  const statsContainer = document.getElementById("user-stats");
  statsContainer.appendChild(box);
  
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
    box
  };
  
  userData.push(userInfo);
  
  // Render user box
  renderUserBox(box, username, data, false);
  
  // Cache the data
  cacheUserData(username, data);
  
  // Store stats for comparison in background
  chrome.storage.local.get(['lastStats'], (result) => {
    const lastStats = result.lastStats || {};
    lastStats[username] = data.totalSolved;
    chrome.storage.local.set({ lastStats });
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
