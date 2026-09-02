const ISO_DATE = /\b(\d{4})-(\d{2})-(\d{2})\b/g
const LONG_PROTOCOL = /\bAND-(\d{4})-(\d{6})\b/g

function toBRDate(value) {
  const text = String(value || '').trim()
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return text
  return `${match[3]}/${match[2]}/${match[1]}`
}

function toISODate(value) {
  const text = String(value || '').trim()
  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return ''
  return `${match[3]}-${match[2]}-${match[1]}`
}

function maskDate(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

function shortenProtocol(value) {
  return String(value || '').replace(LONG_PROTOCOL, (_, year, digits) => `AND-${year}-${digits.slice(-3)}`)
}

function formatTextNode(node) {
  if (!node?.nodeValue) return

  let value = node.nodeValue
  ISO_DATE.lastIndex = 0
  LONG_PROTOCOL.lastIndex = 0

  value = value.replace(ISO_DATE, (_, year, month, day) => `${day}/${month}/${year}`)
  value = value.replace(LONG_PROTOCOL, (_, year, digits) => `AND-${year}-${digits.slice(-3)}`)

  if (value !== node.nodeValue) node.nodeValue = value
}

function setNativeValue(input, value) {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
  descriptor?.set?.call(input, value)
}

function enhanceDateInput(input) {
  if (!input || input.dataset.brDateEnhanced === '1') return
  if (input.type !== 'date') return

  input.dataset.brDateEnhanced = '1'
  input.style.display = 'none'

  const proxy = document.createElement('input')
  proxy.type = 'text'
  proxy.inputMode = 'numeric'
  proxy.maxLength = 10
  proxy.placeholder = 'DD/MM/AAAA'
  proxy.className = input.className
  proxy.dataset.brDateProxy = '1'
  proxy.value = toBRDate(input.value)

  input.insertAdjacentElement('afterend', proxy)

  proxy.addEventListener('input', () => {
    proxy.value = maskDate(proxy.value)

    if (proxy.value.length === 10) {
      const iso = toISODate(proxy.value)
      if (iso) {
        setNativeValue(input, iso)
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }
  })

  proxy.addEventListener('blur', () => {
    if (proxy.value.length !== 10) {
      proxy.value = toBRDate(input.value)
    }
  })

  const sync = () => {
    if (document.activeElement !== proxy) {
      const formatted = toBRDate(input.value)
      if (proxy.value !== formatted) proxy.value = formatted
    }
  }

  const timer = window.setInterval(() => {
    if (!document.body.contains(input) || !document.body.contains(proxy)) {
      clearInterval(timer)
      return
    }
    sync()
  }, 250)
}

function enhanceElement(element) {
  if (!(element instanceof Element)) return

  if (element.matches('input[type="date"]')) enhanceDateInput(element)

  element.querySelectorAll?.('input[type="date"]').forEach(enhanceDateInput)

  element.querySelectorAll?.('input[placeholder*="AND-2026-123456"]').forEach(input => {
    input.placeholder = input.placeholder.replace('AND-2026-123456', 'AND-2026-123')
  })
}

function formatDatesIn(root) {
  if (!root) return

  if (root.nodeType === Node.TEXT_NODE) {
    formatTextNode(root)
    return
  }

  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return

  if (root.nodeType === Node.ELEMENT_NODE) enhanceElement(root)

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  nodes.forEach(formatTextNode)
}

function startDateFormatter() {
  formatDatesIn(document.body)
  enhanceElement(document.body)

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') formatTextNode(mutation.target)
      mutation.addedNodes.forEach(node => {
        formatDatesIn(node)
        if (node.nodeType === Node.ELEMENT_NODE) enhanceElement(node)
      })
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
