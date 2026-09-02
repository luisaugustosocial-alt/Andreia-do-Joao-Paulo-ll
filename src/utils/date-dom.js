const ISO_DATE = /\b(\d{4})-(\d{2})-(\d{2})\b/g

function formatTextNode(node) {
  if (!node?.nodeValue || !ISO_DATE.test(node.nodeValue)) return
  ISO_DATE.lastIndex = 0
  node.nodeValue = node.nodeValue.replace(ISO_DATE, (_, year, month, day) => `${day}/${month}/${year}`)
}

function formatDatesIn(root) {
  if (!root) return

  if (root.nodeType === Node.TEXT_NODE) {
    formatTextNode(root)
    return
  }

  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  nodes.forEach(formatTextNode)
}

function startDateFormatter() {
  formatDatesIn(document.body)

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') {
        formatTextNode(mutation.target)
      }
      mutation.addedNodes.forEach(formatDatesIn)
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startDateFormatter, { once: true })
} else {
  startDateFormatter()
}
