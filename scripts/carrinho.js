// =====================================================================
// LÓGICA DE GERENCIAMENTO DE CARRO E FRACIONAMENTO
// =====================================================================

let pizzaMontada = [];
const MAX_PARTES = 4; // 1/4 representa 1 parte, 1/2 representa 2 partes

// Retorna itens do carrinho do localStorage
function getCarrinho() {
    return JSON.parse(localStorage.getItem('carrinho')) || [];
}

// Salva itens no carrinho do localStorage
function salvarCarrinho(carrinho) {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContadorHeader();
}

// Adiciona fracao ao montador
function adicionarFracaoSabor(nome, preco, partes) {
    const partesAtuais = pizzaMontada.reduce((acc, item) => acc + item.partes, 0);

    if (partesAtuais + partes > MAX_PARTES) {
        const espacoRestante = MAX_PARTES - partesAtuais;
        if (espacoRestante === 0) {
            alert("A pizza ja esta completa (4/4 partes). Remova algum sabor para alterar.");
        } else {
            alert(`Sua pizza so tem espaco para mais ${espacoRestante === 1 ? '1/4' : '1/2'}.`);
        }
        return;
    }

    const textoFracao = partes === 2 ? '1/2' : '1/4';

    pizzaMontada.push({
        nome: nome,
        preco: parseFloat(preco),
        partes: partes,
        textoFracao: textoFracao
    });

    atualizarMontadorUI();
}

// Remove fracao especifica
function removerFracaoSabor(index) {
    pizzaMontada.splice(index, 1);
    atualizarMontadorUI();
}

// Atualiza interface do montador
function atualizarMontadorUI() {
    const listEl = document.getElementById('selected-flavors-list');
    const badgeEl = document.getElementById('fraction-badge');
    const priceEl = document.getElementById('custom-pizza-price');
    const btnAdd = document.getElementById('btn-add-custom');

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
        listEl.innerHTML = '<p class="empty-msg">Sua pizza esta vazia. Escolha 1/2 ou 1/4 dos sabores abaixo.</p>';
    } else {
        listEl.innerHTML = pizzaMontada.map((item, idx) => `
            <div class="flavor-chip">
                <span><strong>[${item.textoFracao}]</strong> ${item.nome}</span>
                <button onclick="removerFracaoSabor(${idx})" title="Remover">X</button>
            </div>
        `).join('');
    }
}

// Adiciona pizza montada ao carrinho
function adicionarPizzaMontadaAoCarrinho() {
    const totalPartes = pizzaMontada.reduce((acc, item) => acc + item.partes, 0);
    if (totalPartes !== MAX_PARTES) return;

    const descricaoSabores = pizzaMontada.map(item => `${item.textoFracao} ${item.nome}`).join(' + ');
    const maiorPreco = Math.max(...pizzaMontada.map(item => item.preco));
    const nomePizza = `Pizza Mista (${descricaoSabores})`;

    let carrinho = getCarrinho();
    carrinho.push({
        nome: nomePizza,
        preco: maiorPreco,
        quantidade: 1
    });

    salvarCarrinho(carrinho);

    pizzaMontada = [];
    atualizarMontadorUI();

    alert("Pizza Mista adicionada ao carrinho com sucesso!");
}

// Envia itens do carrinho para a fila de espera
function enviarCarrinhoParaFilaDeEspera() {
    const carrinho = getCarrinho();

    if (carrinho.length === 0) {
        alert("Seu carrinho esta vazio.");
        return;
    }

    const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    const taxaEntrega = 5.00;
    const totalFinal = subtotal + taxaEntrega;

    const fila = JSON.parse(localStorage.getItem('pedidos_em_espera')) || [];

    const novaComanda = {
        id: Math.floor(1000 + Math.random() * 9000).toString(),
        timestamp: Date.now(),
        itens: carrinho,
        subtotal: subtotal,
        taxaEntrega: taxaEntrega,
        total: totalFinal
    };

    fila.push(novaComanda);
    localStorage.setItem('pedidos_em_espera', JSON.stringify(fila));
    localStorage.removeItem('carrinho');

    atualizarContadorHeader();
    alert(`Pedido #${novaComanda.id} enviado para a fila de espera!`);

    window.location.href = "painel_de_pedidos.html"; // aqui
}

// Atualiza a contagem no cabeçalho
function atualizarContadorHeader() {
    const countEl = document.getElementById('cart-count');
    if (!countEl) return;

    const carrinho = getCarrinho();
    const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    countEl.innerText = totalItens;
}

document.addEventListener('DOMContentLoaded', () => {
    atualizarContadorHeader();
    atualizarMontadorUI();
});