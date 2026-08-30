// dsh-cmdj-toggle — client half.
//
// Codex-style focus hotkey for dsh-better-sidebar: Cmd/Ctrl+J collapses the
// panels (or restores them when everything is already collapsed).
//
// Coupling contract (verified against dsh-better-sidebar 0.16.1, all hooks
// are semantic data-attributes / CSS variables the plugin itself relies on,
// NOT hashed class names):
//   - action:  synthetic .click() on the buttons inside
//              [data-dsh-toggle-cluster] — identical to a manual click, goes
//              through better-sidebar's official reducers + persistence.
//              Button order: [bottom panel?, right panel]; the right-panel
//              button is always LAST, the bottom one only exists in wide
//              layouts.
//   - state:   right panel  -> body[data-dsh-sidebar-collapsed] absent = open
//              bottom panel -> --dsh-sidebar-height CSS var > 0 = open
//
// If a future better-sidebar release renames these hooks, only THIS file
// breaks (hotkey stops working); the sidebar itself is unaffected. Fix =
// update the selectors below.

window.__ModuleLoader__.load({
  id: 'dsh-cmdj-toggle',
  factory: (require) => {
    const module = { exports: {} }
    const exports = module.exports

    const PREFS_KEY = 'dsh-cmdj-toggle:prefs'
    const TARGETS = ['both', 'panel', 'bottom']
    const DEFAULT_PREFS = { target: 'both' }

    function readPrefs() {
      try {
        const raw = window.localStorage.getItem(PREFS_KEY)
        if (!raw) return { ...DEFAULT_PREFS }
        const parsed = JSON.parse(raw)
        return {
          target: TARGETS.includes(parsed.target) ? parsed.target : DEFAULT_PREFS.target,
        }
      } catch {
        return { ...DEFAULT_PREFS }
      }
    }

    function setPrefs(patch) {
      const next = { ...readPrefs(), ...patch }
      if (!TARGETS.includes(next.target)) next.target = DEFAULT_PREFS.target
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(next))
      return next
    }

    function isTypingTarget(el) {
      if (!el || !(el instanceof Element)) return false
      if (el.isContentEditable) return true
      const tag = el.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
    }

    function matchHotkey(e) {
      if (!(e.metaKey || e.ctrlKey)) return false
      if (e.altKey || e.shiftKey) return false
      return e.code === 'KeyJ' || e.key === 'j' || e.key === 'J'
    }

    function getButtons() {
      const cluster = document.querySelector('[data-dsh-toggle-cluster]')
      if (!cluster) return null
      const buttons = Array.from(cluster.querySelectorAll('button'))
      if (buttons.length === 0) return null
      return {
        panel: buttons[buttons.length - 1],
        bottom: buttons.length > 1 ? buttons[0] : null,
      }
    }

    function readState() {
      const panelOpen = !document.body.hasAttribute('data-dsh-sidebar-collapsed')
      const heightVar = getComputedStyle(document.documentElement)
        .getPropertyValue('--dsh-sidebar-height')
      return { panelOpen, bottomOpen: parseFloat(heightVar) > 0 }
    }

    // 'both' = focus mode: any panel open -> close all; all closed -> open all.
    // 'panel' / 'bottom' = plain independent toggle of that one panel.
    function toggle() {
      const buttons = getButtons()
      if (!buttons) return false
      const { target } = readPrefs()
      const state = readState()
      const clicks = []
      if (target === 'panel') {
        clicks.push(buttons.panel)
      } else if (target === 'bottom') {
        if (buttons.bottom) clicks.push(buttons.bottom)
      } else {
        const anyOpen = state.panelOpen || (state.bottomOpen && buttons.bottom)
        if (anyOpen) {
          if (state.panelOpen) clicks.push(buttons.panel)
          if (state.bottomOpen && buttons.bottom) clicks.push(buttons.bottom)
        } else {
          clicks.push(buttons.panel)
          if (buttons.bottom) clicks.push(buttons.bottom)
        }
      }
      for (const button of clicks) button.click()
      return clicks.length > 0
    }

    function onKey(e) {
      if (!matchHotkey(e)) return
      if (e.repeat || e.isComposing) return
      if (isTypingTarget(e.target)) return
      e.preventDefault()
      e.stopPropagation()
      toggle()
    }

    // HMR-safe: a reloaded bundle swaps the listener instead of stacking one.
    const g = window
    if (g.__dshCmdjToggleHandler) {
      window.removeEventListener('keydown', g.__dshCmdjToggleHandler, true)
    }
    g.__dshCmdjToggleHandler = onKey
    window.addEventListener('keydown', onKey, true)

    g.__dshCmdjToggle = { toggle, readState, getPrefs: readPrefs, setPrefs }
    console.info(
      '[dsh-cmdj-toggle] ready: Cmd/Ctrl+J toggles better-sidebar panels. prefs =',
      readPrefs(),
      '(change via __dshCmdjToggle.setPrefs({ target: "panel" | "bottom" | "both" }))',
    )

    exports.inject = []
    exports.apply = function apply() {}
    return module.exports
  },
})
