class AdvancedProductFeatures {
  constructor() {
    this.productId = document.querySelector('[data-product-id]')?.dataset.productId;
    this.productHandle = document.querySelector('[data-product-handle]')?.dataset.productHandle;
    
    this.init();
  }

  init() {
    this.setupTabs();
    this.setupWishlist();
    this.setupSocialShare();
    this.setupStockUrgency();
    this.setupRecentlyViewed();
    this.setupSizeGuide();
    this.loadProductRecommendations();
    this.trackProductView();
  }

  // Product Tabs System
  setupTabs() {
    const tabs = document.querySelectorAll('.product-tabs__tab');
    const panels = document.querySelectorAll('.product-tabs__panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetPanel = tab.dataset.tab;

        // Remove active class from all tabs and panels
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        // Add active class to clicked tab and corresponding panel
        tab.classList.add('active');
        document.getElementById(targetPanel).classList.add('active');
      });
    });

    // Set first tab as active
    if (tabs.length > 0) {
      tabs[0].classList.add('active');
      panels[0].classList.add('active');
    }
  }

  // Wishlist Functionality
  setupWishlist() {
    const wishlistBtn = document.querySelector('.wishlist-btn');
    if (!wishlistBtn) return;

    // Check if product is already in wishlist
    const wishlist = this.getWishlist();
    if (wishlist.includes(this.productId)) {
      wishlistBtn.classList.add('active');
    }

    wishlistBtn.addEventListener('click', () => {
      this.toggleWishlist();
    });
  }

  toggleWishlist() {
    const wishlistBtn = document.querySelector('.wishlist-btn');
    const wishlist = this.getWishlist();
    const isInWishlist = wishlist.includes(this.productId);

    if (isInWishlist) {
      // Remove from wishlist
      const updatedWishlist = wishlist.filter(id => id !== this.productId);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      wishlistBtn.classList.remove('active');
      this.showNotification('Removed from wishlist', 'info');
    } else {
      // Add to wishlist
      wishlist.push(this.productId);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      wishlistBtn.classList.add('active');
      this.showNotification('Added to wishlist!', 'success');
    }

    // Animate button
    wishlistBtn.style.transform = 'scale(1.2)';
    setTimeout(() => {
      wishlistBtn.style.transform = '';
    }, 200);
  }

  getWishlist() {
    return JSON.parse(localStorage.getItem('wishlist') || '[]');
  }

  // Social Sharing
  setupSocialShare() {
    const shareButtons = document.querySelectorAll('.social-share__btn');
    
    shareButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const platform = btn.dataset.platform;
        const url = window.location.href;
        const title = document.querySelector('.product-info__title').textContent;
        const image = document.querySelector('.product-media__main img')?.src;

        this.shareProduct(platform, url, title, image);
      });
    });
  }

  shareProduct(platform, url, title, image) {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedImage = encodeURIComponent(image);

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        this.showNotification('Link copied to clipboard!', 'success');
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  }

  // Stock Urgency Indicators
  setupStockUrgency() {
    const variants = document.querySelectorAll('.variant-option');
    
    variants.forEach(variant => {
      const inventory = parseInt(variant.dataset.inventory);
      const urgencyContainer = document.querySelector('.stock-urgency-container');
      
      if (inventory <= 5 && inventory > 0) {
        this.showStockUrgency(inventory, 'low');
      } else if (inventory <= 10 && inventory > 5) {
        this.showStockUrgency(inventory, 'medium');
      }
    });
  }

  showStockUrgency(inventory, level) {
    const container = document.querySelector('.stock-urgency-container');
    if (!container) return;

    let message = '';
    let icon = '';

    switch (level) {
      case 'low':
        message = `Only ${inventory} left in stock!`;
        icon = '🔥';
        break;
      case 'medium':
        message = `${inventory} items left`;
        icon = '⚡';
        break;
    }

    container.innerHTML = `
      <div class="stock-urgency stock-urgency--${level}">
        <span class="stock-urgency__icon">${icon}</span>
        <span>${message}</span>
      </div>
    `;
  }

  // Recently Viewed Products
  setupRecentlyViewed() {
    const recentlyViewedContainer = document.querySelector('.recently-viewed__grid');
    if (!recentlyViewedContainer) return;

    const recentlyViewed = this.getRecentlyViewed();
    
    if (recentlyViewed.length > 0) {
      this.renderRecentlyViewed(recentlyViewed, recentlyViewedContainer);
    } else {
      document.querySelector('.recently-viewed').style.display = 'none';
    }
  }

  getRecentlyViewed() {
    return JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  }

  trackProductView() {
    if (!this.productId || !this.productHandle) return;

    const recentlyViewed = this.getRecentlyViewed();
    const productData = {
      id: this.productId,
      handle: this.productHandle,
      title: document.querySelector('.product-info__title').textContent,
      price: document.querySelector('.product-info__price-current').textContent,
      image: document.querySelector('.product-media__main img')?.src,
      timestamp: Date.now()
    };

    // Remove if already exists
    const filtered = recentlyViewed.filter(item => item.id !== this.productId);
    
    // Add to beginning
    filtered.unshift(productData);
    
    // Keep only last 8 items
    const updated = filtered.slice(0, 8);
    
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  }

  renderRecentlyViewed(products, container) {
    const currentProductId = this.productId;
    const filteredProducts = products.filter(product => product.id !== currentProductId);

    container.innerHTML = filteredProducts.map(product => `
      <a href="/products/${product.handle}" class="recently-viewed__item">
        <div class="recently-viewed__image">
          <img src="${product.image}" alt="${product.title}" loading="lazy">
        </div>
        <div class="recently-viewed__content">
          <h3 class="recently-viewed__name">${product.title}</h3>
          <p class="recently-viewed__price">${product.price}</p>
        </div>
      </a>
    `).join('');
  }

  // Size Guide Modal
  setupSizeGuide() {
    const sizeGuideBtn = document.querySelector('.size-guide-btn');
    const modal = document.querySelector('.size-guide-modal');
    const closeBtn = document.querySelector('.size-guide-modal__close');

    if (sizeGuideBtn && modal) {
      sizeGuideBtn.addEventListener('click', () => {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
      });

      const closeModal = () => {
        modal.classList.remove('show');
        document.body.style.overflow = '';
      };

      closeBtn.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
          closeModal();
        }
      });
    }
  }

  // Product Recommendations
  async loadProductRecommendations() {
    const container = document.querySelector('.product-recommendations__grid');
    if (!container || !this.productId) return;

    try {
      const response = await fetch(`/recommendations/products.json?product_id=${this.productId}&limit=4`);
      const data = await response.json();
      
      if (data.products && data.products.length > 0) {
        this.renderRecommendations(data.products, container);
      } else {
        document.querySelector('.product-recommendations').style.display = 'none';
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      document.querySelector('.product-recommendations').style.display = 'none';
    }
  }

  renderRecommendations(products, container) {
    container.innerHTML = products.map(product => `
      <a href="/products/${product.handle}" class="recommendation-card">
        <div class="recommendation-card__image">
          <img src="${product.featured_image}" alt="${product.title}" loading="lazy">
        </div>
        <div class="recommendation-card__content">
          <h3 class="recommendation-card__title">${product.title}</h3>
          <p class="recommendation-card__price">${this.formatMoney(product.price)}</p>
        </div>
      </a>
    `).join('');
  }

  formatMoney(cents) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  }

  showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type === 'error' ? 'notification--error' : type === 'info' ? 'notification--info' : ''}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);

    // Trigger show animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Auto hide
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
}

