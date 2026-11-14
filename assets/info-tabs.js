import { Component } from '@theme/component';

/**
 * Tabs that swap one visible panel. Tabs and panels are paired by index.
 *
 * @typedef {Object} Refs
 * @property {HTMLButtonElement[]} tabs
 * @property {HTMLElement[]} panels
 *
 * @extends {Component<Refs>}
 */
class InfoTabsComponent extends Component {
  requiredRefs = ['tabs', 'panels'];

  /**
   * Shows the panel of the clicked tab.
   * @param {Event} event
   */
  select(event) {
    const index = this.refs.tabs.indexOf(/** @type {HTMLButtonElement} */ (event.target));

    if (index > -1) this.#activate(index);
  }

  /**
   * Moves between tabs with the arrow, Home and End keys.
   * @param {KeyboardEvent} event
   */
  handleKeyDown(event) {
    const { tabs } = this.refs;
    const current = tabs.indexOf(/** @type {HTMLButtonElement} */ (event.target));

    if (current < 0) return;

    const isRtl = getComputedStyle(this).direction === 'rtl';
    const step = { ArrowRight: isRtl ? -1 : 1, ArrowLeft: isRtl ? 1 : -1 }[event.key];
    let next = current;

    if (step) next = (current + step + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;

    event.preventDefault();
    this.#activate(next);
    tabs[next]?.focus();
  }

  /**
   * @param {number} index
   */
  #activate(index) {
    const { tabs, panels } = this.refs;

    tabs.forEach((tab, i) => {
      const selected = i === index;

      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i]?.toggleAttribute('hidden', !selected);
    });
  }
}

if (!customElements.get('info-tabs-component')) {
  customElements.define('info-tabs-component', InfoTabsComponent);
}
