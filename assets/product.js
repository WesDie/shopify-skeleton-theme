class ProductPage {
  constructor() {
    this.productForm = document.querySelector('.product-form__form');
    this.variantSelect = document.querySelector('select[name="id"]');
    this.quantityInput = document.querySelector('.quantity-selector__input');
    this.addToCartBtn = document.querySelector('.btn--add-to-cart');
    this.currentVariant = null;

    this.init();
  }

  init() {
    this.setupImageGallery();
    this.setupVariantSelection();
    this.setupQuantityControls();
    this.setupAddToCart();
    this.setupImageZoom();
    this.updateVariant();
  }

  setupImageGallery() {
    const mainImage = document.querySelector('.product-media__main img');
    const thumbs = document.querySelectorAll('.product-media__thumb');

    thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        // Remove active class from all thumbs
        thumbs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked thumb
        thumb.classList.add('active');

        // Update main image
        const newSrc = thumb.querySelector('img').src;
        const newAlt = thumb.querySelector('img').alt;
        
        mainImage.src = newSrc;
        mainImage.alt = newAlt;
      });
    });

    // Set first thumb as active
    if (thumbs.length > 0) {
      thumbs[0].classList.add('active');
    }
  }

  setupVariantSelection() {
    const variantOptions = document.querySelectorAll('.variant-option');
    
    variantOptions.forEach(option => {
      option.addEventListener('click', () => {
        // Remove selected class from all options
        variantOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to clicked option
        option.classList.add('selected');

        // Update hidden select
        const variantId = option.dataset.variantId;
        this.variantSelect.value = variantId;
        
        // Update current variant
        this.updateVariant();
      });
    });

    // Set initial selection
    if (variantOptions.length > 0) {
      variantOptions[0].classList.add('selected');
      this.variantSelect.value = variantOptions[0].dataset.variantId;
    }
  }

  setupQuantityControls() {
    const decreaseBtn = document.querySelector('.quantity-decrease');
    const increaseBtn = document.querySelector('.quantity-increase');

    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(this.quantityInput.value);
        if (currentValue > 1) {
          this.quantityInput.value = currentValue - 1;
          this.updateQuantityButtons();
        }
      });
    }

    if (increaseBtn) {
      increaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(this.quantityInput.value);
        const maxValue = this.getCurrentVariantInventory();
        
        if (currentValue < maxValue) {
          this.quantityInput.value = currentValue + 1;
          this.updateQuantityButtons();
        }
      });
    }

    this.quantityInput.addEventListener('input', () => {
      const value = parseInt(this.quantityInput.value);
      const maxValue = this.getCurrentVariantInventory();
      
      if (value < 1) {
        this.quantityInput.value = 1;
      } else if (value > maxValue) {
        this.quantityInput.value = maxValue;
      }
      
      this.updateQuantityButtons();
    });

    this.updateQuantityButtons();
  }

  setupAddToCart() {
    if (this.productForm) {
      this.productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addToCart();
      });
    }
  }

  setupImageZoom() {
    const mainImage = document.querySelector('.product-media__main');
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
      <div class="image-modal__content">
        <button class="image-modal__close">&times;</button>
        <img class="image-modal__image" src="" alt="">
      </div>
    `;
    document.body.appendChild(modal);

    const modalImage = modal.querySelector('.image-modal__image');
    const closeBtn = modal.querySelector('.image-modal__close');

    mainImage.addEventListener('click', () => {
      const currentImage = mainImage.querySelector('img');
      modalImage.src = currentImage.src;
      modalImage.alt = currentImage.alt;
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    });

    const closeModal = () => {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeModal();
      }
    });
  }

  updateVariant() {
    const selectedOption = document.querySelector('.variant-option.selected');
    if (!selectedOption) return;

    this.currentVariant = {
      id: selectedOption.dataset.variantId,
      available: selectedOption.dataset.available === 'true',
      inventory: parseInt(selectedOption.dataset.inventory) || 0,
      price: selectedOption.dataset.price
    };

    this.updateAddToCartButton();
    this.updateQuantityButtons();
    this.updateVariantImage();
  }

  updateAddToCartButton() {
    if (!this.addToCartBtn || !this.currentVariant) return;

    if (this.currentVariant.available && this.currentVariant.inventory > 0) {
      this.addToCartBtn.disabled = false;
      this.addToCartBtn.textContent = 'Add to cart';
    } else {
      this.addToCartBtn.disabled = true;
      this.addToCartBtn.textContent = 'Sold out';
    }
  }

  updateQuantityButtons() {
    const decreaseBtn = document.querySelector('.quantity-decrease');
    const increaseBtn = document.querySelector('.quantity-increase');
    const currentValue = parseInt(this.quantityInput.value);
    const maxValue = this.getCurrentVariantInventory();

    if (decreaseBtn) {
      decreaseBtn.disabled = currentValue <= 1;
    }

    if (increaseBtn) {
      increaseBtn.disabled = currentValue >= maxValue;
    }
  }

  updateVariantImage() {
    const selectedOption = document.querySelector('.variant-option.selected');
    if (!selectedOption || !selectedOption.dataset.image) return;

    const mainImage = document.querySelector('.product-media__main img');
    const newImageSrc = selectedOption.dataset.image;
    
    if (mainImage && newImageSrc) {
      mainImage.src = newImageSrc;
      
      // Update active thumbnail
      const thumbs = document.querySelectorAll('.product-media__thumb');
      thumbs.forEach(thumb => {
        thumb.classList.remove('active');
        if (thumb.querySelector('img').src === newImageSrc) {
          thumb.classList.add('active');
        }
      });
    }
  }

  getCurrentVariantInventory() {
    return this.currentVariant ? this.currentVariant.inventory : 999;
  }

  async addToCart() {
    if (!this.currentVariant || !this.currentVariant.available) return;

    this.setLoadingState(true);

    const formData = new FormData();
    formData.append('items[0][id]', this.currentVariant.id);
    formData.append('items[0][quantity]', this.quantityInput.value);

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        this.showNotification('Added to cart!', 'success');
        this.updateCartCount();
        
        // Trigger cart drawer open if it exists
        document.dispatchEvent(new CustomEvent('cart:refresh'));
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      this.showNotification('Failed to add to cart. Please try again.', 'error');
    } finally {
      this.setLoadingState(false);
    }
  }

  setLoadingState(loading) {
    if (loading) {
      this.addToCartBtn.disabled = true;
      this.addToCartBtn.innerHTML = '<span class="spinner"></span> Adding...';
    } else {
      this.updateAddToCartButton();
    }
  }

  showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type === 'error' ? 'notification--error' : ''}`;
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

  async updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      const cartCountElements = document.querySelectorAll('.cart-count');
      cartCountElements.forEach(element => {
        element.textContent = cart.item_count;
      });
    } catch (error) {
      console.error('Failed to update cart count:', error);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ProductPage();
}); 