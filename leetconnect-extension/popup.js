// const API_BASE = "https://leetcode-api-faisalshohag.vercel.app";

import { API_BASE, JWT, loadToken, saveToken } from "./config.js";


// Initialize JWT from chrome.storage
loadToken();

// ───────────── AUTH FLOW ─────────────
// Google Sign‑in
document.getElementById("google-signin").addEventListener("click", async () => {
  try {
    const idToken = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, token => {
        if (chrome.runtime.lastError || !token) return reject(chrome.runtime.lastError);
        resolve(token);
      });
    });

    const res = await fetch(`${API_BASE}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: idToken })
    });
    const { access_token } = await res.json();
    saveToken(access_token);
    alert("Signed in via Google!");
  } catch (e) {
    console.error(e);
    alert("Google Sign‑In failed.");
  }
});

// Manual Sign‑up / Sign‑in
document.getElementById("manual-signin").addEventListener("click", async () => {
  const email = prompt("Your satiengg.in email:");
  const password = prompt("Your password:");
  const haveAccount = confirm("OK if you already have an account, Cancel to sign up");
  const endpoint = haveAccount ? "/auth/login" : "/auth/signup";
  const payload = { email, password };
  if (!haveAccount) payload.name = prompt("Your full name:");
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const { access_token } = await res.json();
    saveToken(access_token);
    alert(haveAccount ? "Logged in!" : "Signed up!");
  } catch (e) {
    console.error(e);
    alert("Manual auth failed.");
  }
});

// After auth, ask for LeetCode username
document.getElementById("enter-username").addEventListener("click", async () => {
  if (!JWT) return alert("Please sign in first!");
  const lcUser = prompt("Enter your LeetCode username:");
  try {
    await fetch(`${API_BASE}/auth/set-username`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${JWT}`
      },
      body: JSON.stringify({ username: lcUser })
    });
    alert("Username saved! Fetching leaderboard...");
    fetchLeaderboard();
  } catch (e) {
    console.error(e);
    alert("Failed to set username.");
  }
});
// ───────── END AUTH FLOW ─────────


// Store user data globally for sorting
let userData = [];

// Cache duration in milliseconds (15 minutes)
const CACHE_DURATION = 15 * 60 * 1000;

const CURRENT_VERSION = "1.2"; // Keep this in sync with background.js
const GITHUB_API_URL = "https://api.github.com/repos/anujjainbatu/leetconnect/releases/latest";

const SUBMISSION_CALENDAR_CACHE = new Map();
const CALENDAR_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

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

    // Calculate all stat changes if we have previous data
    const statChanges = cachedData ? calculateStatChanges(cachedData, data) : null;

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
      statChanges,
      box
    };

    // Update or add to userData array
    const existingIndex = userData.findIndex(u => u.username === username);
    if (existingIndex >= 0) {
      userData[existingIndex] = userInfo;
    } else {
      userData.push(userInfo);
    }

    // Render updated data with all changes
    renderUserBox(box, username, data, false, statChanges);

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

// Helper function to calculate all stat changes
const calculateStatChanges = (oldData, newData) => {
  if (!oldData || !newData) return null;
  
  const changes = {};
  
  // Calculate ranking change
  if (oldData.ranking && newData.ranking) {
    const rankingChange = oldData.ranking - newData.ranking; // Positive means rank improved
    if (Math.abs(rankingChange) > 0) {
      changes.ranking = {
        value: Math.abs(rankingChange),
        direction: rankingChange > 0 ? 'up' : 'down'
      };
    }
  }
  
  // Calculate problem count changes
  const statKeys = ['totalSolved', 'easySolved', 'mediumSolved', 'hardSolved'];
  statKeys.forEach(key => {
    const oldValue = oldData[key] || 0;
    const newValue = newData[key] || 0;
    const change = newValue - oldValue;
    
    if (change > 0) {
      changes[key] = {
        value: change,
        direction: 'up'
      };
    }
  });
  
  return Object.keys(changes).length > 0 ? changes : null;
};

