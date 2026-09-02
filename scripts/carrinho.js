let pizzaMontada = [];
const MAX_PARTES = 4; // 1/4 = 1 parte | 1/2 = 2 partes

// ==========================================
// GERENCIAMENTO DO CARRINHO (LocalStorage)
// ==========================================

function getCarrinho() {
    return JSON.parse(localStorage.getItem('carrinho')) || [];
}

function salvarCarrinho(carrinho) {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContadorHeader();
}

function atualizarContadorHeader() {
    const countEl = document.getElementById('cart-count');
    if (!countEl) return;

    const carrinho = getCarrinho();
    countEl.innerText = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
}

// ==========================================
// MONTADOR DE PIZZA (Cardápio)
// ==========================================

function adicionarFracaoSabor(nome, preco, partes) {
    const partesAtuais = pizzaMontada.reduce((acc, item) => acc + item.partes, 0);

    if (partesAtuais + partes > MAX_PARTES) {
        const espacoRestante = MAX_PARTES - partesAtuais;
        if (espacoRestante === 0) {
            alert("A pizza já está completa. Remova algum sabor para alterar.");
        } else {
            alert(`Sua pizza só tem espaço para mais ${espacoRestante === 1 ? '1/4' : '1/2'}.`);
        }
        return;
    }

    pizzaMontada.push({
        nome: nome,
        preco: parseFloat(preco),
        partes: partes,
        textoFracao: partes === 2 ? '1/2' : '1/4'
    });

    atualizarMontadorUI();
}

function removerFracaoSabor(index) {
    pizzaMontada.splice(index, 1);
    atualizarMontadorUI();
}

function atualizarMontadorUI() {
    const listEl = document.getElementById('selected-flavors-list');
    const badgeEl = document.getElementById('fraction-badge');
    const priceEl = document.getElementById('custom-pizza-price');
    const btnAdd = document.getElementById('btn-add-custom');

    // Executa apenas se os elementos existirem na página atual
    if (!listEl || !badgeEl || !priceEl || !btnAdd) return;

    const totalPartes = pizzaMontada.reduce((acc, item) => acc + item.partes, 0);

    if (totalPartes === 0) {
        badgeEl.innerText = "0 / 4 partes (Vazia)";
        badgeEl.style.background = "#888";
    } else if (totalPartes < MAX_PARTES) {
        badgeEl.innerText = `${totalPartes} / 4 partes (Incompleta)`;
        badgeEl.style.background = "#e67e22";
    } else {
        badgeEl.innerText = "4 / 4 partes (Completa)";
        badgeEl.style.background = "rgb(16, 86, 82)";
    }

    if (pizzaMontada.length > 0) {
        const maiorPreco = Math.max(...pizzaMontada.map(item => item.preco));
        priceEl.innerText = `R$ ${maiorPreco.toFixed(2).replace('.', ',')}`;
    } else {
        priceEl.innerText = "R$ 0,00";
    }

    btnAdd.disabled = totalPartes !== MAX_PARTES;

    if (pizzaMontada.length === 0) {
        listEl.innerHTML = '<p class="empty-msg">Sua pizza está vazia. Escolha 1/2 ou 1/4 dos sabores abaixo.</p>';
    } else {
        listEl.innerHTML = pizzaMontada.map((item, idx) => `
            <div class="flavor-chip">
                <span><strong>[${item.textoFracao}]</strong> ${item.nome}</span>
                <button onclick="removerFracaoSabor(${idx})" title="Remover">X</button>
            </div>
        `).join('');
    }
}

function adicionarPizzaMontadaAoCarrinho() {
    const totalPartes = pizzaMontada.reduce((acc, item) => acc + item.partes, 0);
    if (totalPartes !== MAX_PARTES) return;

    const descricaoSabores = pizzaMontada.map(item => `${item.textoFracao} ${item.nome}`).join(' + ');
    const maiorPreco = Math.max(...pizzaMontada.map(item => item.preco));

    let carrinho = getCarrinho();
    carrinho.push({
        nome: `Pizza Mista (${descricaoSabores})`,
        preco: maiorPreco,
        quantidade: 1
    });

    salvarCarrinho(carrinho);
    pizzaMontada = [];
    atualizarMontadorUI();

    alert("Pizza adicionada ao carrinho com sucesso!");
}

function enviarCarrinhoParaFilaDeEspera() {
    const carrinho = getCarrinho();

    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio.");
        return;
    }

    const campoNome = document.getElementById('cliente-nome');
    const campoEndereco = document.getElementById('cliente-endereco');
    const campoPagamento = document.getElementById('cliente-pagamento');

    if (!campoNome || !campoEndereco || !campoPagamento) {
        alert("Erro ao localizar o formulário do cliente na página.");
        return;
    }

    const nomeCliente = campoNome.value.trim();
    const enderecoCliente = campoEndereco.value.trim();
    const pagamentoCliente = campoPagamento.value;

    if (!nomeCliente || !enderecoCliente) {
        alert("Preencha seu nome e endereço antes de enviar o pedido.");
        return;
    }

    const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    const taxaEntrega = 5.00;
    const fila = JSON.parse(localStorage.getItem('pedidos_em_espera')) || [];

    const novaComanda = {
        id: Math.floor(1000 + Math.random() * 9000).toString(),
        timestamp: Date.now(),
        cliente: {
            nome: nomeCliente,
            endereco: enderecoCliente,
            pagamento: pagamentoCliente
        },
        itens: carrinho,
        subtotal: subtotal,
        taxaEntrega: taxaEntrega,
        total: subtotal + taxaEntrega
    };

    fila.push(novaComanda);
    localStorage.setItem('pedidos_em_espera', JSON.stringify(fila));
    localStorage.removeItem('carrinho');

    atualizarContadorHeader();
    alert(`Pedido #${novaComanda.id} enviado para a fila de espera!`);

    window.location.href = "painel_de_pedidos.html";
}

