# Community Guardian Browser Extension

A Chrome extension that allows users to report suspicious content to Community Guardian with one click.

## Features

- 🛡️ **Right-click Context Menu**: Report selected text or links
- 📄 **Extension Popup**: Quick access to reporting features
- 🎯 **Floating Action Button**: Always accessible on any page
- ⌨️ **Keyboard Shortcut**: Ctrl+Shift+G for quick reporting
- 🔄 **Auto-fill Integration**: Seamlessly integrates with Community Guardian

## Installation

### Development Mode

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `browser-extension` directory

### Production Mode

1. Build the extension (TODO: add build process)
2. Upload to Chrome Web Store

## Usage

### Method 1: Right-Click Menu
1. Select suspicious text on any webpage
2. Right-click and select "Report to Community Guardian"
3. The Community Guardian create page will open with pre-filled data

### Method 2: Extension Icon
1. Click the Community Guardian icon in the Chrome toolbar
2. Choose "Report Current Page" or "Report Selected Text"
3. The create page will open with relevant data

### Method 3: Floating Action Button
1. Look for the 🛡️ shield icon in the bottom-right corner of any page
2. Click it to report the current page or selected text
3. Automatically opens Community Guardian with pre-filled data

### Method 4: Keyboard Shortcut
1. Select text (optional)
2. Press Ctrl+Shift+G
3. Opens Community Guardian with selected text or current page

## Files Structure

```
browser-extension/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── content.js            # Content script for FAB and selection
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
├── icons/                # Extension icons (TODO)
└── README.md             # This file
```

## Configuration

Update `COMMUNITY_GUARDIAN_URL` in:
- `background.js` (line 2)
- `popup.js` (line 1)

Change from `http://localhost:3000` to your production URL.

## Permissions

The extension requests:
- `activeTab`: Access to current tab content
- `contextMenus`: Add right-click menu options
- `storage`: Store threat data between pages
- `http://localhost:3000/*`: Access to Community Guardian

## Development Notes

- Uses Manifest V3 (latest Chrome extension standard)
- Content script runs on all URLs (`<all_urls>`)
- Floating action button appears on all pages
- Data is temporarily stored in Chrome storage
- Extension automatically opens Community Guardian in new tab

## Future Enhancements

- [ ] Add extension icons (16px, 48px, 128px)
- [ ] Build process for production
- [ ] Options page for customization
- [ ] Badge notifications
- [ ] Offline support
- [ ] Multiple reporting templates
- [ ] Integration with more browsers (Firefox, Edge)

## Troubleshooting

### Extension not working
1. Check if Community Guardian is running on localhost:3000
2. Ensure Developer mode is enabled
3. Reload the extension after changes
4. Check Chrome DevTools Console for errors

### Context menu not appearing
1. Ensure extension has proper permissions
2. Try refreshing the page
3. Check if other extensions are conflicting

### Floating button not showing
1. Check content script is loaded
2. Look for JavaScript errors in console
3. Ensure CSS isn't being blocked by page styles

## Security Considerations

- Extension only accesses data when user explicitly reports
- No data is sent to third-party servers
- All data goes directly to Community Guardian
- Minimal permissions requested
- Open source code for transparency
