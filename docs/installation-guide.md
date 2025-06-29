# 🔗 LeetConnect Installation Guide

Welcome to the LeetConnect installation guide! This document will walk you through the process of installing and setting up the LeetConnect Chrome extension on your browser.

## 📋 Table of Contents

- [System Requirements](#system-requirements)
- [Installation Methods](#installation-methods)
- [Method 1: Chrome Web Store (Coming Soon)](#method-1-chrome-web-store-coming-soon)
- [Method 2: Manual Installation (Developer Mode)](#method-2-manual-installation-developer-mode)
- [Post-Installation Setup](#post-installation-setup)
- [Verification & Testing](#verification--testing)
- [Updating the Extension](#updating-the-extension)
- [Troubleshooting Installation Issues](#troubleshooting-installation-issues)
- [Uninstalling LeetConnect](#uninstalling-leetconnect)

## 💻 System Requirements

### Browser Compatibility
- **Google Chrome** version 88 or higher
- **Chromium-based browsers** (Edge, Brave, Opera) with Manifest V3 support

### Operating System
- **Windows** 10 or higher
- **macOS** 10.14 or higher
- **Linux** (any modern distribution)

### Network Requirements
- Active internet connection for fetching LeetCode statistics
- Access to `https://leetcode-api-faisalshohag.vercel.app` (our data source)
- Access to `https://leetcode.com` for profile links

### Permissions Required
The extension requires the following Chrome permissions:
- **Storage** - Save your friend list and settings locally
- **Notifications** - Show friend activity alerts
- **ActiveTab** - Open LeetCode profiles when clicked
- **Alarms** - Schedule auto-refresh and reminders

## 🚀 Installation Methods

There are two ways to install LeetConnect:

1. **Chrome Web Store** (Recommended, coming soon)
2. **Manual Installation** (Available now for developers and early adopters)

## 🏪 Method 1: Chrome Web Store (Coming Soon)

*The extension will be published to the Chrome Web Store for easy installation.*

### When Available:
1. Visit the Chrome Web Store
2. Search for "LeetConnect"
3. Click "Add to Chrome"
4. Confirm the installation
5. The extension will appear in your toolbar

---

## 🛠️ Method 2: Manual Installation (Developer Mode)

### Step 1: Download the Extension Files

#### Option A: Download from GitHub (Recommended)
1. Visit the [LeetConnect GitHub repository](https://github.com/anujjainbatu/leetconnect)
2. Click the green **"Code"** button
3. Select **"Download ZIP"**
4. Extract the ZIP file to a location you'll remember (e.g., `Desktop/leetconnect`)

#### Option B: Clone with Git
```bash
git clone https://github.com/anujjainbatu/leetconnect.git
cd leetconnect
```

### Step 2: Open Chrome Extensions Page

1. **Open Google Chrome**
2. **Navigate to Extensions Page** using one of these methods:
   - Type `chrome://extensions/` in the address bar
   - Click the three dots menu (⋮) → **More tools** → **Extensions**
   - Use keyboard shortcut: `Ctrl+Shift+Delete` then click **Extensions**

### Step 3: Enable Developer Mode

<div align="center">

![Developer Mode Toggle](../assets-landing/screenshots/installation.gif)

</div>

1. Look for the **"Developer mode"** toggle in the top-right corner
2. **Click the toggle** to enable Developer mode
3. You should see new buttons appear: "Load unpacked", "Pack extension", "Update"

### Step 4: Load the Extension

1. **Click "Load unpacked"** button
2. **Navigate to the extracted folder**
3. **⚠️ Important**: Select the `leetconnect-extension` folder (NOT the root `leetconnect` folder)
4. **Click "Select Folder"** or **"Open"**

### Step 5: Verify Installation

After loading, you should see:
- LeetConnect appears in your extensions list
- Extension ID and version information
- Status showing "On" with a toggle switch

### Step 6: Pin the Extension (Recommended)

1. **Click the puzzle piece icon** (🧩) in your Chrome toolbar
2. **Find "LeetConnect"** in the dropdown
3. **Click the pin icon** (📌) next to LeetConnect
4. The LeetConnect icon should now appear directly in your toolbar

## ✅ Post-Installation Setup

### First Launch

1. **Click the LeetConnect icon** in your Chrome toolbar
2. You should see the welcome interface with:
   - LeetConnect logo
   - "Enter LeetCode Username" input field
   - Empty area ready for friend stats

### Grant Permissions

Chrome may prompt you to grant permissions:
- **Storage**: Required for saving your friends list
- **Notifications**: Optional, for friend activity alerts
- **ActiveTab**: For opening LeetCode profiles

**Click "Allow" or "Grant"** for each permission request.

### Configure Settings (Optional)

1. **Add Your First Friend**:
   - Enter a valid LeetCode username
   - Click "Add User" or press Enter
   - Wait for their stats to load

2. **Configure Notifications** (if desired):
   - Access settings within the extension
   - Enable friend activity alerts
   - Set refresh intervals

## 🔍 Verification & Testing

### Test Basic Functionality

1. **Add a Test User**:
   - Try adding `anujjainbatu` (the developer's username)
   - Stats should load within a few seconds

2. **Check Interface Elements**:
   - ✅ Username displays correctly
   - ✅ Problem count shows (Easy, Medium, Hard)
   - ✅ Ranking information appears
   - ✅ Click username opens LeetCode profile

3. **Test Controls**:
   - ✅ Sort options work (Rating, Questions, Alphabetical)
   - ✅ Refresh button updates data
   - ✅ Remove user (×) button functions

### Test Notifications (If Enabled)

1. **Grant notification permissions** when prompted
2. **Use test notification button** in settings
3. **Verify notifications appear** in your system

### Common Success Indicators

- ✅ Extension icon appears in toolbar
- ✅ Popup opens when icon is clicked
- ✅ Users can be added successfully
- ✅ LeetCode stats load correctly
- ✅ No error messages in console

## 🔄 Updating the Extension

### For Manual Installations

When a new version is released:

1. **Download the latest version** from GitHub
2. **Extract to the same location** (overwrite old files)
3. **Go to chrome://extensions/**
4. **Find LeetConnect** in your extensions list
5. **Click the refresh icon** (🔄) on the LeetConnect card
6. **Verify the new version number**

### Automatic Updates (Chrome Web Store)

Once published to Chrome Web Store:
- Updates will install automatically
- Chrome will notify you of available updates
- No manual action required

## 🔧 Troubleshooting Installation Issues

### Extension Not Loading

**Problem**: "Load unpacked" fails or extension doesn't appear

**Solutions**:
1. **Check folder selection**: Ensure you selected `leetconnect-extension` folder, not root folder
2. **Verify file structure**: The folder should contain `manifest.json`
3. **Check permissions**: Ensure you have read access to the folder
4. **Restart Chrome**: Close and reopen Chrome, then try again

### Developer Mode Issues

**Problem**: Can't enable Developer mode

**Solutions**:
1. **Check Chrome version**: Update to latest version
2. **Admin restrictions**: Contact IT admin if on managed devices
3. **Profile issues**: Try with a different Chrome profile
4. **Policy restrictions**: Check if organization policies block developer mode

### Permission Errors

**Problem**: Extension requests unexpected permissions

**Solutions**:
1. **Verify source**: Only install from official GitHub repository
2. **Check manifest.json**: Review required permissions
3. **Contact support**: Email anujjainbatu@gmail.com if suspicious

### Loading Errors

**Problem**: Extension loads but shows errors

**Solutions**:
1. **Check Chrome console**: Press F12 → Console tab for error details
2. **Clear cache**: Clear browser cache and reload extension
3. **Check network**: Ensure internet connection for API access
4. **Disable other extensions**: Check for conflicts

### Installation on Different Browsers

#### Microsoft Edge
1. Go to `edge://extensions/`
2. Enable "Developer mode"
3. Follow same steps as Chrome

#### Brave Browser
1. Go to `brave://extensions/`
2. Enable "Developer mode"
3. Follow same steps as Chrome

#### Opera
1. Go to `opera://extensions/`
2. Enable "Developer mode"
3. Follow same steps as Chrome

## 🗑️ Uninstalling LeetConnect

### Complete Removal

1. **Go to chrome://extensions/**
2. **Find LeetConnect** in the list
3. **Click "Remove"**
4. **Confirm removal** in the popup
5. **Clear stored data** (optional):
   - Go to `chrome://settings/content/all`
   - Search for "LeetConnect"
   - Delete any stored data

### Keeping Data for Reinstall

If you want to reinstall later:
- Extension data is stored locally
- Removing extension keeps your friends list
- Reinstalling will restore your previous setup

## 🆘 Getting Installation Help

### Support Channels

If you encounter issues during installation:

1. **📝 Quick Feedback**: [Submit feedback form](https://forms.gle/tsSvgUKQnUtYiF8d9)
2. **📧 Email Support**: anujjainbatu@gmail.com
3. **🐛 Bug Reports**: [GitHub Issues](https://github.com/anujjainbatu/leetconnect/issues)
4. **💬 Community**: [GitHub Discussions](https://github.com/anujjainbatu/leetconnect/discussions)

### Information to Include in Support Requests

When seeking help, please provide:
- **Chrome version**: `chrome://version/`
- **Operating system**: Windows/Mac/Linux version
- **Error messages**: Exact text of any errors
- **Steps taken**: What you tried before contacting support
- **Screenshots**: If applicable

## 📚 What's Next?

After successful installation:

1. **📖 Read the User Guide**: Check out [user-guide.md](user-guide.md) for detailed usage instructions
2. **👥 Add Friends**: Start tracking your coding friends' progress
3. **⚙️ Configure Settings**: Set up notifications and auto-refresh
4. **🤝 Share with Friends**: Help them install LeetConnect too!

---

## 🎉 Congratulations!

You've successfully installed LeetConnect! Start tracking your friends' LeetCode progress and stay motivated in your coding journey.

**Need help getting started?** Check out our [User Guide](user-guide.md) for detailed usage instructions.

**Enjoying LeetConnect?** Consider:
- ⭐ [Starring the project on GitHub](https://github.com/anujjainbatu/leetconnect)
- 📝 [Sharing feedback](https://forms.gle/tsSvgUKQnUtYiF8d9)
- 🤝 [Contributing to the project](contributing.md)

---

*Made with ❤️ for the coding community*

[🐛 Report Installation Issues](https://github.com/anujjainbatu/leetconnect/issues) • [✨ Request Features](https://github.com/anujjainbatu/leetconnect/issues) • [🤝 Contribute](https://github.com/anujjainbatu/leetconnect/pulls) • [📝 Feedback](https://forms.gle/tsSvgUKQnUtYiF8d9)