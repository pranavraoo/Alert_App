// Community Guardian Popup Script
const COMMUNITY_GUARDIAN_URL = 'http://localhost:3000'

document.addEventListener('DOMContentLoaded', function() {
  const reportPageBtn = document.getElementById('reportPage')
  const reportSelectionBtn = document.getElementById('reportSelection')
  const statusDiv = document.getElementById('status')

  // Report current page
  reportPageBtn.addEventListener('click', function() {
    statusDiv.textContent = 'Opening Community Guardian...'
    
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const currentTab = tabs[0]
      const url = currentTab.url
      
      chrome.storage.local.set({
        threatText: `Suspicious page: ${url}`,
        sourceUrl: url,
        linkUrl: ''
      }, function() {
        chrome.tabs.create({
          url: `${COMMUNITY_GUARDIAN_URL}/create`
        }, function() {
          window.close()
        })
      })
    })
  })

  // Report selected text
  reportSelectionBtn.addEventListener('click', function() {
    statusDiv.textContent = 'Getting selected text...'
    
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const currentTab = tabs[0]
      
      // Execute script to get selected text
      chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        function: getSelectedText
      }, function(result) {
        const selectedText = result && result[0] && result[0].result
        
        if (selectedText && selectedText.trim()) {
          statusDiv.textContent = 'Opening Community Guardian...'
          
          chrome.storage.local.set({
            threatText: selectedText.trim(),
            sourceUrl: currentTab.url,
            linkUrl: ''
          }, function() {
            chrome.tabs.create({
              url: `${COMMUNITY_GUARDIAN_URL}/create`
            }, function() {
              window.close()
            })
          })
        } else {
          statusDiv.textContent = 'No text selected. Please select text first.'
          setTimeout(() => {
            statusDiv.textContent = ''
          }, 2000)
        }
      })
    })
  })
})

// Function to get selected text from the page
function getSelectedText() {
  return window.getSelection().toString().trim()
}
