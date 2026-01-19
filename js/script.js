/* --- JAVASCRIPT --- */

// 1. CONSTANTES DO MERCADO
const TX_SELIC = 0.15;      
const TX_CDI = 0.149;       
const TX_IPCA = 0.06;       
const TX_FIXA_IPCA = 0.06;  
const TX_POUPANCA_MENSAL = 0.0050 + 0.0012; 

function calcular() {
    try {
        // A. INPUTS
        let valorInput = document.getElementById('valor').value.replace(',', '.');
        let tempoInput = document.getElementById('tempo').value;
        
        const P = parseFloat(valorInput);
        const M = parseInt(tempoInput);

        if (isNaN(P) || isNaN(M)) { alert("Insira valores válidos."); return; }

        // B. CONVERSÃO E CÁLCULOS
        const selicMensal = Math.pow((1 + TX_SELIC), 1/12) - 1;
        const cdiMensal = Math.pow((1 + TX_CDI), 1/12) - 1;
        const taxaIpcaTotalAnual = ((1 + TX_IPCA) * (1 + TX_FIXA_IPCA)) - 1;
        const ipcaMensal = Math.pow((1 + taxaIpcaTotalAnual), 1/12) - 1;
        const inflacaoPuraMensal = Math.pow((1 + TX_IPCA), 1/12) - 1;

        const brutoPoupanca = P * Math.pow((1 + TX_POUPANCA_MENSAL), M);
        const brutoSelic = P * Math.pow((1 + selicMensal), M);
        const brutoCDB = P * Math.pow((1 + (cdiMensal * 1.05)), M); 
        const brutoIPCA = P * Math.pow((1 + ipcaMensal), M);
        const montanteInflacao = P * Math.pow((1 + inflacaoPuraMensal), M);

        const aliquota = pegarAliquota(M);

        const liqSelic = descontarImposto(P, brutoSelic, aliquota);
        const liqCDB = descontarImposto(P, brutoCDB, aliquota);
        const liqIPCA = descontarImposto(P, brutoIPCA, aliquota);
        const liqPoupanca = brutoPoupanca;

        // Atualiza Cards passando também a taxa mensal para cálculo da renda
        atualizarCard('val-poupanca', 'real-poupanca', 'renda-poupanca', liqPoupanca, montanteInflacao, TX_POUPANCA_MENSAL);
        atualizarCard('val-selic', 'real-selic', 'renda-selic', liqSelic, montanteInflacao, selicMensal);
        atualizarCard('val-cdb', 'real-cdb', 'renda-cdb', liqCDB, montanteInflacao, cdiMensal * 1.05);
        atualizarCard('val-ipca', 'real-ipca', 'renda-ipca', liqIPCA, montanteInflacao, ipcaMensal);

    } catch (e) {
        console.error(e);
        alert("Erro: " + e.message);
    }
}

// Função atualizada para calcular a Renda Mensal
function atualizarCard(idValor, idGanhoReal, idRenda, valorLiquido, baseInflacao, taxaMensal) {
    // 1. Valor Final
    document.getElementById(idValor).innerText = formatar(valorLiquido);

    // 2. Ganho Real
    const ganhoReal = valorLiquido - baseInflacao;
    const elementoGanho = document.getElementById(idGanhoReal);
    elementoGanho.innerText = (ganhoReal > 0 ? "+" : "") + formatar(ganhoReal);
    
    if (ganhoReal < 0) {
        elementoGanho.classList.add('negative');
    } else {
        elementoGanho.classList.remove('negative');
    }

    // 3. Renda Mensal (Novo)
    // Calcula quanto o montante acumulado renderia no mês seguinte
    const rendaMensal = valorLiquido * taxaMensal;
    document.getElementById(idRenda).innerText = formatar(rendaMensal);
}

function pegarAliquota(meses) {
    const dias = meses * 30;
    if (dias <= 180) return 0.225;
    if (dias <= 360) return 0.20;
    if (dias <= 720) return 0.175;
    return 0.15;
}

function descontarImposto(principal, bruto, aliquota) {
    const lucro = bruto - principal;
    return principal + (lucro * (1 - aliquota));
}

function formatar(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

window.onload = calcular;