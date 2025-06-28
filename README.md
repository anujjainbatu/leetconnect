# 🔗 LeetConnect

A Chrome extension that connects you with friends and lets you track LeetCode statistics in real-time. Stay motivated by seeing your friends' progress and get notified when they solve new problems!

![LeetConnect](https://img.shields.io/badge/Chrome-Extension-brightgreen)
![Version](https://img.shields.io/badge/version-1.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 📊 **Real-time Stats Tracking** - View total problems solved, easy/medium/hard breakdowns, and current rankings
- 👥 **Friend Management** - Add and remove LeetCode usernames to track multiple users
- 🔄 **Auto-refresh** - Automatically check for updates at customizable intervals
- 🔔 **Smart Notifications** - Get notified when friends solve new problems
- 📈 **Ranking Changes** - See ranking improvements/drops with visual indicators
- 🎯 **Multiple Sorting Options** - Sort by rating, questions solved, or alphabetically
- 💾 **Data Caching** - Instant loading with cached data while fetching updates
- 🎨 **Beautiful Dark UI** - Modern, responsive design with LeetCode-inspired colors

## 🚀 Installation

### Method 1: Install from Chrome Web Store (Recommended)
*Coming soon - extension will be published to Chrome Web Store*

### Method 2: Install from Source (Developer Mode)

1. **Download the Extension**
   ```bash
   git clone https://github.com/anujjainbatu/leetconnect.git
   cd leetconnect
   ```

2. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Or click the three dots menu → More tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked" button
   - Select the `leetconnect` folder you downloaded
   - The extension should now appear in your extensions list

5. **Pin the Extension (Optional)**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "LeetConnect" and click the pin icon

## 📖 How to Use

### Adding Friends

1. **Open the Extension**
   - Click the LeetConnect icon in your Chrome toolbar

2. **Add a User**
   - Type a LeetCode username in the input field
   - Click "Add User" or press Enter
   - The user's stats will be fetched and displayed

3. **View Stats**
   - See total problems solved, difficulty breakdown, and current ranking
   - Click on any username to visit their LeetCode profile

### Managing Your List

- **Remove Users**: Click the "×" button next to any user
- **Sort Options**: Use the dropdown to sort by:
  - 🏆 Rating (default) - Best to worst ranking
  - 📊 Questions - Most to least problems solved
  - 🔤 Alphabetically - A to Z by username

### Settings & Notifications

1. **Open Settings**
   - Click the gear (⚙️) icon in the extension

2. **Configure Auto-refresh**
   - Enable auto-refresh to automatically check for updates
   - Set refresh interval (5 minutes to 1 hour)

3. **Notification Settings**
   - Enable notifications to get alerts when friends solve problems
   - Test notifications to ensure they're working
   - Get daily coding reminders

## 🔧 Configuration Options

| Setting | Description | Default |
|---------|-------------|---------|
| Auto Refresh | Automatically check for stat updates | Disabled |
| Refresh Interval | How often to check (5min - 1hr) | 15 minutes |
| Notifications | Friend activity and daily reminders | Enabled |

## 🎯 Use Cases

- **Study Groups**: Track progress of your coding study group
- **Competitive Programming**: Monitor team members' contest performance  
- **Workplace Teams**: Keep tabs on colleagues' coding practice
- **Coding Bootcamps**: Compare progress with classmates
- **Personal Motivation**: See friends' activity to stay motivated

## 🛠️ Technical Details

### Built With
- **Manifest V3** - Latest Chrome extension standard
- **Vanilla JavaScript** - No external dependencies
- **Chrome Storage API** - Local data persistence
- **Chrome Notifications API** - Friend activity alerts
- **LeetCode API** - Real-time stats fetching

### Data Sources
- Stats are fetched from: `https://leetcode-api-faisalshohag.vercel.app`
- Data is cached locally for faster loading
- No personal data is collected or transmitted

### Permissions Required
- `storage` - Save your friend list and settings
- `notifications` - Show friend activity alerts
- `activeTab` - Open LeetCode profiles
- `alarms` - Schedule auto-refresh and reminders

## 🐛 Troubleshooting

### Extension Not Loading Stats
1. Check if the username exists on LeetCode
2. Ensure you have internet connection
3. Try refreshing the extension popup

### Notifications Not Working
1. Check Chrome notification permissions
2. Ensure notifications are enabled in extension settings
3. Try the "Test Notification" button

### Performance Issues
1. Remove users you no longer track
2. Increase auto-refresh interval
3. Clear browser cache if needed

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the Repository**
2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make Your Changes**
4. **Commit Your Changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push to the Branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

## 📝 Privacy Policy

This extension:
- ✅ Only accesses public LeetCode profile data
- ✅ Stores data locally on your device
- ✅ Does not collect personal information
- ✅ Does not share data with third parties
- ✅ Works completely offline after initial data fetch

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [LeetCode API by Faisal Shohag](https://github.com/faisalshohag/leetcode-api) for providing the stats endpoint
- LeetCode for creating an amazing platform for coding practice
- The Chrome Extensions community for excellent documentation

## 📞 Support

Having issues? Here's how to get help:

1. **Check the Troubleshooting section** above
2. **Search existing issues** on GitHub
3. **Create a new issue** with detailed information:
   - Chrome version
   - Extension version  
   - Steps to reproduce the problem
   - Screenshots if applicable

---

<div align="center">

**⭐ If you find this extension helpful, please give it a star on GitHub! ⭐**

Made with ❤️ for the coding community

[Report Bug](https://github.com/anujjainbatu/leetconnect/issues) • [Request Feature](https://github.com/anujjainbatu/leetconnect/issues) • [Contribute](https://github.com/anujjainbatu/leetconnect/pulls)

</div>
