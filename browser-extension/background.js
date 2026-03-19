// Community Guardian Background Script
const COMMUNITY_GUARDIAN_URL = 'http://localhost:3000'

// Create context menu for reporting
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'report-threat',
    title: 'Report to Community Guardian',
    contexts: ['selection', 'link', 'page'],
  })
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'report-threat') {
    let selectedText = info.selectionText || ''
    let linkUrl = info.linkUrl || ''
    let pageUrl = info.pageUrl || ''
    
    // Prepare the threat data
    let threatText = selectedText
    if (!threatText && linkUrl) {
      threatText = `Suspicious link: ${linkUrl}`
    }
    if (!threatText && pageUrl) {
      threatText = `Suspicious page: ${pageUrl}`
    }
    
    // Store the threat data and open the create page
    chrome.storage.local.set({
      threatText: threatText,
      sourceUrl: pageUrl,
      linkUrl: linkUrl
    }, () => {
      chrome.tabs.create({
        url: `${COMMUNITY_GUARDIAN_URL}/create`
      })
    })
  }
})

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0]
    const url = currentTab.url
    
    // Store current page info
    chrome.storage.local.set({
      threatText: `Suspicious page: ${url}`,
      sourceUrl: url,
      linkUrl: ''
    }, () => {
      chrome.tabs.create({
        url: `${COMMUNITY_GUARDIAN_URL}/create`
      })
    })
  })
})

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'reportText') {
    const { text, url } = request
    
    chrome.storage.local.set({
      threatText: text,
      sourceUrl: url,
      linkUrl: ''
    }, () => {
      chrome.tabs.create({
        url: `${COMMUNITY_GUARDIAN_URL}/create`
      })
    })
    
    sendResponse({ success: true })
  }
})
