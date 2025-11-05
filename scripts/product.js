// --- product.js ---
// Executado apenas na página 'product.html'

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('product-detail-container');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    container.innerHTML = '<p class="loading-text">Produto não encontrado.</p>';
    return;
  }

  fetch('../data/products.json')
    .then(response => response.json())
    .then(products => {
      const product = products.find(p => p.id === productId);

      if (!product) {
        container.innerHTML = '<p class="loading-text">Produto não encontrado.</p>';
        return;
      }

      document.title = `AVS | ${product.name}`;
      
      drawProductDetails(container, product);
    })
    .catch(error => {
      console.error('Erro ao carregar produto:', error);
      container.innerHTML = '<p class="loading-text">Erro ao carregar produto.</p>';
    });
});

/**
 * "Desenha" o HTML do produto no container
 */
function drawProductDetails(container, product) {
  
  const isSoldOut = product.status === 'sold_out';

  const mediaGalleryHTML = buildMediaGallery(product.media, isSoldOut);
  const colorSelectorHTML = buildColorSwatches(product.colors, isSoldOut);

  const sizeButtonsHTML = product.sizes.map(size => {
    const isDisabled = isSoldOut || !size.available;
    const disabledClass = isDisabled ? 'disabled' : '';
    return `<button class="size-btn ${disabledClass}" data-size="${size.name}">${size.name}</button>`;
  }).join('');

  
  let addToCartBtnHTML = '';
  if (isSoldOut) {
    addToCartBtnHTML = `
      <button id="add-to-cart-btn" class="btn btn-primary add-to-cart-btn sold-out" disabled>
        ESGOTADO
      </button>
    `;
  } else {
    // 💡 NOVO: Adicionamos o seletor de quantidade ANTES do botão
    addToCartBtnHTML = `
      <div class="product-quantity-selector">
        <h3>Amount:</h3>
        <div class="quantity-selector">
          <button id="quantity-decrease" class="quantity-btn" aria-label="Diminuir quantidade">-</button>
          <span id="quantity-value" class="quantity-value">1</span>
          <button id="quantity-increase" class="quantity-btn" aria-label="Aumentar quantidade">+</button>
        </div>
      </div>
      <div id="form-error-message" class="form-error-message"></div>
      <button id="add-to-cart-btn" class="btn btn-primary add-to-cart-btn">
        Adicionar ao carrinho
      </button>
    `;
  }

  const detailHTML = `
    <div class="product-detail-grid">
      ${mediaGalleryHTML}
      
      <div class="product-detail-content">
        <h1>${product.name}</h1>
        <p class="product-detail-drop">${product.dropName || ''}</p> 
        <p class="price">R$ ${product.price.toFixed(2)}</p>
        <p class="description">${product.description}</p>

        ${colorSelectorHTML}
        
        <div class="product-detail-sizes">
          <h3>Tamanho:</h3>
          <div class="size-selector">
            ${sizeButtonsHTML}
          </div>
        </div>
        
        ${addToCartBtnHTML}
      </div>
    </div>
  `;
  
  container.innerHTML = detailHTML;

  // --- LÓGICA DE LISTENERS (CLIQUES) ---
  
  addGalleryListeners();
  
  let selectedColor = null;
  let selectedSize = null;
  let currentQuantity = 1; // 💡 NOVO: Estado da quantidade
  
  const colorSelector = container.querySelector('.color-selector');
  const sizeSelector = container.querySelector('.size-selector');
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  const errorEl = document.getElementById('form-error-message');
  
  // 💡 NOVO: Listeners para o seletor de quantidade
  const quantityValueEl = document.getElementById('quantity-value');
  const decreaseBtn = document.getElementById('quantity-decrease');
  const increaseBtn = document.getElementById('quantity-increase');

  if (decreaseBtn && increaseBtn) {
    decreaseBtn.addEventListener('click', () => {
      if (currentQuantity > 1) {
        currentQuantity--;
        quantityValueEl.textContent = currentQuantity;
      }
    });
    increaseBtn.addEventListener('click', () => {
      currentQuantity++;
      quantityValueEl.textContent = currentQuantity;
    });
  }
  // --- Fim da nova lógica de quantidade ---


  // Lógica para selecionar a cor
  if (colorSelector) {
    colorSelector.addEventListener('click', (e) => {
      const target = e.target.closest('.color-swatch'); 
      if (target && !target.classList.contains('disabled')) {
        colorSelector.querySelectorAll('.color-swatch').forEach(btn => {
          btn.classList.remove('selected');
        });
        target.classList.add('selected');
        selectedColor = target.dataset.color;
        errorEl.classList.remove('visible'); 
      }
    });
  }

  // Lógica para selecionar o tamanho
  if (sizeSelector) {
    sizeSelector.addEventListener('click', (e) => {
      if (e.target.classList.contains('size-btn') && !e.target.classList.contains('disabled')) {
        sizeSelector.querySelectorAll('.size-btn').forEach(btn => {
          btn.classList.remove('selected');
        });
        e.target.classList.add('selected');
        selectedSize = e.target.dataset.size;
        errorEl.classList.remove('visible');
      }
    });
  }
  
  // Lógica para adicionar ao carrinho
  if (!isSoldOut && addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      
      // Validação de Cor
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        errorEl.textContent = 'Por favor, selecione uma cor.';
        errorEl.classList.add('visible');
        return;
      }
      // Validação de Tamanho
      if (!selectedSize) {
        errorEl.textContent = 'Por favor, selecione um tamanho.';
        errorEl.classList.add('visible');
        return;
      }
      
      errorEl.classList.remove('visible'); 
      
      // 💡 MUDANÇA: Passa a 'currentQuantity' para o cart.js
      window.cartLogic.addToCart(product, selectedSize, selectedColor, currentQuantity);
      
      addToCartBtn.textContent = 'Adicionado!';
      addToCartBtn.classList.add('success');
      
      setTimeout(() => {
        addToCartBtn.textContent = 'Adicionar ao carrinho';
        addToCartBtn.classList.remove('success');
      }, 2000);
    });
  }
}