// Color Swatch System
class ColorSwatchSystem {
  constructor() {
    this.setupColorSwatches();
  }

  setupColorSwatches() {
    const colorSwatches = document.querySelectorAll('.color-swatch');
    
    colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        // Remove active class from all swatches
        colorSwatches.forEach(s => s.classList.remove('active'));
        
        // Add active class to clicked swatch
        swatch.classList.add('active');
        
        // Update product image and variant
        const variantId = swatch.dataset.variantId;
        const image = swatch.dataset.image;
        
        if (image) {
          this.updateProductImage(image);
        }
        
        // Update hidden select
        const select = document.querySelector('select[name="id"]');
        if (select) {
          select.value = variantId;
        }
      });
    });
  }

  updateProductImage(imageSrc) {
    const mainImage = document.querySelector('.product-media__main img');
    if (mainImage) {
      mainImage.src = imageSrc;
    }
  }
}

// Bundle System
class ProductBundleSystem {
  constructor() {
    this.bundleItems = [];
    this.setupBundleOptions();
  }

  setupBundleOptions() {
    const bundleCheckboxes = document.querySelectorAll('.bundle-item__checkbox');
    
    bundleCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.updateBundle();
      });
    });
  }

  updateBundle() {
    const selectedItems = document.querySelectorAll('.bundle-item__checkbox:checked');
    let totalPrice = 0;
    let totalDiscount = 0;

    selectedItems.forEach(item => {
      const price = parseFloat(item.dataset.price);
      const discount = parseFloat(item.dataset.discount || 0);
      
      totalPrice += price;
      totalDiscount += discount;
    });

    // Update bundle summary
    const summaryContainer = document.querySelector('.bundle-summary');
    if (summaryContainer) {
      summaryContainer.innerHTML = `
        <div class="bundle-summary__price">
          <span class="bundle-summary__total">Total: ${this.formatMoney(totalPrice * 100)}</span>
          ${totalDiscount > 0 ? `<span class="bundle-summary__savings">Save: ${this.formatMoney(totalDiscount * 100)}</span>` : ''}
        </div>
        <button class="btn btn--primary bundle-add-btn" ${selectedItems.length === 0 ? 'disabled' : ''}>
          Add Bundle to Cart
        </button>
      `;

      // Setup bundle add to cart
      const bundleBtn = summaryContainer.querySelector('.bundle-add-btn');
      if (bundleBtn) {
        bundleBtn.addEventListener('click', () => {
          this.addBundleToCart(selectedItems);
        });
      }
    }
  }

  async addBundleToCart(items) {
    const formData = new FormData();
    
    items.forEach((item, index) => {
      formData.append(`items[${index}][id]`, item.dataset.variantId);
      formData.append(`items[${index}][quantity]`, item.dataset.quantity || 1);
    });

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        this.showNotification('Bundle added to cart!', 'success');
      } else {
        throw new Error('Failed to add bundle');
      }
    } catch (error) {
      this.showNotification('Failed to add bundle. Please try again.', 'error');
    }
  }

  formatMoney(cents) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  }

  showNotification(message, type) {
    // Use the same notification system as AdvancedProductFeatures
    const notification = document.createElement('div');
    notification.className = `notification ${type === 'error' ? 'notification--error' : ''}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
}

// Initialize all systems when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AdvancedProductFeatures();
  new ColorSwatchSystem();
  new ProductBundleSystem();
}); 