// --- main.js ---
// Executado em TODAS as páginas.
// Responsável por carregar componentes (header/footer/menu) e gerenciar o Carrinho (UI).

document.addEventListener('DOMContentLoaded', () => {
  
  const pathPrefix = document.body.dataset.pathPrefix || '.';

  // --- LÓGICA DE LINKS ---
  let logoPath, shopPath, termsPath, collectionPath;
  
  if (pathPrefix === '.') {
    logoPath = 'index.html';
    shopPath = 'pages/shop.html';
    termsPath = 'pages/terms.html';
    collectionPath = 'pages/collection.html'; 
  } else { 
    logoPath = '../index.html';
    shopPath = 'shop.html'; 
    termsPath = 'terms.html';
    collectionPath = 'collection.html'; 
  }
  
  const instaPath = 'https://www.instagram.com/SEU_USUARIO_AQUI';
  // --- FIM DA LÓGICA DE LINKS ---


  // 1. Carrega o Header
  fetch(`${pathPrefix}/components/header.html`)
    .then(response => response.text())
    .then(data => {
      const processedData = data
        .replace('%%LOGO_PATH%%', logoPath)
        .replace('%%SHOP_PATH%%', shopPath); 
        
      document.getElementById('header-placeholder').innerHTML = processedData;
      
      addCartButtonListener();
      addMenuButtonListeners(); 
    });

  // 2. Carrega o Footer
  fetch(`${pathPrefix}/components/footer.html`)
    .then(response => response.text())
    .then(data => {
      const processedData = data
        .replace('%%INSTA_PATH%%', instaPath)
        .replace('%%TERMS_PATH%%', termsPath); 

      document.getElementById('footer-placeholder').innerHTML = processedData;
      document.getElementById('current-year').textContent = new Date().getFullYear();
    });

  // 3. Carrega o Menu Overlay (Oculto)
  fetch(`${pathPrefix}/components/menu-overlay.html`)
    .then(response => response.text())
    .then(data => {
      const processedData = data
        .replace(/%%SHOP_PATH%%/g, shopPath) // /g = substituir todos
        .replace(/%%COLLECTION_PATH%%/g, collectionPath); 
      
      const placeholder = document.getElementById('menu-overlay-placeholder');
      if (placeholder) {
        placeholder.innerHTML = processedData;
        addMenuButtonListeners(); // Adiciona listener de fechar
      }
    });

  // 4. Cria e insere o HTML do Cart Drawer (Carrinho)
  createCartDrawer();
  
  // 5. Atualiza a UI do carrinho (badge e itens)
  updateCartUI();

  // 6. Atualiza os caminhos do Favicon
  const faviconLinks = document.querySelectorAll('link[rel="apple-touch-icon"], link[rel="icon"], link[rel="manifest"]');
  faviconLinks.forEach(link => {
    let originalHref = link.getAttribute('href');
    if (originalHref.includes('%%FAVICON_PATH%%')) {
      let faviconPath = pathPrefix === '.' ? 'assets/favicon' : '../assets/favicon';
      let newHref = originalHref.replace('%%FAVICON_PATH%%', faviconPath);
      link.setAttribute('href', newHref);
    }
  });

});

/**
 * Adiciona os listeners para abrir/fechar o carrinho.
 */
function addCartButtonListener() {
  const openBtn = document.getElementById('open-cart-btn');
  const closeBtn = document.getElementById('cart-close-btn');
  const overlay = document.getElementById('cart-drawer-overlay');

  if (openBtn) {
    openBtn.onclick = openCart;
  }
  if (closeBtn) {
    closeBtn.onclick = closeCart;
  }
  if (overlay) {
    overlay.onclick = closeCart;
  }
}

/**
 * Adiciona listeners para abrir/fechar o menu principal.
 */
function addMenuButtonListeners() {
  const openBtn = document.getElementById('open-menu-btn');
  const closeBtn = document.getElementById('close-menu-btn');
  const overlay = document.getElementById('menu-overlay');

  if (openBtn) {
    openBtn.onclick = openMenu;
  }
  if (closeBtn) {
    closeBtn.onclick = closeMenu;
  }
}

/**
 * Cria o HTML do drawer do carrinho e injeta no placeholder.
 */
