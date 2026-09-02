const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

if (!prefersReducedMotion) {
  const revealSelector = [
    '.section-heading',
    '.about-grid > *',
    '.stats-grid > *',
    '.agenda-grid > *',
    '.news-grid > *',
    '.office-grid > *',
    '.transparency-grid > *',
    '.propositions-grid > *',
    '.action-grid > *',
    '.hero-content > *',
    '.hero-image',
    '.legal-card'
  ].join(',')

  const overlaySelector = [
    '.liquid-modal-backdrop',
    '.news-modal-backdrop',
    '.liquid-modal-card',
    '.news-modal',
    '.public-detail-panel',
    '.tracking-result'
  ].join(',')

  const observed = new WeakSet()

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('motion-visible')
        observer.unobserve(entry.target)
      }
    })
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -7% 0px'
  })

  function registerRevealElements(root = document) {
    const elements = root.matches?.(revealSelector)
      ? [root, ...root.querySelectorAll(revealSelector)]
      : [...root.querySelectorAll?.(revealSelector) || []]

    elements.forEach((element, index) => {
      if (observed.has(element)) return
      if (element.matches?.(overlaySelector) || element.closest?.(overlaySelector)) return

      observed.add(element)
      element.classList.add('motion-reveal')
      element.style.setProperty('--motion-delay', `${Math.min((index % 6) * 55, 275)}ms`)
      observer.observe(element)
    })
  }

  const mutationObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) registerRevealElements(node)
      })
    })
  })

  const start = () => {
    registerRevealElements(document)
    mutationObserver.observe(document.body, { childList: true, subtree: true })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true })
  else requestAnimationFrame(start)

  // Anima a saída dos pop-ups antes de o React removê-los da tela.
  const bypassOnce = new WeakSet()
  const closeButtonSelector = '.news-modal-close, .liquid-modal-close, .public-detail-head button'
  const backdropSelector = '.news-modal-backdrop, .liquid-modal-backdrop'

  document.addEventListener('click', event => {
    const target = event.target
    if (!(target instanceof Element)) return

    if (bypassOnce.has(target)) {
      bypassOnce.delete(target)
      return
    }

    const closeButton = target.closest(closeButtonSelector)
    const backdrop = target.matches(backdropSelector) ? target : null
    if (!closeButton && !backdrop) return

    const animatedRoot = closeButton
      ? closeButton.closest('.news-modal-backdrop, .liquid-modal-backdrop, .tracking-result, .public-detail-panel')
      : backdrop

    if (!animatedRoot || animatedRoot.classList.contains('motion-closing')) return

    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation?.()

    animatedRoot.classList.add('motion-closing')

    window.setTimeout(() => {
      bypassOnce.add(target)
      target.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      }))
    }, 190)
  }, true)
}