// Helper function to render ranking change indicator
const renderRankingChange = (rankingChange) => {
  if (!rankingChange || rankingChange.direction === 'same') return '';
  
  const arrow = rankingChange.direction === 'up' ? '▲' : '▼';
  const colorClass = rankingChange.direction === 'up' ? 'rank-up' : 'rank-down';
  
  return `<div class="ranking-change ${colorClass}" title="Ranking changed by ${rankingChange.value}">${arrow}${rankingChange.value}</div>`;
};

// Helper function to render stat change indicator
const renderStatChange = (change, type = 'default') => {
  if (!change) return '';
  
  const arrow = change.direction === 'up' ? '▲' : '▼';
  const colorClass = type === 'ranking' 
    ? (change.direction === 'up' ? 'rank-up' : 'rank-down')
    : 'stat-up'; // All problem count increases are positive
  
  const title = type === 'ranking' 
    ? `Ranking changed by ${change.value}`
    : `+${change.value} new problems solved`;
  
  return `<div class="stat-change ${colorClass}" title="${title}">${arrow}${change.value}</div>`;
};

// Helper function to render user box with data
const renderUserBox = (box, username, data, isLoading = false, statChanges = null) => {
  const loadingOverlay = isLoading ? '<div class="loading-overlay"></div>' : '';
  
  // Get individual change indicators
  const rankingChange = statChanges?.ranking ? renderStatChange(statChanges.ranking, 'ranking') : '';
  const totalChange = statChanges?.totalSolved ? renderStatChange(statChanges.totalSolved, 'total') : '';
  const easyChange = statChanges?.easySolved ? renderStatChange(statChanges.easySolved, 'easy') : '';
  const mediumChange = statChanges?.mediumSolved ? renderStatChange(statChanges.mediumSolved, 'medium') : '';
  const hardChange = statChanges?.hardSolved ? renderStatChange(statChanges.hardSolved, 'hard') : '';

  box.innerHTML = `
    <div class="username clickable" data-username="${username}" title="Click to visit ${username}'s LeetCode profile">${username}</div>
    <div class="stats-container">
      <div class="stat-group">
        <div class="stat-label">Total</div>
        <div class="stat-value total">
          <div>${data.totalSolved}</div>
          ${totalChange}
        </div>
      </div>
      <div class="stat-group">
        <div class="stat-label">Easy</div>
        <div class="stat-value easy">
          <div>${data.easySolved}</div>
          ${easyChange}
        </div>
      </div>
      <div class="stat-group">
        <div class="stat-label">Medium</div>
        <div class="stat-value medium">
          <div>${data.mediumSolved}</div>
          ${mediumChange}
        </div>
      </div>
      <div class="stat-group">
        <div class="stat-label">Hard</div>
        <div class="stat-value hard">
          <div>${data.hardSolved}</div>
          ${hardChange}
        </div>
      </div>
      <div class="stat-group">
        <div class="stat-label">Rating</div>
        <div class="stat-value ranking">
          <div>${data.ranking ? data.ranking.toLocaleString() : 'N/A'}</div>
          ${rankingChange}
        </div>
      </div>
    </div>
    <button class="remove-user" data-username="${username}">×</button>
    ${loadingOverlay}
  `;

  // Add hover event listeners for the chart tooltip
  const usernameElement = box.querySelector('.username');
  let hoverTimeout;

  usernameElement.addEventListener('mouseenter', () => {
    // Add a small delay to prevent tooltip from showing on quick hovers
    hoverTimeout = setTimeout(() => {
      showTooltipChart(username, usernameElement);
    }, 300);
  });

  usernameElement.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimeout);
    hideTooltipChart();
  });
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

// Add this function before your DOMContentLoaded event
const checkForUpdates = async () => {
  try {
    const response = await fetch(GITHUB_API_URL);
    if (!response.ok) return;
    
    const release = await response.json();
    const latestVersion = release.tag_name?.replace('v', '') || '';
    
    if (latestVersion && latestVersion !== CURRENT_VERSION) {
      // Check if user has dismissed this version
      const result = await chrome.storage.local.get(['dismissedVersion']);
      const dismissedVersion = result.dismissedVersion || '';
      
      if (latestVersion !== dismissedVersion) {
        showUpdateBanner(release);
      }
    }
  } catch (error) {
    console.error('Error checking for updates in popup:', error);
  }
};

