/**
 * Walk up the DOM tree from `el` to find the nearest ancestor with
 * a `data-tf-node-id` attribute.  Returns the ancestor element or null.
 */
export function findComponentAncestor(el: Element | null): Element | null {
  while (el && el !== document.body && el !== document.documentElement) {
    if (el.hasAttribute('data-tf-node-id')) return el;
    el = el.parentElement;
  }
  return null;
}

/**
 * Build the self-contained selection-script that is injected into the
 * preview iframe's srcdoc HTML.
 *
 * The script:
 *  - Listens for click / mouseover and resolves the nearest
 *    [data-tf-node-id] ancestor
 *  - Draws a transient highlight overlay (no layout shift)
 *  - Posts TF_SELECT / TF_HOVER to the parent window
 *  - Listens for TF_HIGHLIGHT / TF_SET_ROLE_BADGE from the parent
 *
 * Must not depend on React and must not mutate component markup except
 * for transient highlight styling.
 */
export function buildSelectionScript(): string {
  return `
(function() {
  'use strict';

  var overlay = document.createElement('div');
  overlay.id = '__tf_highlight';
  overlay.style.cssText = [
    'position:fixed',
    'pointer-events:none',
    'z-index:999999',
    'border:2px solid #3b82f6',
    'border-radius:4px',
    'background:rgba(59,130,246,0.08)',
    'display:none',
    'transition:all 0.12s ease'
  ].join(';');
  document.body.appendChild(overlay);

  function findComp(el) {
    while (el && el !== document.body && el !== document.documentElement) {
      if (el.hasAttribute && el.hasAttribute('data-tf-node-id')) return el;
      el = el.parentElement;
    }
    return null;
  }

  function getRect(el) {
    var r = el.getBoundingClientRect();
    return {
      x: r.x, y: r.y, width: r.width, height: r.height,
      top: r.top, right: r.right, bottom: r.bottom, left: r.left
    };
  }

  function esc(s) {
    return String(s).replace(/["\\\\]/g, '\\\\$&');
  }

  function postMsg(type, data) {
    var msg = { protocolVersion: 1, type: type };
    if (data) {
      for (var k in data) {
        if (Object.prototype.hasOwnProperty.call(data, k)) msg[k] = data[k];
      }
    }
    try { window.parent.postMessage(msg, '*'); } catch(e) {}
  }

  function updateOverlay(el) {
    if (!el) { overlay.style.display = 'none'; return; }
    var r = el.getBoundingClientRect();
    overlay.style.left = r.left + 'px';
    overlay.style.top = r.top + 'px';
    overlay.style.width = r.width + 'px';
    overlay.style.height = r.height + 'px';
    overlay.style.display = 'block';
  }

  var lastHovered = null;

  document.addEventListener('click', function(e) {
    var comp = findComp(e.target);
    if (comp) {
      postMsg('TF_SELECT', {
        nodeId: comp.getAttribute('data-tf-node-id'),
        role: comp.getAttribute('data-tf-role'),
        name: comp.getAttribute('data-tf-name') || undefined,
        rect: getRect(comp)
      });
    }
  }, true);

  document.addEventListener('mouseover', function(e) {
    var comp = findComp(e.target);
    updateOverlay(comp);
    var nodeId = comp ? comp.getAttribute('data-tf-node-id') : null;
    if (nodeId !== lastHovered) {
      lastHovered = nodeId;
      postMsg('TF_HOVER', { nodeId: nodeId });
    }
  }, true);

  document.addEventListener('mouseleave', function() {
    overlay.style.display = 'none';
    if (lastHovered !== null) {
      lastHovered = null;
      postMsg('TF_HOVER', { nodeId: null });
    }
  });

  window.addEventListener('message', function(e) {
    var data = e.data;
    if (!data || typeof data !== 'object' || !data.protocolVersion) return;
    if (data.protocolVersion !== 1) return;

    if (data.type === 'TF_HIGHLIGHT') {
      if (data.nodeId) {
        var el = document.querySelector('[data-tf-node-id="' + esc(data.nodeId) + '"]');
        updateOverlay(el);
      } else {
        overlay.style.display = 'none';
      }
    }

    if (data.type === 'TF_SET_ROLE_BADGE') {
      var el = document.querySelector('[data-tf-node-id="' + esc(data.nodeId) + '"]');
      if (el) el.setAttribute('data-tf-role', data.role);
    }
  });

  postMsg('TF_READY', {});
})();
`;
}

/**
 * Inject the selection script into an HTML string right before </body>.
 * If no </body> tag is present the script is appended at the end.
 */
export function buildEditorHtml(html: string): string {
  const script = buildSelectionScript();
  const scriptTag = `<script>${script}</script>`;
  if (html.includes('</body>')) {
    return html.replace('</body>', `${scriptTag}</body>`);
  }
  return html + scriptTag;
}
