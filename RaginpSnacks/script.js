// Classe principal do sistema PDV
class POSSystem {
    constructor() {
        this.products = {
            normal: { name: 'Salgado Normal', price: 1.80 },
            festa: { name: 'Mini Festa', price: 0.70 }
        };
        
        this.order = {
            normal: 0,
            festa: 0
        };
        
        this.total = 0;
        this.payment = 0;
        this.change = 0;
        
        this.init();
    }
    
    init() {
        // Inicializa os event listeners
        this.setupEventListeners();
        this.updateOrderSummary();
    }
    
    setupEventListeners() {
        // Event listener para o campo de pagamento
        const paymentInput = document.getElementById('payment-amount');
        paymentInput.addEventListener('input', () => {
            this.calculateChange();
        });
        
        // Event listener para teclas no campo de pagamento
        paymentInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.processPayment();
            }
        });
    }
    
    increaseQuantity(productType) {
        this.order[productType]++;
        this.updateQuantityDisplay(productType);
        this.updateOrderSummary();
        this.calculateChange();
    }
    
    decreaseQuantity(productType) {
        if (this.order[productType] > 0) {
            this.order[productType]--;
            this.updateQuantityDisplay(productType);
            this.updateOrderSummary();
            this.calculateChange();
        }
    }
    
    updateQuantityDisplay(productType) {
        const qtyInput = document.getElementById(`${productType}-qty`);
        qtyInput.value = this.order[productType];
    }
    
    setQuantity(productType, value) {
        const quantity = parseInt(value) || 0;
        if (quantity >= 0) {
            this.order[productType] = quantity;
            this.updateQuantityDisplay(productType);
            this.updateOrderSummary();
            this.calculateChange();
        }
    }
    
    calculateTotal() {
        this.total = 0;
        for (const [productType, quantity] of Object.entries(this.order)) {
            this.total += quantity * this.products[productType].price;
        }
        return this.total;
    }
    
    updateOrderSummary() {
        const orderSummary = document.getElementById('order-summary');
        const totalAmount = document.getElementById('total-amount');
        
        // Calcula o total
        this.calculateTotal();
        
        // Atualiza o display do total
        totalAmount.textContent = this.formatCurrency(this.total);
        
        // Verifica se há itens no pedido
        const hasItems = Object.values(this.order).some(qty => qty > 0);
        
        if (!hasItems) {
            orderSummary.innerHTML = '<div class="empty-order"><p>Nenhum item selecionado</p></div>';
            return;
        }
        
        // Gera o HTML dos itens do pedido
        let orderHTML = '';
        for (const [productType, quantity] of Object.entries(this.order)) {
            if (quantity > 0) {
                const product = this.products[productType];
                const itemTotal = quantity * product.price;
                
                orderHTML += `
                    <div class="order-item">
                        <div class="item-info">
                            <div class="item-name">${product.name}</div>
                            <div class="item-details">${quantity} x ${this.formatCurrency(product.price)}</div>
                        </div>
                        <div class="item-total">${this.formatCurrency(itemTotal)}</div>
                    </div>
                `;
            }
        }
        
        orderSummary.innerHTML = orderHTML;
    }
    
    calculateChange() {
        const paymentInput = document.getElementById('payment-amount');
        const changeDisplay = document.getElementById('change-display');
        const changeAmount = document.getElementById('change-amount');
        const errorMessage = document.getElementById('error-message');
        
        // Limpa mensagens de erro
        this.hideError();
        
        // Pega o valor do pagamento
        this.payment = parseFloat(paymentInput.value) || 0;
        
        // Se não há valor de pagamento, esconde o display de troco
        if (this.payment === 0) {
            changeDisplay.classList.remove('visible');
            return;
        }
        
        // Calcula o troco
        this.change = this.payment - this.total;
        
        // Atualiza o display
        changeAmount.textContent = this.formatCurrency(this.change);
        
        // Mostra ou esconde o display de troco baseado no valor
        if (this.payment > 0) {
            changeDisplay.classList.add('visible');
            
            // Muda a cor baseado se é troco positivo ou negativo
            if (this.change < 0) {
                changeDisplay.style.background = 'hsl(0 84% 60%)'; // Vermelho para valor insuficiente
            } else {
                changeDisplay.style.background = 'hsl(142 76% 36%)'; // Verde para troco
            }
        }
    }
    
    processPayment() {
        const errorMessage = document.getElementById('error-message');
        
        // Verifica se há itens no pedido
        if (this.total === 0) {
            this.showError('Adicione itens ao pedido antes de finalizar a venda.');
            return;
        }
        
        // Verifica se o valor do pagamento foi inserido
        if (this.payment === 0) {
            this.showError('Insira o valor recebido do cliente.');
            document.getElementById('payment-amount').focus();
            return;
        }
        
        // Verifica se o pagamento é suficiente
        if (this.change < 0) {
            this.showError(`Valor insuficiente. Faltam ${this.formatCurrency(Math.abs(this.change))}.`);
            return;
        }
        
        // Processa a venda
        this.completeSale();
    }
    
    completeSale() {
        // Mostra mensagem de sucesso
        const changeText = this.change > 0 ? `\nTroco: ${this.formatCurrency(this.change)}` : '';
        
        alert(`Venda finalizada com sucesso!\n\nTotal: ${this.formatCurrency(this.total)}\nRecebido: ${this.formatCurrency(this.payment)}${changeText}\n\nObrigado pela preferência!`);
        
        // Limpa o pedido
        this.clearOrder();
    }
    
    clearOrder() {
        // Reseta todas as quantidades
        this.order = { normal: 0, festa: 0 };
        
        // Atualiza os displays de quantidade
        for (const productType of Object.keys(this.products)) {
            this.updateQuantityDisplay(productType);
        }
        
        // Limpa o campo de pagamento
        document.getElementById('payment-amount').value = '';
        
        // Reseta valores
        this.total = 0;
        this.payment = 0;
        this.change = 0;
        
        // Atualiza a interface
        this.updateOrderSummary();
        
        // Esconde o display de troco
        const changeDisplay = document.getElementById('change-display');
        changeDisplay.classList.remove('visible');
        
        // Limpa mensagens de erro
        this.hideError();
    }
    
    showError(message) {
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // Remove a mensagem de erro após 5 segundos
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }
    
    hideError() {
        const errorMessage = document.getElementById('error-message');
        errorMessage.style.display = 'none';
    }
    
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
}

