# 🔗 LeetConnect

A Chrome extension that connects you with friends and lets you track LeetCode statistics in real-time. Stay motivated by seeing your friends' progress and get notified when they solve new problems!

![LeetConnect](https://img.shields.io/badge/Chrome-Extension-brightgreen)
![Version](https://img.shields.io/badge/version-1.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📂 Project Structure

```
leetconnect/
├── index.html                     # Landing page
├── README.md                      # This file
│
├── leetconnect-extension/         # Chrome Extension Files
│   ├── background.js              # Background service worker
│   ├── manifest.json              # Extension manifest
│   ├── popup.css                  # Extension UI styles
│   ├── popup.html                 # Extension popup HTML
│   ├── popup.js                   # Extension popup logic
│   ├── assets/                    # Extension assets
│   └── icons/                     # Extension icons
│
├── docs/                          # Documentation
├── assets-landing/                # Landing page assets
└── scripts/                       # Build and deployment scripts
```

## 📸 Demo

<div align="center">

![LeetConnect Demo GIF](assets-landing/screenshots/demo-web.gif)

</div>

## 🚀 Installation

### Method 1: Install from Chrome Web Store (Coming Soon)
*Extension will be published to Chrome Web Store*

### Method 2: Install from Source (Developer Mode)

<div align="center">

![Installation Demo](assets-landing/screenshots/installation.gif)

</div>

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
   - Select the `leetconnect-extension` folder (not the root folder)
   - The extension should now appear in your extensions list

5. **Pin the Extension (Optional)**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "LeetConnect" and click the pin icon

## 📖 Quick Start

1. Click the LeetConnect icon in your Chrome toolbar
2. Enter a LeetCode username and click "Add User"
3. Watch your friends' stats appear in real-time!
4. Configure notifications and auto-refresh in settings

## ✨ Features

- 📊 **Real-time Stats Tracking** - View total problems solved, easy/medium/hard breakdowns, and current rankings
- 👥 **Friend Management** - Add and remove LeetCode usernames to track multiple users
- 🔄 **Auto-refresh** - Automatically check for updates at customizable intervals
- 🔔 **Smart Notifications** - Get notified when friends solve new problems
- 📈 **Ranking Changes** - See ranking improvements/drops with visual indicators
- 🎯 **Multiple Sorting Options** - Sort by rating, questions solved, or alphabetically
- 💾 **Data Caching** - Instant loading with cached data while fetching updates
- 🎨 **Beautiful Dark UI** - Modern, responsive design with LeetCode-inspired colors
- 🤝 **Easy Sharing** - Share the extension with friends via social media or direct links

## 🛠️ Development

### Project Structure
- **`leetconnect-extension/`** - Contains all Chrome extension files
- **`index.html`** - Landing page for the project
- **`docs/`** - Documentation and guides
- **`assets-landing/`** - Assets for the landing page
- **`scripts/`** - Build and deployment scripts

### Building the Extension
```bash
# Navigate to extension directory
cd leetconnect-extension

# The extension is ready to load in Chrome developer mode
# No build step required for this vanilla JS extension
```

### Package Extension for Distribution
```bash
# Create a ZIP file for Chrome Web Store
cd leetconnect-extension
zip -r ../leetconnect-extension-v1.2.zip . -x "*.DS_Store" "*.git*"
```

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
3. **Make Your Changes** (Focus on files in `leetconnect-extension/`)
4. **Test the Extension** (Load in Chrome and verify functionality)
5. **Commit Your Changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
6. **Push to the Branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines
- Keep extension files in `leetconnect-extension/` directory
- Update documentation in `docs/` when adding features
- Test thoroughly in Chrome before submitting PR
- Follow existing code style and patterns

## 💬 Feedback & Support

We'd love to hear from you!

### 📝 Share Your Feedback
**[Fill out our feedback form](https://forms.gle/tsSvgUKQnUtYiF8d9)** - Quick way to share suggestions, report bugs, or request features.

### 📧 Direct Contact
Email us at [anujjainbatu@gmail.com](mailto:anujjainbatu@gmail.com) for:
- Bug reports with detailed information
- Feature requests and suggestions
- Technical support
- Partnership inquiries

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
- All our users who provided valuable feedback and suggestions

---

<div align="center">

**⭐ If you find this extension helpful, please give it a star on GitHub! ⭐**

Made with ❤️ for the coding community

[🐛 Report Bug](https://github.com/anujjainbatu/leetconnect/issues) • [✨ Request Feature](https://github.com/anujjainbatu/leetconnect/issues) • [🤝 Contribute](https://github.com/anujjainbatu/leetconnect/pulls) • [📝 Feedback Form](https://forms.gle/tsSvgUKQnUtYiF8d9)

### Share LeetConnect with your coding friends! 🚀
[![Share on Twitter](https://img.shields.io/badge/Share%20on-Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/intent/tweet?text=Just%20found%20LeetConnect!%20%F0%9F%94%97%20An%20amazing%20Chrome%20extension%20to%20track%20friends'%20LeetCode%20progress%20in%20real-time.%20Perfect%20for%20coding%20study%20groups!%20%23LeetCode%20%23Coding&url=https://github.com/anujjainbatu/leetconnect)
[![Share on LinkedIn](https://img.shields.io/badge/Share%20on-LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/sharing/share-offsite/?url=https://github.com/anujjainbatu/leetconnect)

</div>
