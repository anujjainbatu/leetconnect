const API_BASE = "https://leetcode-api-faisalshohag.vercel.app";

// Update this with each release - IMPORTANT: Change this when you release new versions
const CURRENT_VERSION = "1.2";
const GITHUB_API_URL = "https://api.github.com/repos/anujjainbatu/leetconnect/releases/latest";

// Install event - set default settings
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Extension installed/updated');
  
  // Set default settings
  chrome.storage.local.set({
    autoRefreshEnabled: false,
    autoRefreshInterval: 15, // minutes
    notificationsEnabled: true,
    lastCheckTime: Date.now()
  });

  // Set up initial alarms
  setupAlarms();
});

// Alarm handler for auto-refresh and notifications
chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log('Alarm triggered:', alarm.name);
  
  if (alarm.name === 'autoRefresh') {
    await checkForUpdates();
  } else if (alarm.name === 'dailyReminder') {
    await sendDailyReminder();
  } else if (alarm.name === 'updateCheck') {
    await checkForExtensionUpdate();
  }
});

// Check for updates in friend stats
const checkForUpdates = async () => {
  try {
    const result = await chrome.storage.local.get(['usernames', 'lastStats', 'notificationsEnabled']);
    const usernames = result.usernames || [];
    const lastStats = result.lastStats || {};
    const notificationsEnabled = result.notificationsEnabled;

    console.log('Checking for updates:', { usernames, notificationsEnabled });

    if (!notificationsEnabled || usernames.length === 0) return;

    for (const username of usernames) {
      try {
        const response = await fetch(`${API_BASE}/${username}`);
        const data = await response.json();

        if (data && data.totalSolved) {
          const lastCount = lastStats[username] || 0;
          const currentCount = data.totalSolved;

          // Check if friend submitted new solutions
          if (currentCount > lastCount) {
            const newSolutions = currentCount - lastCount;
            
            // Create notification with error handling
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon128.png',
              title: '🎉 Friend Activity!',
              message: `${username} just solved ${newSolutions} new problem${newSolutions > 1 ? 's' : ''}! Total: ${currentCount}`
            }, (notificationId) => {
              if (chrome.runtime.lastError) {
                console.error('Notification error:', chrome.runtime.lastError);
              } else {
                console.log('Friend activity notification created:', notificationId);
              }
            });
          }

          // Update last stats
          lastStats[username] = currentCount;
        }
      } catch (error) {
        console.error(`Error checking stats for ${username}:`, error);
      }
    }

    // Save updated stats
    chrome.storage.local.set({ lastStats });
  } catch (error) {
    console.error('Error in checkForUpdates:', error);
  }
};

// Send daily reminder notification
const sendDailyReminder = async () => {
  try {
    const result = await chrome.storage.local.get(['notificationsEnabled', 'lastCheckTime']);
    const notificationsEnabled = result.notificationsEnabled;
    const lastCheckTime = result.lastCheckTime || 0;

    console.log('Daily reminder check:', { notificationsEnabled, lastCheckTime });

    if (!notificationsEnabled) return;

    // Check if it's been more than 20 hours since last check (to avoid spam)
    const twentyHoursAgo = Date.now() - (20 * 60 * 60 * 1000);
    if (lastCheckTime > twentyHoursAgo) {
      console.log('Daily reminder too recent, skipping');
      return;
    }

    const messages = [
      "Hey there! No coding today? Time to solve a quick problem! 💪",
      "Your LeetCode is waiting! How about a quick easy problem? 🚀",
      "Daily dose of coding missing! Let's solve something together! 🧠",
      "LeetCode reminder: Even 15 minutes of coding counts! ⏰",
      "Your friends might be ahead! Time to catch up with some coding! 🏃‍♂️"
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '🔔 Coding Reminder',
      message: randomMessage
    }, (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error('Daily reminder notification error:', chrome.runtime.lastError);
      } else {
        console.log('Daily reminder notification created:', notificationId);
      }
    });

    // Update last check time
    chrome.storage.local.set({ lastCheckTime: Date.now() });
  } catch (error) {
    console.error('Error in sendDailyReminder:', error);
  }
};