// Instância global do sistema
let posSystem;

// Funções globais para os botões (chamadas pelo HTML)
function increaseQuantity(productType) {
    posSystem.increaseQuantity(productType);
}

function decreaseQuantity(productType) {
    posSystem.decreaseQuantity(productType);
}

function processPayment() {
    posSystem.processPayment();
}

function clearOrder() {
    posSystem.clearOrder();
}

function setQuantity(productType, value) {
    posSystem.setQuantity(productType, value);
}

function handleQuantityKeydown(event, productType) {
    if (event.key === 'Enter') {
        event.target.blur();
    }
}

function handleQuickAdd(event, productType) {
    if (event.key === 'Enter') {
        const quantity = parseInt(event.target.value) || 0;
        if (quantity > 0) {
            posSystem.order[productType] += quantity;
            posSystem.updateQuantityDisplay(productType);
            posSystem.updateOrderSummary();
            posSystem.calculateChange();
            event.target.value = '';
        }
    }
}

// Inicializa o sistema quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    posSystem = new POSSystem();
});

// Event listeners adicionais para melhor UX
document.addEventListener('keydown', (e) => {
    // Verifica se o foco está em um campo de input para não interferir
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
    
    // Atalhos de teclado com Ctrl
    if (e.ctrlKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                increaseQuantity('normal');
                break;
            case '2':
                e.preventDefault();
                increaseQuantity('festa');
                break;
            case 'Enter':
                e.preventDefault();
                processPayment();
                break;
            case 'Delete':
                e.preventDefault();
                clearOrder();
                break;
        }
        return;
    }
    
    // Atalhos do teclado numérico (apenas quando não está digitando em um campo)
    if (!isInputFocused) {
        switch(e.key) {
            case '1':
            case 'Numpad1':
                e.preventDefault();
                increaseQuantity('normal');
                break;
            case '2':
            case 'Numpad2':
                e.preventDefault();
                increaseQuantity('festa');
                break;
            case '-':
            case 'NumpadSubtract':
                e.preventDefault();
                // Remove um item do último produto adicionado
                if (posSystem.order.normal > 0) {
                    decreaseQuantity('normal');
                } else if (posSystem.order.festa > 0) {
                    decreaseQuantity('festa');
                }
                break;
            case '+':
            case 'NumpadAdd':
                e.preventDefault();
                // Adiciona um salgado normal (produto principal)
                increaseQuantity('normal');
                break;
            case 'Enter':
            case 'NumpadEnter':
                e.preventDefault();
                processPayment();
                break;
            case 'Delete':
            case 'NumpadDecimal':
                e.preventDefault();
                clearOrder();
                break;
            case '0':
            case 'Numpad0':
                e.preventDefault();
                // Foca no campo de pagamento
                document.getElementById('payment-amount').focus();
                break;
            case 'Escape':
                e.preventDefault();
                clearOrder();
                break;
        }
    }
    
    // Atalho para finalizar venda quando estiver no campo de pagamento
    if (isInputFocused && activeElement.id === 'payment-amount' && e.key === 'Enter') {
        e.preventDefault();
        processPayment();
    }
});

// Função para garantir que inputs numéricos aceitem apenas números
document.addEventListener('input', (e) => {
    if (e.target.type === 'number') {
        // Remove valores negativos
        if (e.target.value < 0) {
            e.target.value = 0;
        }
    }
});
