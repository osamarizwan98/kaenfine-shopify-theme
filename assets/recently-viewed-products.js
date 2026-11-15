import { Component } from '@theme/component';
import { morphSection, sectionRenderer } from '@theme/section-renderer';

/**
 * Updates the recently viewed products in localStorage.
 */
export class RecentlyViewed {
  /** @static @constant {string} The key used to store the viewed products in session storage */
  static #STORAGE_KEY = 'viewedProducts';
  /** @static @constant {number} The maximum number of products to store */
  static #MAX_PRODUCTS = 4;

  /**
   * Adds a product to the recently viewed products list.
   * @param {string} productId - The ID of the product to add.
   */
  static addProduct(productId) {
    let viewedProducts = this.getProducts();

    viewedProducts = viewedProducts.filter((/** @type {string} */ id) => id !== productId);
    viewedProducts.unshift(productId);
    viewedProducts = viewedProducts.slice(0, this.#MAX_PRODUCTS);

    localStorage.setItem(this.#STORAGE_KEY, JSON.stringify(viewedProducts));
  }

  static clearProducts() {
    localStorage.removeItem(this.#STORAGE_KEY);
  }

  /**
   * Retrieves the list of recently viewed products from session storage.
   * @returns {string[]} The list of viewed products.
   */
  static getProducts() {
    return JSON.parse(localStorage.getItem(this.#STORAGE_KEY) || '[]');
  }
}

/**
 * Renders a product list section with the stored recently viewed products,
 * excluding the product currently on the page.
 */
class RecentlyViewedProductsComponent extends Component {
  #abortController = new AbortController();

  connectedCallback() {
    super.connectedCallback();
    if (this.dataset.loaded !== 'true') this.#load();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#abortController.abort();
  }

  async #load() {
    const { sectionId, productId } = this.dataset;
    const productIds = RecentlyViewed.getProducts().filter((/** @type {string} */ id) => id !== productId);
    if (!sectionId || productIds.length === 0) return;

    const url = new URL(Theme.routes.search_url, location.origin);
    url.searchParams.set('q', productIds.map((id) => `id:${id}`).join(' OR '));
    url.searchParams.set('type', 'product');

    try {
      const html = await sectionRenderer.getSectionHTML(sectionId, false, url, this.#abortController.signal);
      if (this.#abortController.signal.aborted) return;
      await morphSection(sectionId, html);
    } catch (error) {
      if (!this.#abortController.signal.aborted) console.error('Recently viewed products error:', error);
    }
  }
}

if (!customElements.get('recently-viewed-products')) {
  customElements.define('recently-viewed-products', RecentlyViewedProductsComponent);
}
