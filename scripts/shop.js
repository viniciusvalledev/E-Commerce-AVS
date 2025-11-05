// --- shop.js ---
// Executado apenas na página 'shop.html'

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('product-grid');
  if (!grid) return; // Sai se não encontrar a grid

  fetch('../data/products.json')
    .then(response => response.json())
    .then(products => {
      if (products.length === 0) {
        grid.innerHTML = '<p class="loading-text">Nenhum produto encontrado.</p>';
        return;
      }
      
      // "Desenha" os cards de produto
      const cardsHTML = products.map(product => {
        
        // Lógica para o status "Esgotado"
        const isSoldOut = product.status === 'sold_out';
        
        // Adiciona uma classe CSS se estiver esgotado
        const soldOutClass = isSoldOut ? 'sold-out' : '';
        
        // Cria o selo "Esgotado"
        const soldOutBadge = isSoldOut ? '<div class="sold-out-badge">ESGOTADO</div>' : '';

        return `
          <a href="product.html?id=${product.id}" class="product-card ${soldOutClass}">
            <div class="product-card-image-wrapper">
              ${soldOutBadge}
              <img src="${product.image}" alt="${product.name}" class="product-card-image" loading="lazy" />
            </div>
            <div classV="product-card-info">
              <h3 class="product-card-name">${product.name}</h3>
              
              <p class="product-card-drop">${product.dropName || ''}</p> 
              
              <p class="product-card-price">R$ ${product.price.toFixed(2)}</p>
            </div>
          </a>
        `
      }).join('');
      
      grid.innerHTML = cardsHTML;
    })
    .catch(error => {
      console.error('Erro ao carregar produtos:', error);
      grid.innerHTML = '<p class="loading-text">Erro ao carregar produtos. Tente novamente.</p>';
    });
});