// Check for extension updates
const checkForExtensionUpdate = async () => {
  try {
    console.log('Checking for extension updates...');
    const response = await fetch(GITHUB_API_URL);
    
    if (!response.ok) {
      console.error('Failed to fetch release info:', response.status);
      return;
    }
    
    const release = await response.json();
    const latestVersion = release.tag_name?.replace('v', '') || '';
    
    console.log('Current version:', CURRENT_VERSION, 'Latest version:', latestVersion);
    
    if (latestVersion && latestVersion !== CURRENT_VERSION) {
      // Check if we've already notified about this version
      const result = await chrome.storage.local.get(['lastNotifiedVersion']);
      const lastNotifiedVersion = result.lastNotifiedVersion || '';
      
      if (latestVersion !== lastNotifiedVersion) {
        // New version available - create notification
        chrome.notifications.create('extension-update', {
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: '🚀 LeetConnect Update Available!',
          message: `Version ${latestVersion} is now available. Click to download from GitHub.`,
          buttons: [
            { title: 'Download Update' },
            { title: 'View Changes' }
          ]
        }, (notificationId) => {
          if (chrome.runtime.lastError) {
            console.error('Update notification error:', chrome.runtime.lastError);
          } else {
            console.log('Update notification created:', notificationId);
          }
        });
        
        // Store the new version info and mark as notified
        chrome.storage.local.set({ 
          latestVersion: latestVersion,
          updateUrl: release.html_url,
          lastNotifiedVersion: latestVersion
        });
      }
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
  }
};

// Set up alarms based on settings
const setupAlarms = async () => {
  try {
    const result = await chrome.storage.local.get(['autoRefreshEnabled', 'autoRefreshInterval', 'notificationsEnabled']);
    
    console.log('Setting up alarms with settings:', result);
    
    // Clear existing alarms
    await chrome.alarms.clearAll();

    // Set up auto-refresh alarm
    if (result.autoRefreshEnabled) {
      chrome.alarms.create('autoRefresh', {
        delayInMinutes: 1,
        periodInMinutes: result.autoRefreshInterval || 15
      });
      console.log('Auto-refresh alarm created');
    }

    // Set up daily reminder alarm
    if (result.notificationsEnabled) {
      chrome.alarms.create('dailyReminder', {
        delayInMinutes: 5,
        periodInMinutes: 1440
      });
      console.log('Daily reminder alarm created');
    }

    // Set up update check alarm (check every 24 hours)
    chrome.alarms.create('updateCheck', {
      delayInMinutes: 60, // Check after 1 hour of installation
      periodInMinutes: 1440 // Check daily
    });
    console.log('Update check alarm created');
  } catch (error) {
    console.error('Error setting up alarms:', error);
  }
};

// Listen for storage changes to update alarms
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && 
      (changes.autoRefreshEnabled || changes.autoRefreshInterval || changes.notificationsEnabled)) {
    console.log('Settings changed, updating alarms');
    setupAlarms();
  }
});

// Handle messages from popup (for test notifications)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  
  if (request.action === 'testNotification') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '🎉 Test Notification',
      message: 'Notifications are working perfectly! You\'ll get updates about your friends\' progress.'
    }, (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error('Test notification error:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        console.log('Test notification created:', notificationId);
        sendResponse({ success: true, notificationId });
      }
    });
    return true; // Keep message channel open for async response
  }
});

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === 'extension-update') {
    // Open GitHub releases page when notification is clicked
    chrome.tabs.create({ url: 'https://github.com/anujjainbatu/leetconnect/releases/latest' });
    chrome.notifications.clear(notificationId);
  }
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (notificationId === 'extension-update') {
    if (buttonIndex === 0) { // Download Update
      chrome.tabs.create({ url: 'https://github.com/anujjainbatu/leetconnect/releases/latest' });
    } else if (buttonIndex === 1) { // View Changes
      chrome.storage.local.get(['updateUrl'], (result) => {
        chrome.tabs.create({ url: result.updateUrl || 'https://github.com/anujjainbatu/leetconnect/releases' });
      });
    }
    chrome.notifications.clear(notificationId);
  }
});

// Initialize when service worker starts
console.log('Background script loaded');