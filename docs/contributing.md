# 🤝 Contributing to LeetConnect

Thank you for your interest in contributing to LeetConnect! This guide will help you get started with contributing to our Chrome extension that helps developers track their friends' LeetCode progress.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Submitting Changes](#submitting-changes)
- [Types of Contributions](#types-of-contributions)
- [Issue Guidelines](#issue-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community Guidelines](#community-guidelines)

## 📜 Code of Conduct

By participating in this project, you agree to maintain a welcoming and inclusive environment. Please:

- **Be Respectful**: Treat all contributors with respect and kindness
- **Be Collaborative**: Help others learn and grow
- **Be Patient**: Remember that everyone has different experience levels
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Inclusive**: Welcome diverse perspectives and backgrounds

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Google Chrome** (version 88 or higher)
- **Git** installed on your system
- **Text Editor** (VS Code, Sublime Text, etc.)
- **Basic Knowledge** of JavaScript, HTML, and CSS
- **Understanding** of Chrome Extension APIs (helpful but not required)

### First Steps

1. **⭐ Star the Repository** (if you haven't already!)
2. **🍴 Fork the Repository** to your GitHub account
3. **📥 Clone Your Fork** locally
4. **📖 Read the Documentation** ([README.md](../README.md), [installation-guide.md](installation-guide.md))
5. **🔧 Set Up Development Environment**

## 🛠️ Development Setup

### 1. Clone the Repository

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/leetconnect.git
cd leetconnect

# Add upstream remote
git remote add upstream https://github.com/anujjainbatu/leetconnect.git
```

### 2. Set Up the Extension

```bash
# Navigate to extension directory
cd leetconnect-extension

# Load the extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the leetconnect-extension folder
```

### 3. Verify Installation

1. **Check Extension**: Look for LeetConnect icon in Chrome toolbar
2. **Test Functionality**: Add a test user (e.g., `anujjainbatu`)
3. **Check Console**: Open Developer Tools for any errors
4. **Test Features**: Try sorting, refreshing, and sharing features

## 📁 Project Structure

Understanding the project structure is crucial for effective contributions:

```
leetconnect/
├── README.md                      # Main project documentation
├── LICENSE                        # MIT License
├── index.html                     # Landing page
│
├── leetconnect-extension/         # 🎯 Main extension code
│   ├── manifest.json              # Extension configuration
│   ├── popup.html                 # Main UI structure
│   ├── popup.css                  # Styling and themes
│   ├── popup.js                   # Core functionality
│   ├── background.js              # Background service worker
│   ├── assets/                    # Extension assets
│   │   ├── icon.svg               # Extension icon
│   │   └── logo.svg               # LeetConnect logo
│   └── icons/                     # Icon files
│       └── icon128.png            # Chrome store icon
│
├── docs/                          # 📚 Documentation
│   ├── installation-guide.md     # Installation instructions
│   ├── user-guide.md             # User documentation
│   └── contributing.md            # This file
│
├── assets-landing/                # 🎨 Landing page assets
│   ├── screenshots/               # Demo images and GIFs
│   └── ...                       # Other landing page assets
│
└── ...                           # Other project files
```

### Key Files to Understand

- **[`manifest.json`](../leetconnect-extension/manifest.json)**: Extension configuration and permissions
- **[`popup.js`](../leetconnect-extension/popup.js)**: Main application logic (445+ lines)
- **[`popup.html`](../leetconnect-extension/popup.html)**: UI structure and modals
- **[`popup.css`](../leetconnect-extension/popup.css)**: Styling and responsive design
- **[`background.js`](../leetconnect-extension/background.js)**: Background tasks and notifications

## 🔄 Development Workflow

### 1. Create a Feature Branch

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

Focus your changes on specific areas:

- **UI Improvements**: Modify [`popup.html`](../leetconnect-extension/popup.html) and [`popup.css`](../leetconnect-extension/popup.css)
- **Functionality**: Update [`popup.js`](../leetconnect-extension/popup.js)
- **Background Tasks**: Edit [`background.js`](../leetconnect-extension/background.js)
- **Configuration**: Adjust [`manifest.json`](../leetconnect-extension/manifest.json)
- **Documentation**: Update files in [`docs/`](../docs/) directory

### 3. Test Your Changes

```bash
# Reload extension in Chrome
# 1. Go to chrome://extensions/
# 2. Find LeetConnect
# 3. Click the refresh icon (🔄)

# Test core functionality:
# - Add/remove users
# - Sort options
# - Refresh data
# - Share functionality
# - Settings panel
# - Notifications (if applicable)
```

### 4. Commit and Push

```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add new sorting option for contest ratings"

# Push to your fork
git push origin feature/your-feature-name
```

## 📝 Coding Standards

### JavaScript Guidelines

```javascript
// Use modern ES6+ syntax
const users = await fetchUserData(usernames);

// Use meaningful variable names
const sortedUsersByRating = users.sort((a, b) => b.rating - a.rating);

// Add comments for complex logic
// Calculate ranking change with visual indicators
const rankingChange = currentRank - previousRank;

// Use consistent error handling
try {
  const userData = await fetchLeetCodeStats(username);
  displayUserData(userData);
} catch (error) {
  console.error('Error fetching user data:', error);
  showErrorMessage('Failed to load user data');
}
```

### HTML Guidelines

```html
<!-- Use semantic HTML elements -->
<section class="user-stats">
  <header class="user-header">
    <h3 class="username">anujjainbatu</h3>
  </header>
  
  <!-- Use descriptive class names -->
  <div class="stats-grid">
    <div class="stat-item easy-problems">
      <span class="stat-count">150</span>
      <span class="stat-label">Easy</span>
    </div>
  </div>
</section>
```

### CSS Guidelines

```css
/* Use CSS custom properties for theming */
:root {
  --primary-color: #ffa116;
  --background-dark: #1a1a1a;
  --text-primary: #ffffff;
}

/* Use BEM-like naming convention */
.user-card {
  background: var(--background-dark);
}

.user-card__header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-card__stats--loading {
  opacity: 0.6;
}

/* Group related styles */
.share-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
}
```

## 🧪 Testing Guidelines

### Manual Testing Checklist

Before submitting changes, verify:

#### Core Functionality
- [ ] ✅ Extension loads without errors
- [ ] ✅ Users can be added successfully
- [ ] ✅ User stats display correctly
- [ ] ✅ Remove user functionality works
- [ ] ✅ Sort options work (Rating, Questions, Alphabetical)
- [ ] ✅ Refresh button updates all data
- [ ] ✅ Username links open LeetCode profiles

#### UI/UX Testing
- [ ] ✅ Responsive design works in popup
- [ ] ✅ All buttons are clickable and responsive
- [ ] ✅ Loading states are visible
- [ ] ✅ Error messages are clear and helpful
- [ ] ✅ Animations and transitions work smoothly

#### Share Functionality
- [ ] ✅ Share modal opens and closes correctly
- [ ] ✅ Twitter sharing works with correct text
- [ ] ✅ Copy message functionality works
- [ ] ✅ Copy link functionality works
- [ ] ✅ Share buttons provide visual feedback

#### Settings Panel
- [ ] ✅ Settings panel toggles correctly
- [ ] ✅ Auto-refresh settings persist
- [ ] ✅ Notification settings work
- [ ] ✅ Test notification button functions

### Browser Testing

Test your changes across:
- **Chrome** (primary target)
- **Edge** (Chromium-based)
- **Brave** (if available)

### Error Testing

Test error scenarios:
- **Invalid usernames**: Ensure proper error handling
- **Network issues**: Test offline behavior
- **API failures**: Verify graceful degradation
- **Permission denials**: Handle permission requests

## 📤 Submitting Changes

### Pull Request Checklist

Before creating a PR:

- [ ] 📖 **Read Guidelines**: Reviewed this contributing guide
- [ ] 🧪 **Tested Changes**: Verified functionality works correctly
- [ ] 📝 **Updated Documentation**: Added/updated relevant docs
- [ ] 🎯 **Focused Changes**: PR addresses one specific feature/fix
- [ ] 💬 **Clear Description**: PR has detailed description of changes
- [ ] 🔗 **Linked Issues**: Referenced relevant issues (if applicable)

### PR Description Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tested in Chrome
- [ ] Tested core functionality
- [ ] Tested edge cases
- [ ] No console errors

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Related Issues
Fixes #(issue number)
```

## 🎯 Types of Contributions

We welcome various types of contributions:

### 🐛 Bug Fixes
- Fix extension loading issues
- Resolve UI/UX problems
- Address performance issues
- Fix API integration problems

### ✨ New Features
- Additional sorting options
- Enhanced notification system
- New sharing platforms
- Improved user interface elements
- Better data visualization

### 📚 Documentation
- Improve installation guides
- Add usage examples
- Create video tutorials
- Translate documentation
- Update README and guides

### 🎨 Design Improvements
- UI/UX enhancements
- Icon and logo improvements
- Animation and interaction design
- Accessibility improvements
- Mobile responsiveness (for popup)

### 🔧 Technical Improvements
- Code optimization
- Performance enhancements
- Security improvements
- Browser compatibility
- API integration improvements

## 🐛 Issue Guidelines

### Before Creating an Issue

1. **🔍 Search Existing Issues**: Check if issue already exists
2. **📖 Check Documentation**: Review guides and FAQ
3. **🧪 Reproduce the Bug**: Ensure it's reproducible
4. **💻 Test Environment**: Try in a clean Chrome profile

### Issue Templates

#### Bug Reports
```markdown
## Bug Description
Clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- Chrome Version: 
- Operating System: 
- Extension Version: 

## Screenshots
Add screenshots if applicable.
```

#### Feature Requests
```markdown
## Feature Description
Clear description of the feature you'd like to see.

## Use Case
Why would this feature be useful?

## Proposed Implementation
How do you think this should work?

## Additional Context
Any other context or examples.
```

## 🔄 Pull Request Process

### 1. Pre-PR Checklist
- [ ] Fork repository and create feature branch
- [ ] Make focused, atomic changes
- [ ] Test thoroughly in Chrome
- [ ] Update documentation if needed
- [ ] Write clear commit messages

### 2. Creating the PR
- **Title**: Use clear, descriptive title
- **Description**: Fill out the PR template completely
- **Labels**: Add appropriate labels (if you have permission)
- **Reviewers**: Request review from maintainers

### 3. Review Process
- **Code Review**: Maintainers will review your code
- **Testing**: Changes will be tested in different environments
- **Feedback**: Address any requested changes
- **Approval**: PR will be approved when ready

### 4. After Merge
- **Cleanup**: Delete your feature branch
- **Update**: Pull latest changes from upstream
- **Celebrate**: Your contribution is now part of LeetConnect! 🎉

## 👥 Community Guidelines

### Getting Help

If you need help while contributing:

1. **💬 GitHub Discussions**: [Ask questions](https://github.com/anujjainbatu/leetconnect/discussions)
2. **📧 Email**: Contact anujjainbatu@gmail.com
3. **🐛 Issues**: Create an issue for bugs or feature requests
4. **📝 Feedback Form**: [Quick feedback](https://forms.gle/tsSvgUKQnUtYiF8d9)

### Communication Guidelines

- **Be Clear**: Provide specific details and context
- **Be Patient**: Maintainers may take time to respond
- **Be Respectful**: Everyone is volunteering their time
- **Be Helpful**: Assist other contributors when possible

### Recognition

Contributors will be:
- **Listed**: In the project's contributor list
- **Credited**: In release notes for significant contributions
- **Acknowledged**: In the project README
- **Appreciated**: With sincere thanks from the community!

## 🎁 Contribution Ideas

Not sure where to start? Here are some ideas:

### For Beginners
- **Fix typos** in documentation
- **Improve error messages** for better user experience
- **Add tooltips** to UI elements
- **Update dependencies** in manifest.json
- **Test and report bugs** on different systems

### For Intermediate Contributors
- **Add new sorting options** (contest rating, streak, etc.)
- **Improve notification system** with more customization
- **Enhance share functionality** with more platforms
- **Add keyboard shortcuts** for power users
- **Implement dark/light theme toggle**

### For Advanced Contributors
- **Add data visualization** (charts, graphs)
- **Implement export/import** functionality
- **Add contest tracking** features
- **Create browser sync** across devices
- **Build automated testing** framework

## 📈 Roadmap & Future Plans

Help us build towards these goals:

### Short Term (Next Release)
- [ ] Chrome Web Store submission
- [ ] Enhanced notification system
- [ ] Additional sorting options
- [ ] Improved error handling

### Medium Term
- [ ] Firefox extension support
- [ ] Contest tracking features
- [ ] Data export/import
- [ ] Advanced filtering options

### Long Term
- [ ] Mobile app companion
- [ ] Team/group management
- [ ] Analytics dashboard
- [ ] Integration with other coding platforms

## 🙏 Thank You!

Every contribution, no matter how small, makes LeetConnect better for the entire coding community. Whether you're:

- 🐛 **Reporting a bug**
- ✨ **Suggesting a feature**
- 📝 **Improving documentation**
- 💻 **Writing code**
- 🎨 **Designing UI/UX**
- 🧪 **Testing functionality**

Your efforts are appreciated and valued!

---

## 📞 Contact & Support

### For Contributors
- **📧 Email**: anujjainbatu@gmail.com
- **💬 GitHub Discussions**: [Community discussions](https://github.com/anujjainbatu/leetconnect/discussions)
- **🐛 Issues**: [Report bugs or request features](https://github.com/anujjainbatu/leetconnect/issues)

### Quick Links
- **📖 [User Guide](user-guide.md)**: Learn how to use LeetConnect
- **🔧 [Installation Guide](installation-guide.md)**: Set up development environment
- **📝 [Feedback Form](https://forms.gle/tsSvgUKQnUtYiF8d9)**: Share quick feedback
- **⭐ [GitHub Repository](https://github.com/anujjainbatu/leetconnect)**: Star the project!

---

*Happy Contributing! Let's build something amazing together! 🚀*

**Made with ❤️ for the coding community**