// ==========================================
// PAINEL DE PEDIDOS (Fila de Espera)
// ==========================================

function carregarPedidos() {

    const container = document.getElementById('orders-queue');

    const countBadge = document.getElementById('waiting-count');

    const pedidos =
        JSON.parse(
            localStorage.getItem('pedidos_em_espera')
        ) || [];


    /* Atualiza contador */

    if (countBadge) {

        countBadge.innerText = pedidos.length;

    }


    /* Se não estiver no painel */

    if (!container) {
        return;
    }


    /* Nenhum pedido */

    if (pedidos.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <p>
                    Nenhum pedido na fila de espera no momento.
                </p>
            </div>
        `;

        return;
    }


    /* Renderiza os pedidos */

    container.innerHTML = pedidos.map((pedido, index) => {

        const horaFormatada =
            new Date(pedido.timestamp)
                .toLocaleTimeString(
                    'pt-BR',
                    {
                        hour: '2-digit',
                        minute: '2-digit'
                    }
                );


        return `

            <div class="order-card ${index === 0 ? 'high-priority' : ''}">

                <!-- CABEÇALHO -->

                <div class="order-header">

                    <span class="order-id">
                        COMANDA #${pedido.id}
                    </span>

                    <span class="priority-tag ${index === 0 ? 'high' : 'normal'}">

                        ${index === 0
                            ? 'PRIORIDADE'
                            : 'NA FILA'
                        }

                    </span>

                </div>


                <!-- CLIENTE -->

                <div class="customer-section">

                    <h4>
                        Dados do Cliente
                    </h4>

                    <div class="customer-data">

                        <p>
                            <strong>Nome:</strong>
                            ${pedido.cliente.nome}
                        </p>

                        <p>
                            <strong>Pagamento:</strong>
                            ${pedido.cliente.pagamento}
                        </p>

                        <p>
                            <strong>Endereço:</strong>
                            ${pedido.cliente.endereco}
                        </p>

                        <p>
                            <strong>Horário:</strong>
                            ${horaFormatada}
                        </p>

                    </div>

                </div>


                <div class="invoice-divider"></div>


                <!-- PRODUTOS -->

                <div class="order-items">

                    <h4>
                        Itens do Pedido
                    </h4>

                    <div class="items-header">

                        <span>
                            Produto
                        </span>

                        <span>
                            Valor
                        </span>

                    </div>


                    ${pedido.itens.map(item => `

                        <div class="order-item-line">

                            <div class="item-description">

                                <span class="item-quantity">
                                    ${item.quantidade}x
                                </span>

                                <span>
                                    ${item.nome}
                                </span>

                            </div>


                            <strong>
                                R$ ${(
                                    item.preco *
                                    item.quantidade
                                )
                                .toFixed(2)
                                .replace('.', ',')}
                            </strong>

                        </div>

                    `).join('')}

                </div>


                <div class="invoice-divider"></div>


                <!-- VALORES -->

                <div class="order-summary">

                    <div class="summary-line">

                        <span>
                            Subtotal:
                        </span>

                        <span>
                            R$ ${pedido.subtotal
                                .toFixed(2)
                                .replace('.', ',')}
                        </span>

                    </div>


                    <div class="summary-line">

                        <span>
                            Taxa de entrega:
                        </span>

                        <span>
                            R$ ${pedido.taxaEntrega
                                .toFixed(2)
                                .replace('.', ',')}
                        </span>

                    </div>


                    <div class="summary-total">

                        <span>
                            TOTAL DO PEDIDO
                        </span>

                        <strong>
                            R$ ${pedido.total
                                .toFixed(2)
                                .replace('.', ',')}
                        </strong>

                    </div>

                </div>


                <!-- AÇÕES -->

                <div class="order-footer">

                    <span class="order-time">

                        Pedido recebido às
                        ${horaFormatada}

                    </span>


                    <div class="order-actions">

                        <button
                            onclick="concluirPedido(${index})"
                            class="btn-confirm">

                            Concluir Comanda

                        </button>


                        <button
                            onclick="cancelarPedido(${index})"
                            class="btn-cancel">

                            Cancelar

                        </button>

                    </div>

                </div>

            </div>

        `;

    }).join('');
}

function concluirPedido(index) {
    let pedidos = JSON.parse(localStorage.getItem('pedidos_em_espera')) || [];
    pedidos.splice(index, 1);
    localStorage.setItem('pedidos_em_espera', JSON.stringify(pedidos));
    carregarPedidos();
}
function cancelarPedido(index) {

    let pedidos =
        JSON.parse(
            localStorage.getItem('pedidos_em_espera')
        ) || [];


    const pedido = pedidos[index];


    if (!pedido) {
        return;
    }


    const confirmar = confirm(
        `Deseja cancelar a comanda #${pedido.id}?`
    );


    if (!confirmar) {
        return;
    }


    pedidos.splice(index, 1);


    localStorage.setItem(
        'pedidos_em_espera',
        JSON.stringify(pedidos)
    );


    carregarPedidos();
}
// ==========================================
// INICIALIZAÇÃO UNIFICADA
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    atualizarContadorHeader();
    atualizarMontadorUI();
    carregarPedidos();
});