const showUpdateBanner = (release) => {
  // Remove any existing update banner
  const existingBanner = document.querySelector('.update-banner');
  if (existingBanner) {
    existingBanner.remove();
  }
  
  const updateBanner = document.createElement('div');
  updateBanner.className = 'update-banner';
  updateBanner.innerHTML = `
    <div class="update-content">
      <div class="update-header">
        <strong>🚀 Update Available!</strong>
        <button class="dismiss-update" title="Dismiss this update">×</button>
      </div>
      <p>Version ${release.tag_name} is now available with new features and improvements!</p>
      <div class="update-actions">
        <button class="update-btn">
          <i class="fas fa-download"></i> Download Update
        </button>
        <button class="changelog-btn">
          <i class="fas fa-list"></i> View Changes
        </button>
      </div>
    </div>
  `;
  
  // Add event listeners for all buttons after creating the element
  updateBanner.querySelector('.dismiss-update').addEventListener('click', () => {
    updateBanner.remove();
    // Remember that user dismissed this version
    chrome.storage.local.set({ dismissedVersion: release.tag_name?.replace('v', '') || '' });
  });
  
  // Add event listener for download button
  updateBanner.querySelector('.update-btn').addEventListener('click', () => {
    window.open(release.html_url, '_blank');
  });
  
  // Add event listener for changelog button
  updateBanner.querySelector('.changelog-btn').addEventListener('click', () => {
    window.open(release.html_url, '_blank');
  });
  
  // Insert at the top of the container, after the logo
  const container = document.getElementById('container');
  const logoContainer = container.querySelector('.logo-container');
  container.insertBefore(updateBanner, logoContainer.nextSibling);
};

document.addEventListener("DOMContentLoaded", () => {
  loadUsers(); // Load without forcing refresh on startup
  loadSettings();
  checkForUpdates(); // Add this line to check for updates when popup opens

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
  
  // Add this line for manual update check
  document.getElementById("check-updates").addEventListener("click", manualUpdateCheck);

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

// Add this function
const manualUpdateCheck = async () => {
  const checkBtn = document.getElementById("check-updates");
  const originalText = checkBtn.textContent;
  
  checkBtn.textContent = "Checking...";
  checkBtn.disabled = true;
  
  try {
    const response = await fetch(GITHUB_API_URL);
    if (!response.ok) throw new Error('Failed to fetch');
    
    const release = await response.json();
    const latestVersion = release.tag_name?.replace('v', '') || '';
    
    if (latestVersion && latestVersion !== CURRENT_VERSION) {
      // Clear any dismissed version to force showing the banner
      chrome.storage.local.remove(['dismissedVersion']);
      showUpdateBanner(release);
      checkBtn.textContent = "Update Available!";
      checkBtn.style.background = 'rgba(0, 184, 163, 0.3)';
    } else {
      checkBtn.textContent = "Up to Date ✓";
      checkBtn.style.background = 'rgba(40, 167, 69, 0.3)';
    }
  } catch (error) {
    console.error('Manual update check failed:', error);
    checkBtn.textContent = "Check Failed";
    checkBtn.style.background = 'rgba(220, 53, 69, 0.3)';
  }
  
  setTimeout(() => {
    checkBtn.textContent = originalText;
    checkBtn.style.background = '';
    checkBtn.disabled = false;
  }, 3000);
};

// Helper functions for submission calendar
const fetchSubmissionCalendar = async (username) => {
  try {
    // Check cache first
    const cacheKey = `calendar_${username}`;
    const cached = SUBMISSION_CALENDAR_CACHE.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CALENDAR_CACHE_DURATION) {
      return cached.data;
    }

    const response = await fetch(`${API_BASE}/${username}`);
    if (!response.ok) throw new Error('Failed to fetch calendar data');
    
    const data = await response.json();
    
    // Extract submission calendar data (assuming it's in the API response)
    const submissionCalendar = data.submissionCalendar || {};
    
    // Cache the data
    SUBMISSION_CALENDAR_CACHE.set(cacheKey, {
      data: submissionCalendar,
      timestamp: Date.now()
    });
    
    return submissionCalendar;
  } catch (error) {
    console.error('Error fetching submission calendar:', error);
    return {};
  }
};

const getLast7DaysData = (submissionCalendar) => {
  if (!submissionCalendar || Object.keys(submissionCalendar).length === 0) {
    // Return empty data for 7 days if no calendar data
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        submissions: 0,
        fullDate: date.toLocaleDateString(),
        timestamp: Math.floor(date.getTime() / 1000).toString()
      });
    }
    
    return last7Days;
  }
  
  const last7Days = [];
  const today = new Date();
  
  // Convert all calendar timestamps to Date objects for easier comparison
  const calendarEntries = Object.entries(submissionCalendar).map(([timestamp, count]) => ({
    date: new Date(parseInt(timestamp) * 1000),
    timestamp: timestamp,
    submissions: count
  }));
  
  // Sort by date (most recent first)
  calendarEntries.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);
    targetDate.setHours(0, 0, 0, 0);
    
    // Find the closest entry for this date (within 24 hours)
    const dayStart = new Date(targetDate);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    const matchingEntry = calendarEntries.find(entry => 
      entry.date >= dayStart && entry.date <= dayEnd
    );
    
    last7Days.push({
      date: targetDate.toLocaleDateString('en-US', { weekday: 'short' }),
      submissions: matchingEntry ? matchingEntry.submissions : 0,
      fullDate: targetDate.toLocaleDateString(),
      timestamp: matchingEntry ? matchingEntry.timestamp : Math.floor(targetDate.getTime() / 1000).toString()
    });
  }
  
  return last7Days;
};

