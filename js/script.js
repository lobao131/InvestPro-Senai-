
// TAXAS DO MERCADO
const TX_SELIC = 0.15;      // 15% a.a.
const TX_CDI = 0.149;       // 14.9% a.a.
const TX_IPCA = 0.06;       // 6% a.a. (Inflação)
const TX_FIXA_IPCA = 0.06;  // 6% a.a. (Juro Real fixo)

// Poupança: 0.5% + TR (estimada)
const TX_POUPANCA_MENSAL = 0.0050 + 0.0012; 

function calcularMeta() {
    try {
        // A. INPUTS
        let rendaAlvoInput = document.getElementById('renda-alvo').value.replace(',', '.');
        let tempoInput = document.getElementById('tempo').value;
        
        const rendaDesejada = parseFloat(rendaAlvoInput);
        const meses = parseInt(tempoInput);

        if (isNaN(rendaDesejada) || isNaN(meses) || rendaDesejada <= 0) {
            alert("Por favor, insira uma renda desejada válida.");
            return;
        }

        // B. CONVERSÃO DE TAXAS BRUTAS (ANUAL -> MENSAL)
        const selicMensal = Math.pow((1 + TX_SELIC), 1/12) - 1;
        const cdiMensal = Math.pow((1 + TX_CDI), 1/12) - 1;
        const taxaIpcaTotalAnual = ((1 + TX_IPCA) * (1 + TX_FIXA_IPCA)) - 1;
        const ipcaMensal = Math.pow((1 + taxaIpcaTotalAnual), 1/12) - 1;

        // C. DEFINIR ALÍQUOTA DE IR
        const aliquota = pegarAliquota(meses);

        // D. CÁLCULO REVERSO (QUANTO PRECISO TER?)
        // Fórmula: Valor Necessário = Renda Desejada / Taxa MENSAL LÍQUIDA
        
        // 1. Poupança (Isenta de IR)
        const taxaLiqPoupanca = TX_POUPANCA_MENSAL;
        const necessarioPoupanca = rendaDesejada / taxaLiqPoupanca;

        // 2. Selic (Tem IR)
        // Taxa Liquida = Taxa Bruta * (1 - imposto)
        const taxaLiqSelic = selicMensal * (1 - aliquota);
        const necessarioSelic = rendaDesejada / taxaLiqSelic;

        // 3. CDB 105% (Tem IR)
        const taxaLiqCDB = (cdiMensal * 1.05) * (1 - aliquota);
        const necessarioCDB = rendaDesejada / taxaLiqCDB;

        // 4. IPCA (Tem IR)
        const taxaLiqIPCA = ipcaMensal * (1 - aliquota);
        const necessarioIPCA = rendaDesejada / taxaLiqIPCA;

        // E. ATUALIZAR TELA
        atualizarCard('nec-poupanca', 'taxa-poupanca', necessarioPoupanca, taxaLiqPoupanca);
        atualizarCard('nec-selic', 'taxa-selic', necessarioSelic, taxaLiqSelic);
        atualizarCard('nec-cdb', 'taxa-cdb', necessarioCDB, taxaLiqCDB);
        atualizarCard('nec-ipca', 'taxa-ipca', necessarioIPCA, taxaLiqIPCA);

    } catch (e) {
        console.error(e);
        alert("Erro no cálculo: " + e.message);
    }
}

// --- FUNÇÕES AUXILIARES ---

function atualizarCard(idValor, idTaxa, valorNecessario, taxaLiquida) {
    document.getElementById(idValor).innerText = formatarMoeda(valorNecessario);
    const taxaFormatada = (taxaLiquida * 100).toFixed(2).replace('.', ',') + "% a.m.";
    document.getElementById(idTaxa).innerText = taxaFormatada;}

function pegarAliquota(meses) 
{   const dias = meses * 30;
    if (dias <= 180) return 0.225; // 22.5%
    if (dias <= 360) return 0.20;  // 20%
    if (dias <= 720) return 0.175; // 17.5%
    return 0.15;                   // 15%
}

function formatarMoeda(valor)
 {return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });}

// Calcula automaticamente ao abrir
window.onload = calcularMeta;