// ... (Restante do arquivo 'product.js': buildMediaGallery, buildColorSwatches, addGalleryListeners, getHexColor)
// ... (O código dessas funções não muda, cole-o aqui)
// (Vou colar para garantir que você tenha o arquivo completo)

/**
 * Constrói o HTML da galeria de mídia
 */
function buildMediaGallery(media, isSoldOut) {
  if (!media || media.length === 0) {
    return '<div class="product-detail-image-wrapper"></div>'; 
  }

  const firstMedia = media[0];
  let mainMediaHTML = '';

  if (firstMedia.type === 'image') {
    mainMediaHTML = `<img src="${firstMedia.url}" alt="Imagem principal do produto" class="product-detail-image" />`;
  } else if (firstMedia.type === 'video') {
    mainMediaHTML = `
      <div class="product-detail-video-wrapper">
        <iframe 
          src="${firstMedia.url}" 
          title="Vídeo do produto" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>
    `;
  }

  const thumbnailsHTML = media.map((item, index) => {
    const thumbContent = item.type === 'image' 
      ? `<img src="${item.url}" alt="Miniatura ${index + 1}" />`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`; // Ícone de Play

    return `
      <button class="thumbnail-btn ${index === 0 ? 'active' : ''}" 
              data-type="${item.type}" 
              data-url="${item.url}">
        ${thumbContent}
      </button>
    `;
  }).join('');

  return `
    <div class="media-gallery">
      <div id="main-media-wrapper" class="product-detail-image-wrapper">
        ${isSoldOut ? '<div class="sold-out-badge">ESGOTADO</div>' : ''}
        ${mainMediaHTML}
      </div>
      ${media.length > 1 ? `<div class="thumbnail-list">${thumbnailsHTML}</div>` : ''}
    </div>
  `;
}

/**
 * Constrói o HTML dos seletores de cor
 */
function buildColorSwatches(colors, isSoldOut) {
  if (!colors || colors.length === 0) {
    return ''; // Não mostra nada se não houver cores
  }

  const swatchesHTML = colors.map(color => {
    const isDisabled = isSoldOut || !color.available;
    const disabledClass = isDisabled ? 'disabled' : '';

    return `
      <button class="color-swatch ${disabledClass}" 
              data-color="${color.name}" 
              title="${color.name}">
        <span class="color-swatch-inner" style="background-color: ${getHexColor(color.name)};"></span>
      </button>
    `;
  }).join('');

  return `
    <div class="product-detail-colors">
      <h3>Cor:</h3>
      <div class="color-selector">
        ${swatchesHTML}
      </div>
    </div>
  `;
}

/**
 * Adiciona lógica de clique para a galeria
 */
function addGalleryListeners() {
  const mainMediaWrapper = document.getElementById('main-media-wrapper');
  const thumbnailList = document.querySelector('.thumbnail-list');

  if (!thumbnailList || !mainMediaWrapper) {
    return; // Não faz nada se não houver thumbnails
  }

  thumbnailList.addEventListener('click', (e) => {
    const target = e.target.closest('.thumbnail-btn');
    if (!target) return;

    thumbnailList.querySelectorAll('.thumbnail-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    target.classList.add('active');

    const type = target.dataset.type;
    const url = target.dataset.url;
    
    const soldOutBadge = mainMediaWrapper.querySelector('.sold-out-badge');

    let newMediaHTML = '';

    if (type === 'image') {
      newMediaHTML = `<img src="${url}" alt="Imagem principal do produto" class="product-detail-image" />`;
    } else if (type === 'video') {
      newMediaHTML = `
        <div class="product-detail-video-wrapper">
          <iframe 
            src="${url}" 
            title="Vídeo do produto" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      `;
    }

    mainMediaWrapper.innerHTML = '';
    if (soldOutBadge) {
      mainMediaWrapper.appendChild(soldOutBadge); 
    }
    mainMediaWrapper.insertAdjacentHTML('beforeend', newMediaHTML);
  });
}

/**
 * Helper para transformar "Preto" em "#000000"
 */
function getHexColor(colorName) {
  switch (colorName.toLowerCase()) {
    case 'preto': return '#000000';
    case 'branco': return '#FFFFFF';
    case 'cinza mescla': return '#BDBDBD';
    
    default: return colorName; 
  }
}