function createCartDrawer() {
  const placeholder = document.getElementById('cart-drawer-placeholder');
  if (!placeholder) return;
  const drawerHTML = `
    <div id="cart-drawer-overlay" class="cart-drawer-overlay"></div>
    <div id="cart-drawer" class="cart-drawer">
      <div class="cart-header">
        <h2>Meu Carrinho</h2>
        <button id="cart-close-btn" aria-label="Fechar carrinho">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div id="cart-body" class="cart-body"></div>
      <div id="cart-footer" class="cart-footer"></div>
    </div>
  `;
  placeholder.innerHTML = drawerHTML;
}

/**
 * Abre o drawer do carrinho.
 */
function openCart() {
  document.body.classList.add('cart-open');
}

/**
 * Fecha o drawer do carrinho.
 */
function closeCart() {
  document.body.classList.remove('cart-open');
}

/**
 * Abre o menu principal.
 */
function openMenu() {
  document.body.classList.add('menu-open');
}

/**
 * Fecha o menu principal.
 */
function closeMenu() {
  document.body.classList.remove('menu-open');
}


/**
 * 💡 ATUALIZADO: Esta função foi reescrita
 * ATUALIZA A UI DO CARRINHO (Contador e Itens no Drawer)
 */
function updateCartUI() {
  const cartItems = window.cartLogic.getCartItems();
  const totalPrice = window.cartLogic.getTotalPrice();

  // 1. Atualiza o Badge do Header
  const badge = document.getElementById('cart-count-badge');
  if (badge) {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
    if (totalItems > 0) {
      badge.classList.add('visible');
    } else {
      badge.classList.remove('visible');
    }
  }

  // 2. Atualiza o Corpo do Drawer
  const cartBody = document.getElementById('cart-body');
  if (!cartBody) return;

  if (cartItems.length === 0) {
    cartBody.innerHTML = '<p class="cart-empty-message">Seu carrinho está vazio.</p>';
  } else {
    // 💡 NOVO: HTML atualizado com seletor de quantidade e ícone "X"
    cartBody.innerHTML = cartItems.map(item => {
      // Constrói a string de Cor + Tamanho
      let details = `Tam: ${item.selectedSize}`;
      if (item.selectedColor) {
        // Usa a função "tradutora" do cart.js
        details = `Cor: ${window.cartLogic.getColorName(item.selectedColor)} | ${details}`;
      }
      
      return `
      <div class="cart-item">
        <img src="${item.image || (item.media && item.media[0].url)}" alt="${item.name}" class="cart-item-image" />
        <div class="cart-item-info">
          <h3>${item.name}</h3>
          <p>${details}</p>
          <p class="price">R$ ${item.price.toFixed(2)}</p>
          
          <div class="cart-item-controls">
            <div class="quantity-selector">
              <button class="quantity-btn" aria-label="Diminuir quantidade" 
                      onclick="window.cartLogic.updateItemQuantity('${item.cartId}', ${item.quantity - 1})">
                -
              </button>
              <span class="quantity-value">${item.quantity}</span>
              <button class="quantity-btn" aria-label="Aumentar quantidade"
                      onclick="window.cartLogic.updateItemQuantity('${item.cartId}', ${item.quantity + 1})">
                +
              </button>
            </div>
          </div>
        </div>
        
        <button class="cart-item-remove-btn" onclick="window.cartLogic.removeFromCart('${item.cartId}')" aria-label="Remover item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `}).join('');
  }
  
  // 3. Atualiza o Footer do Drawer
  const cartFooter = document.getElementById('cart-footer');
  if (!cartFooter) return;
  
  if (cartItems.length > 0) {
    const whatsappLink = window.cartLogic.generateWhatsAppLink();
    cartFooter.innerHTML = `
      <div class="cart-total">
        <span class="label">Total</span>
        <span class="amount">R$ ${totalPrice.toFixed(2)}</span>
      </div>
      <a 
        href="${whatsappLink}" 
        class="btn btn-primary checkout-btn" 
        target="_blank"
        onclick="closeCart()"
      >
        Finalizar Compra
      </a>
    `;
    cartFooter.style.display = 'block';
  } else {
    cartFooter.innerHTML = '';
    cartFooter.style.display = 'none';
  }
}

// Expõe a função globalmente para que o cart.js possa chamá-la
window.updateCartUI = updateCartUI;

// Define o pathPrefix para páginas em subdiretórios
(function() {
  if (window.location.pathname.includes('/pages/')) {
    document.body.dataset.pathPrefix = '..';
  } else {
    document.body.dataset.pathPrefix = '.';
  }
})();