const createLineChart = (data) => {
  const width = 256; // Reduced from 368 to fit smaller window
  const height = 60; // Reduced from 80
  const padding = 15; // Reduced from 20
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);
  
  const maxSubmissions = Math.max(...data.map(d => d.submissions), 1);
  const hasData = data.some(d => d.submissions > 0);
  
  // Create SVG
  let svg = `<svg class="chart-svg" viewBox="0 0 ${width} ${height}">`;
  
  // Add grid lines (lighter if no data)
  const gridOpacity = hasData ? 0.1 : 0.05;
  for (let i = 0; i <= 3; i++) { // Reduced grid lines from 4 to 3
    const y = padding + (chartHeight / 3) * i;
    svg += `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" class="chart-grid" style="stroke-opacity: ${gridOpacity}"/>`;
  }
  
  // Create line path
  const points = data.map((d, i) => {
    const x = padding + (chartWidth / (data.length - 1)) * i;
    const y = padding + chartHeight - (d.submissions / maxSubmissions) * chartHeight;
    return `${x},${y}`;
  }).join(' ');
  
  const lineOpacity = hasData ? 1 : 0.3;
  svg += `<polyline points="${points}" class="chart-line" style="stroke-opacity: ${lineOpacity}"/>`;
  
  // Add dots and value labels
  data.forEach((d, i) => {
    const x = padding + (chartWidth / (data.length - 1)) * i;
    const y = padding + chartHeight - (d.submissions / maxSubmissions) * chartHeight;
    const dotOpacity = d.submissions > 0 ? 1 : 0.3;
    const dotRadius = d.submissions > 0 ? 3 : 2; // Smaller dots
    
    // Add dot
    svg += `<circle cx="${x}" cy="${y}" r="${dotRadius}" class="chart-dot" style="fill-opacity: ${dotOpacity}" title="${d.fullDate}: ${d.submissions} submissions"/>`;
    
    // Add value label above dot (only if there are submissions)
    if (d.submissions > 0) {
      const labelY = y - 8; // Reduced spacing from 12 to 8
      svg += `<text x="${x}" y="${labelY}" class="chart-value-label">${d.submissions}</text>`;
    }
  });
  
  // Add day labels
  data.forEach((d, i) => {
    const x = padding + (chartWidth / (data.length - 1)) * i;
    const y = height - 3; // Reduced from 5 to 3
    svg += `<text x="${x}" y="${y}" class="chart-label">${d.date}</text>`;
  });
  
  // Add "No data" indicator if no submissions
  if (!hasData) {
    const centerX = width / 2;
    const centerY = height / 2;
    svg += `<text x="${centerX}" y="${centerY}" class="chart-label" style="text-anchor: middle; font-size: 10px; fill: rgba(255,255,255,0.4)">No recent activity</text>`;
  }
  
  svg += '</svg>';
  
  return svg;
};

