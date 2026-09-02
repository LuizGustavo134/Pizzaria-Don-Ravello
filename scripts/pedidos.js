// =====================================================================
// GERENCIAMENTO DA FILA DE COMANDAS EM ESPERA (scripts/pedidos.js)
// =====================================================================

// Carrega todas as comandas do localStorage
function getFilaDePedidos() {
    return JSON.parse(localStorage.getItem('pedidos_em_espera')) || [];
}

// Salva a fila atualizada no localStorage
function salvarFilaDePedidos(pedidos) {
    localStorage.setItem('pedidos_em_espera', JSON.stringify(pedidos));
    renderizarFila();
}

// Renderiza os pedidos ordenando por prioridade FIFO (Mais antigos no topo)
function renderizarFila() {
    const queueContainer = document.getElementById('orders-queue');
    const waitingCount = document.getElementById('waiting-count');
    if (!queueContainer) return;

    let pedidos = getFilaDePedidos();

    // Ordenação FIFO: timestamps menores (mais antigos) vêm primeiro
    pedidos.sort((a, b) => a.timestamp - b.timestamp);

    waitingCount.innerText = pedidos.length;
    queueContainer.innerHTML = '';

    if (pedidos.length === 0) {
        queueContainer.innerHTML = '<p class="empty-state">Nenhum pedido em espera no momento.</p>';
        return;
    }

    pedidos.forEach((pedido, index) => {
        const isAltaPrioridade = index === 0; // O primeiro elemento da fila tem prioridade alta
        const dataFormatada = new Date(pedido.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const card = document.createElement('div');
        card.className = `order-card ${isAltaPrioridade ? 'high-priority' : ''}`;
        
        card.innerHTML = `
            <div class="order-header">
                <div>
                    <span class="order-id">Comanda #${pedido.id}</span>
                    <span style="font-size: 12px; color: #666; margin-left: 8px;">(${dataFormatada})</span>
                </div>
                <span class="priority-tag ${isAltaPrioridade ? 'high' : 'normal'}">
                    ${isAltaPrioridade ? '🔥 Alta Prioridade' : 'Aguardando'}
                </span>
            </div>

            <div class="order-items">
                ${pedido.itens.map(item => `
                    <div class="order-item-line">
                        <span><strong>${item.quantidade}x</strong> ${item.nome}</span>
                        <span>R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
                    </div>
                `).join('')}
            </div>

            <div class="order-footer">
                <div class="order-total">
                    Total: R$ ${pedido.total.toFixed(2).replace('.', ',')}
                </div>
                <div class="order-actions">
                    <button class="btn-cancel" onclick="recusarPedido('${pedido.id}')">Recusar</button>
                    <button class="btn-confirm" onclick="confirmarEGravarNoBD('${pedido.id}')">Confirmar & Gravar</button>
                </div>
            </div>
        `;

        queueContainer.appendChild(card);
    });
}

// AÇÃO 1: Confirmar o Pedido (Ponto de Integração com o Back-end)
async function confirmarEGravarNoBD(pedidoId) {
    let pedidos = getFilaDePedidos();
    const pedido = pedidos.find(p => p.id === pedidoId);

    if (!pedido) return;

    /* =================================================================
       FUTURA INTEGRAÇÃO COM SEU BACK-END:
       =================================================================
       try {
           const response = await fetch('https://sua-api.com/pedidos', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(pedido)
           });
           if (!response.ok) throw new Error('Erro ao salvar no banco');
       } catch (err) {
           alert('Falha ao gravar no Banco de Dados!');
           return;
       }
    ================================================================== */

    alert(`Comanda #${pedido.id} CONFIRMADA e enviada para gravação no Banco de Dados!`);

    // Remove da fila de espera do front-end
    pedidos = pedidos.filter(p => p.id !== pedidoId);
    salvarFilaDePedidos(pedidos);
}

// AÇÃO 2: Recusar/Cancelar Pedido
function recusarPedido(pedidoId) {
    if (confirm(`Deseja realmente recusar a Comanda #${pedidoId}?`)) {
        let pedidos = getFilaDePedidos();
        pedidos = pedidos.filter(p => p.id !== pedidoId);
        salvarFilaDePedidos(pedidos);
    }
}

// Inicializa a renderização do painel
document.addEventListener('DOMContentLoaded', renderizarFila);  