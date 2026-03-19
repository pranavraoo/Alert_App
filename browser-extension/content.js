// Community Guardian Content Script
(function() {
  'use strict';

  // Add floating action button to page
  function addFloatingButton() {
    // Check if button already exists
    if (document.getElementById('community-guardian-fab')) return;

    // Create floating action button
    const fab = document.createElement('div');
    fab.id = 'community-guardian-fab';
    fab.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 56px;
        height: 56px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        transition: all 0.3s ease;
        font-size: 24px;
        color: white;
        user-select: none;
      " title="Report to Community Guardian">
        🛡️
      </div>
    `;

    document.body.appendChild(fab);

    // Add hover effects
    const button = fab.querySelector('div');
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
      button.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    });

    // Handle click
    button.addEventListener('click', function() {
      const selectedText = window.getSelection().toString().trim();
      const pageUrl = window.location.href;
      
      let threatText = selectedText || `Suspicious page: ${pageUrl}`;
      
      // Send message to background script
      chrome.runtime.sendMessage({
        action: 'reportText',
        text: threatText,
        url: pageUrl
      });
    });
  }

  // Add selection context menu
  function addSelectionMenu() {
    document.addEventListener('mouseup', function(e) {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      if (selectedText.length > 0) {
        // Remove existing menu
        const existingMenu = document.getElementById('community-guardian-menu');
        if (existingMenu) {
          existingMenu.remove();
        }

        // Create context menu
        const menu = document.createElement('div');
        menu.id = 'community-guardian-menu';
        menu.innerHTML = `
          <div style="
            position: absolute;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 10001;
            font-family: Arial, sans-serif;
            font-size: 14px;
          ">
            <div style="
              padding: 4px 8px;
              cursor: pointer;
              color: #333;
              border-radius: 2px;
            " onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='white'">
              🛡️ Report to Community Guardian
            </div>
          </div>
        `;

        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';

        document.body.appendChild(menu);

        // Handle menu click
        menu.querySelector('div').addEventListener('click', function() {
          chrome.runtime.sendMessage({
            action: 'reportText',
            text: selectedText,
            url: window.location.href
          });
          menu.remove();
        });

        // Remove menu when clicking elsewhere
        setTimeout(() => {
          document.addEventListener('click', function removeMenu() {
            menu.remove();
            document.removeEventListener('click', removeMenu);
          });
        }, 100);
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      addFloatingButton();
      addSelectionMenu();
    });
  } else {
    addFloatingButton();
    addSelectionMenu();
  }

  // Handle keyboard shortcut (Ctrl+Shift+G)
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'G') {
      e.preventDefault();
      const selectedText = window.getSelection().toString().trim();
      const pageUrl = window.location.href;
      
      let threatText = selectedText || `Suspicious page: ${pageUrl}`;
      
      chrome.runtime.sendMessage({
        action: 'reportText',
        text: threatText,
        url: pageUrl
      });
    }
  });

})();