const showTooltipChart = async (username, element) => {
  // Remove any existing tooltip
  const existingTooltip = document.querySelector('.tooltip-chart');
  if (existingTooltip) {
    existingTooltip.remove();
  }
  
  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip-chart';
  
  // Show loading state
  tooltip.innerHTML = `
    <h4>${username}'s 7-Day Activity</h4>
    <div class="chart-loading">
      <div class="loader"></div>
      Loading...
    </div>
  `;
  
  document.body.appendChild(tooltip);
  
  // Get positioning relative to the entire user box (not just username)
  const userBox = element.closest('.user-box');
  if (!userBox) return;
  
  const userBoxRect = userBox.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  
  // Center horizontally relative to the user box
  let left = userBoxRect.left + (userBoxRect.width / 2) - (280 / 2); // 280 is tooltip width
  
  // Position vertically - try above the user box first
  let top = userBoxRect.top - tooltipRect.height - 10;
  let isAbove = true;
  
  // If tooltip goes above viewport, position below the user box
  if (top < 10) {
    top = userBoxRect.bottom + 10;
    isAbove = false;
  }
  
  // Ensure tooltip doesn't go off screen horizontally
  const minLeft = 10;
  const maxLeft = window.innerWidth - 290; // 280 width + 10 margin
  
  if (left < minLeft) left = minLeft;
  if (left > maxLeft) left = maxLeft;
  
  // Final check for vertical positioning
  if (!isAbove && top + tooltipRect.height > window.innerHeight - 10) {
    // If it doesn't fit below either, force it above and adjust if needed
    top = Math.max(10, userBoxRect.top - tooltipRect.height - 10);
  }
  
  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
  
  // Make visible
  setTimeout(() => tooltip.classList.add('visible'), 10);
  
  try {
    // Fetch and display chart data
    const submissionCalendar = await fetchSubmissionCalendar(username);
    const last7Days = getLast7DaysData(submissionCalendar);
    
    const totalSubmissions = last7Days.reduce((sum, day) => sum + day.submissions, 0);
    const avgSubmissions = totalSubmissions > 0 ? (totalSubmissions / 7).toFixed(1) : '0.0';
    const maxDay = last7Days.reduce((max, day) => day.submissions > max.submissions ? day : max, last7Days[0]);
    
    const chartSvg = createLineChart(last7Days);
    
    // Show stats in a more compact way (3 columns instead of 4)
    const statsContent = totalSubmissions > 0 ? `
      <div class="chart-stats">
        <div class="chart-stat">
          <span class="chart-stat-value">${totalSubmissions}</span>
          <div>Total</div>
        </div>
        <div class="chart-stat">
          <span class="chart-stat-value">${avgSubmissions}</span>
          <div>Avg/Day</div>
        </div>
        <div class="chart-stat">
          <span class="chart-stat-value">${maxDay.submissions}</span>
          <div>Peak</div>
        </div>
      </div>
    ` : `
      <div class="chart-stats">
        <div class="chart-stat" style="grid-column: 1 / -1; text-align: center; color: rgba(255,255,255,0.6); font-style: italic; font-size: 9px;">
          No submissions in the last 7 days
        </div>
      </div>
    `;
    
    tooltip.innerHTML = `
      <h4>${username}'s 7-Day Activity</h4>
      <div class="chart-container">
        ${chartSvg}
      </div>
      ${statsContent}
    `;
  } catch (error) {
    console.error('Error showing tooltip chart:', error);
    tooltip.innerHTML = `
      <h4>${username}'s Activity</h4>
      <div class="chart-loading">
        ⚠️ Unable to load data
      </div>
    `;
  }
};

const hideTooltipChart = () => {
  const tooltip = document.querySelector('.tooltip-chart');
  if (tooltip) {
    tooltip.classList.remove('visible');
    setTimeout(() => tooltip.remove(), 200);
  }
};
