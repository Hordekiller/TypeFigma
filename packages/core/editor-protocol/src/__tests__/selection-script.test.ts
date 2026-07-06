import { describe, it, expect } from 'vitest';
import { findComponentAncestor, buildSelectionScript, buildEditorHtml } from '../selection-script.js';

/**
 * Helper: set up a minimal DOM tree for ancestor resolution tests.
 * Returns the container (which is appended to document.body).
 */
function setupDom(): { container: HTMLElement; component1: HTMLElement; component2: HTMLElement; child1: HTMLElement; child2: HTMLElement; standalone: HTMLElement } {
  document.body.innerHTML = '';

  const container = document.createElement('div');

  const component1 = document.createElement('section');
  component1.setAttribute('data-tf-node-id', 'c1');
  component1.setAttribute('data-tf-role', 'hero');
  const child1 = document.createElement('span');
  child1.textContent = 'child1';
  component1.appendChild(child1);

  const component2 = document.createElement('header');
  component2.setAttribute('data-tf-node-id', 'c2');
  component2.setAttribute('data-tf-role', 'header');
  const child2 = document.createElement('nav');
  child2.textContent = 'child2';
  component2.appendChild(child2);

  const standalone = document.createElement('p');
  standalone.textContent = 'no component';

  container.appendChild(component1);
  container.appendChild(component2);
  container.appendChild(standalone);
  document.body.appendChild(container);

  return { container, component1, component2, child1, child2, standalone };
}

describe('findComponentAncestor', () => {
  it('returns the element itself when it has data-tf-node-id', () => {
    const { component1 } = setupDom();
    expect(findComponentAncestor(component1)).toBe(component1);
  });

  it('returns the nearest ancestor with data-tf-node-id', () => {
    const { component1, child1 } = setupDom();
    expect(findComponentAncestor(child1)).toBe(component1);
  });

  it('returns null for an element with no component ancestor', () => {
    const { standalone } = setupDom();
    expect(findComponentAncestor(standalone)).toBeNull();
  });

  it('returns null for null input', () => {
    expect(findComponentAncestor(null)).toBeNull();
  });

  it('walks past non-component ancestors to find the nearest component', () => {
    const { component2, child2 } = setupDom();
    const deep = document.createElement('ul');
    const deepChild = document.createElement('li');
    deepChild.textContent = 'deep';
    deep.appendChild(deepChild);
    child2.appendChild(deep);

    expect(findComponentAncestor(deepChild)).toBe(component2);
  });

  it('stops at document.body and returns null', () => {
    expect(findComponentAncestor(document.body)).toBeNull();
  });

  it('stops at document.documentElement and returns null', () => {
    expect(findComponentAncestor(document.documentElement)).toBeNull();
  });
});

describe('buildSelectionScript', () => {
  it('returns a string containing key script parts', () => {
    const script = buildSelectionScript();
    expect(typeof script).toBe('string');
    expect(script).toContain('TF_READY');
    expect(script).toContain('TF_SELECT');
    expect(script).toContain('TF_HOVER');
    expect(script).toContain('TF_HIGHLIGHT');
    expect(script).toContain('TF_SET_ROLE_BADGE');
    expect(script).toContain('__tf_highlight');
    expect(script).toContain('protocolVersion');
  });
});

describe('buildEditorHtml', () => {
  it('injects script before </body>', () => {
    const html = '<html><head></head><body><p>hello</p></body></html>';
    const result = buildEditorHtml(html);
    expect(result).toContain('<script>');
    expect(result).toContain('</script></body>');
    expect(result).not.toContain('</body></script>');
  });

  it('appends script at end when no </body> tag', () => {
    const html = '<div>no body tag</div>';
    const result = buildEditorHtml(html);
    expect(result).toContain('<script>');
    expect(result.endsWith('</script>')).toBe(true);
  });
});
