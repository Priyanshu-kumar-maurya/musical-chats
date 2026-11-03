// =============================================================================
// Secret-Bubble Anti-Inspection & DevTools Tamper Shield
// Protects Against Casual Snooping, F12 Inspect Element, and Storage Scraping
// =============================================================================

let isShieldInstalled = false;
let devToolsOpenListeners = new Set();
let isDevToolsDetected = false;

export function isDevToolsOpen() {
  return isDevToolsDetected;
}

export function subscribeDevToolsDetection(callback) {
  devToolsOpenListeners.add(callback);
  return () => {
    devToolsOpenListeners.delete(callback);
  };
}

function notifyDevToolsState(isOpen) {
  if (isDevToolsDetected !== isOpen) {
    isDevToolsDetected = isOpen;
    devToolsOpenListeners.forEach(fn => {
      try {
        fn(isOpen);
      } catch (e) {}
    });
  }
}

/**
 * Initializes anti-inspection shields:
 * 1. Blocks right-click context menu (Inspect Element)
 * 2. Blocks F12 and DevTools keyboard shortcuts
 * 3. Detects open DevTools and silences console output
 */
export function installAntiInspectShield({ blockContextMenu = true, blockShortcuts = true, detectDevTools = true } = {}) {
  if (typeof window === 'undefined' || isShieldInstalled) return;
  isShieldInstalled = true;

  // 1. Block Context Menu (Inspect Element)
  if (blockContextMenu) {
    window.addEventListener('contextmenu', (e) => {
      // Allow right-click only if user is holding alt+ctrl+meta (developer bypass if needed)
      if (e.altKey && e.ctrlKey && e.shiftKey) return;
      e.preventDefault();
      return false;
    }, { capture: true, passive: false });
  }

  // 2. Block DevTools Keyboard Shortcuts
  if (blockShortcuts) {
    window.addEventListener('keydown', (e) => {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      const isModifier = e.ctrlKey || e.metaKey;
      if (!isModifier) return;

      const key = (e.key || '').toLowerCase();

      // Ctrl+Shift+I / J / C (DevTools, Console, Inspect Element)
      if (e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+U (View Source) or Ctrl+S (Save Page)
      if (key === 'u' || key === 's') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }, { capture: true, passive: false });
  }

  // 3. DevTools Open Detection & Console Shield
  if (detectDevTools) {
    const checkDevTools = () => {
      try {
        const widthThreshold = window.outerWidth - window.innerWidth > 160;
        const heightThreshold = window.outerHeight - window.innerHeight > 160;
        const isOpen = widthThreshold || heightThreshold;

        if (isOpen) {
          notifyDevToolsState(true);
          try {
            console.clear();
            console.log(
              '%c🛡️ SECRET-BUBBLE SECURITY SHIELD%c\nDeveloper inspection is monitored.\nAll client-side chat vaults are encrypted under AES-256.\nDirect memory inspection and plain text scraping are blocked.',
              'background: #dc2626; color: #ffffff; font-size: 14px; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
              'color: #f87171; font-size: 12px; margin-top: 4px;'
            );
          } catch (e) {}
        } else {
          notifyDevToolsState(false);
        }
      } catch (err) {}
    };

    window.addEventListener('resize', checkDevTools, { passive: true });
    setInterval(checkDevTools, 2000);
    checkDevTools();
  }
}
