// --- cart.js ---
// Responsável por toda a lógica de gerenciamento do carrinho.

// -----------------------------------------------------------------
// ⚠️ ATENÇÃO: INSIRA SEU NÚMERO DE WHATSAPP AQUI
// -----------------------------------------------------------------
const WPP_NUMBER = '5522988152466'; 

/**
 * Pega os itens do carrinho do localStorage.
 */
function getCartItems() {
  const items = localStorage.getItem('avs_cart');
  return items ? JSON.parse(items) : [];
}

/**
 * Salva os itens do carrinho no localStorage.
 */
function saveCartItems(items) {
  localStorage.setItem('avs_cart', JSON.stringify(items));
  // Atualiza a UI sempre que o carrinho for salvo
  if (window.updateCartUI) {
    window.updateCartUI();
  }
}

/**
 * Helper para "traduzir" o código hex de volta para um nome
 */
function getColorName(hexCode) {
  if (!hexCode) return ''; 
  
  // Mapeia os códigos hex para nomes amigáveis
  switch (hexCode.toLowerCase()) {
    case '#000000': return 'Preto';
    case '#ffffff': return 'Branco';
    case '#bdbdbd': return 'Cinza Mescla';
    // Adicione mais traduções se você usar mais hex codes no JSON
    // Ex: case '#f5f5dc': return 'Bege';
    
    default: return hexCode; // Se não for um hex conhecido, mostra o código
  }
}


/**
 * Adiciona um produto ao carrinho.
 */
function addToCart(product, size, color, quantity = 1) { // quantity = 1 é o padrão
  const cartItems = getCartItems();
  
  const cartId = product.id + '-' + size + '-' + (color || 'default');

  const existingItemIndex = cartItems.findIndex(item => item.cartId === cartId);

  if (existingItemIndex > -1) {
    cartItems[existingItemIndex].quantity += quantity;
  } else {
    cartItems.push({
      cartId: cartId,
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.media[0].url, 
      selectedSize: size,
      selectedColor: color, // Salva a cor (ex: #000000)
      quantity: quantity // Salva a quantidade
    });
  }

  saveCartItems(cartItems);
}

/**
 * Remove um item do carrinho.
 */
function removeFromCart(cartId) {
  let cartItems = getCartItems();
  cartItems = cartItems.filter(item => item.cartId !== cartId);
  saveCartItems(cartItems);
}

/**
 * Atualiza a quantidade de um item específico no carrinho
 */
function updateItemQuantity(cartId, newQuantity) {
  let cartItems = getCartItems();
  
  if (newQuantity <= 0) {
    removeFromCart(cartId);
    return;
  }
  
  const itemIndex = cartItems.findIndex(item => item.cartId === cartId);
  if (itemIndex > -1) {
    cartItems[itemIndex].quantity = newQuantity;
    saveCartItems(cartItems);
  }
}


/**
 * Calcula o preço total do carrinho.
 */
function getTotalPrice() {
  const cartItems = getCartItems();
  return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Gera o link de checkout para o WhatsApp.
 */
function generateWhatsAppLink() {
  const cartItems = getCartItems();
  const total = getTotalPrice();

  const itemsMessage = cartItems.map(item => {
      let itemString = `${item.quantity}x ${item.name}`;
      
      if (item.selectedColor) {
        itemString += ` (Cor: ${getColorName(item.selectedColor)})`;
      }
      
      itemString += ` (Tamanho: ${item.selectedSize})`;
      itemString += ` - R$ ${item.price.toFixed(2)}`;
      
      return itemString;
    })
    .join('\n'); 

  const finalMessage = `Olá AVS, gostaria de finalizar a compra destes itens:
-------------------------
${itemsMessage}
-------------------------
*Total: R$ ${total.toFixed(2)}*
`;

  const encodedMessage = encodeURIComponent(finalMessage);

  return `https://wa.me/${WPP_NUMBER}?text=${encodedMessage}`;
}

// Expõe as funções globalmente
window.cartLogic = {
  getCartItems,
  addToCart,
  removeFromCart,
  getTotalPrice,
  generateWhatsAppLink,
  updateItemQuantity,
  getColorName // 💡 --- AQUI ESTÁ A CORREÇÃO --- 💡
};