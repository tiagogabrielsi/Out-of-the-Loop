/* --- CONFIGURAÇÃO E DADOS --- */
// (Mantenha seus dados do jogo aqui, igual ao anterior)
const dadosDoJogo = {
    comidas: {
        nome: "Comidas 🍕",
        palavras: ["Pizza", "Sushi", "Hambúrguer", "Macarrão", "Sorvete", "Bolo", "Feijoada", "Salada", "Taco"],
        perguntas: ["Você comeria isso no café da manhã?", "Isso é saudável?", "Mela a mão pra comer?", "É caro?"]
    },
    locais: {
        nome: "Locais 🗺️",
        palavras: ["Praia", "Hospital", "Escola", "Shopping", "Cemitério", "Academia", "Cinema", "Banheiro"],
        perguntas: ["Precisa pagar pra entrar?", "Cheira bem?", "Vai muito lá?", "Dá medo?"]
    },
    objetos: {
        nome: "Objetos 🔦",
        palavras: ["Celular", "Escova de Dente", "Martelo", "Papel Higiênico", "Faca", "Bola"],
        perguntas: ["Cabe no bolso?", "Quebra fácil?", "Criança pode usar?", "É eletrônico?"]
    }
};

/* --- ESTADO DO JOGO --- */
let jogadores = [];
let numeroRodada = 1; // NOVA VARIÁVEL
let estadoAtual = {
    categoria: "",
    chaveCategoria: "", // NOVA: Guarda o ID da categoria (ex: 'comidas')
    palavraSecreta: "",
    impostorIndex: null,
    indiceJogadorAtual: 0,
    votos: {},
    indiceVotanteAtual: 0
};

/* --- FUNÇÕES DE NAVEGAÇÃO E UI --- */
function mostrarTela(idTela) {
    // Remove active de todas
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // Adiciona active na nova (aciona animação CSS)
    const tela = document.getElementById(idTela);
    tela.classList.add('active');
}

// Toca um somzinho ao clicar (opcional, só vibração visual por enquanto)
function clickSound() {
    // Espaço para adicionar new Audio('click.mp3').play() futuramente
}

/* --- FASE 1: SETUP --- */
function adicionarJogador() {
    const input = document.getElementById('input-name');
    const nome = input.value.trim();
    
    if (nome) {
        jogadores.push({ nome: nome, pontos: 0 });
        input.value = "";
        renderizarListaJogadores();
        input.focus();
    }
}

// Habilitar ENTER no input
document.getElementById("input-name").addEventListener("keypress", function(event) {
    if (event.key === "Enter") { event.preventDefault(); adicionarJogador(); }
});

function renderizarListaJogadores() {
    const lista = document.getElementById('player-list');
    lista.innerHTML = "";
    jogadores.forEach((p, index) => {
        lista.innerHTML += `
            <div class="player-item slide-in">
                <span>${p.nome}</span>
                <span onclick="removerJogador(${index})" style="color:#ff4b4b; cursor:pointer;">✕</span>
            </div>`;
    });

    const btnStart = document.getElementById('btn-start');
    if (jogadores.length >= 3) {
        btnStart.disabled = false;
        btnStart.innerText = "COMEÇAR JOGO! 🚀";
        btnStart.classList.remove('pulse'); // Para de pulsar quando clicado
    } else {
        btnStart.disabled = true;
        btnStart.innerText = `Adicione +${3 - jogadores.length}`;
    }
}

function removerJogador(index) {
    jogadores.splice(index, 1);
    renderizarListaJogadores();
}

function irParaCategorias() {
    const grid = document.getElementById('category-grid');
    grid.innerHTML = "";
    
    Object.keys(dadosDoJogo).forEach(chave => {
        const cat = dadosDoJogo[chave];
        // Adiciona delay na animação de cada botão pra ficar bonito
        grid.innerHTML += `<button class="option-btn slide-in" onclick="iniciarRodada('${chave}')">${cat.nome}</button>`;
    });
    
    mostrarTela('screen-categories');
}

/* --- FASE 2: LÓGICA DO JOGO --- */
function iniciarRodada(chaveCategoria) {
    const dadosCat = dadosDoJogo[chaveCategoria];
    estadoAtual.categoria = dadosCat.nome;
    estadoAtual.chaveCategoria = chaveCategoria; // SALVA A CHAVE AQUI
    
    // ... (o resto da função continua igual) ...
    estadoAtual.palavraSecreta = dadosCat.palavras[Math.floor(Math.random() * dadosCat.palavras.length)];
    estadoAtual.impostorIndex = Math.floor(Math.random() * jogadores.length);
    estadoAtual.indiceJogadorAtual = 0;
    
    prepararTurnoRevelacao();
}

function prepararTurnoRevelacao() {
    if (estadoAtual.indiceJogadorAtual < jogadores.length) {
        const jogador = jogadores[estadoAtual.indiceJogadorAtual];
        
        // Reset da UI da carta
        const cardContainer = document.querySelector('.flip-card-container');
        cardContainer.classList.remove('flipped'); // Desvira a carta
        cardContainer.style.pointerEvents = 'auto'; // Habilita clique
        document.getElementById('btn-ready').style.opacity = '0';
        document.getElementById('btn-ready').style.pointerEvents = 'none';

        document.getElementById('pass-player-name').innerText = jogador.nome;
        document.getElementById('btn-pass-name').innerText = jogador.nome;
        mostrarTela('screen-pass');
    } else {
        prepararPerguntas();
    }
}

function revelarPapel() {
    const jogadorIndex = estadoAtual.indiceJogadorAtual;
    const isImpostor = jogadorIndex === estadoAtual.impostorIndex;
    
    document.getElementById('reveal-category-name').innerText = estadoAtual.categoria;
    const elementoPalavra = document.getElementById('secret-word');
    const elementoInstrucao = document.getElementById('reveal-instruction');

    if (isImpostor) {
        elementoPalavra.innerText = "VOCÊ ESTÁ POR FORA! 🤫";
        elementoPalavra.style.color = "#ff4b4b";
        elementoInstrucao.innerText = "Finja que sabe a palavra! Ouça os outros para tentar descobrir.";
    } else {
        elementoPalavra.innerText = estadoAtual.palavraSecreta;
        elementoPalavra.style.color = "#f1c40f";
        elementoInstrucao.innerText = "Aja naturalmente. Não dê dicas muito óbvias!";
    }

    mostrarTela('screen-reveal');
}

// EFEITO DE VIRAR CARTA
function virarCarta() {
    const cardContainer = document.querySelector('.flip-card-container');
    // Só vira se ainda não virou
    if (!cardContainer.classList.contains('flipped')) {
        cardContainer.classList.add('flipped');
        cardContainer.style.pointerEvents = 'none'; // Trava para não desvirar
        
        // Mostra o botão de "Entendi" depois de 1 segundo
        setTimeout(() => {
            const btn = document.getElementById('btn-ready');
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        }, 800);
    }
}

function proximoTurnoRevelacao() {
    estadoAtual.indiceJogadorAtual++;
    prepararTurnoRevelacao();
}

/* --- FASE 3: PERGUNTAS (TODOS CONTRA TODOS) --- */

let filaDePerguntas = []; // Vai guardar a lista de interações
let indicePerguntaFila = 0;

function prepararPerguntas() {
    gerarFilaDeInteracoes();
    indicePerguntaFila = 0;
    renderizarPerguntaAtual();
    mostrarTela('screen-questions');
}

function gerarFilaDeInteracoes() {
    filaDePerguntas = [];
    
    // 1. Gera todas as combinações possíveis (A->B, A->C, B->A, etc.)
    // Baseado na regra do PDF 
    for (let i = 0; i < jogadores.length; i++) {
        for (let j = 0; j < jogadores.length; j++) {
            if (i !== j) { // Ninguém pergunta pra si mesmo
                
                // Pega uma pergunta aleatória da categoria atual
                let listaPerguntas = [];
                Object.values(dadosDoJogo).forEach(cat => {
                    if (cat.nome === estadoAtual.categoria) listaPerguntas = cat.perguntas;
                });
                const perguntaRandom = listaPerguntas[Math.floor(Math.random() * listaPerguntas.length)];

                filaDePerguntas.push({
                    asker: jogadores[i].nome,
                    target: jogadores[j].nome,
                    texto: perguntaRandom
                });
            }
        }
    }

    // 2. Embaralha a fila para a ordem não ser previsível
    filaDePerguntas.sort(() => Math.random() - 0.5);
}

// --- Adicione esta função nova ---
function voltarPerguntaAnterior() {
    if (indicePerguntaFila > 0) {
        indicePerguntaFila--; // Volta um no índice
        renderizarPerguntaAtual();
    }
}

// --- Atualize esta função existente ---
function renderizarPerguntaAtual() {
    // Animação de entrada (Reset)
    const box = document.querySelector('.question-box');
    box.classList.remove('float-anim');
    void box.offsetWidth; 
    box.classList.add('float-anim');

    const interacao = filaDePerguntas[indicePerguntaFila];
    
    // Textos
    document.getElementById('q-progress').innerText = `Pergunta ${indicePerguntaFila + 1} de ${filaDePerguntas.length}`;
    
    const headerHTML = `
        <span class="badge">${interacao.asker}</span>
        <span style="font-size:1.5rem">👉</span>
        <span class="badge" style="background:var(--secondary)">${interacao.target}</span>
    `;
    document.querySelector('.question-header').innerHTML = headerHTML;
    document.getElementById('question-text').innerText = interacao.texto;

    // --- LÓGICA DOS BOTÕES DE NAVEGAÇÃO ---
    const btnPrev = document.getElementById('btn-prev-q');
    const btnNext = document.getElementById('btn-next-q');
    const btnVote = document.getElementById('btn-vote');
    const navContainer = document.querySelector('.nav-container');

    // 1. Controla o botão VOLTAR
    if (indicePerguntaFila === 0) {
        // Se for a primeira, esconde o botão voltar (mas mantem o espaço layout se quiser, aqui usamos hidden)
        btnPrev.style.visibility = 'hidden'; 
    } else {
        btnPrev.style.visibility = 'visible';
    }

    // 2. Controla botão PRÓXIMA vs VOTAÇÃO
    if (indicePerguntaFila === filaDePerguntas.length - 1) {
        // É a última pergunta
        navContainer.style.display = 'flex'; // Mantém container pra mostrar o voltar
        btnNext.style.display = 'none';      // Esconde "Próxima"
        btnVote.style.display = 'block';     // Mostra botão gigante de Votar
    } else {
        // Perguntas normais
        navContainer.style.display = 'flex';
        btnNext.style.display = 'block';
        btnVote.style.display = 'none';
    }
}

function proximaPerguntaDaFila() {
    if (indicePerguntaFila < filaDePerguntas.length - 1) {
        indicePerguntaFila++;
        renderizarPerguntaAtual();
    }
}

function proximaPergunta() {
    // Animaçãozinha de sair e entrar
    const box = document.querySelector('.question-box');
    box.classList.remove('float-anim');
    void box.offsetWidth; // Trigger reflow
    box.classList.add('float-anim');

    let perguntador = jogadores[Math.floor(Math.random() * jogadores.length)];
    let respondente = jogadores[Math.floor(Math.random() * jogadores.length)];
    while (perguntador === respondente) { respondente = jogadores[Math.floor(Math.random() * jogadores.length)]; }

    // Busca pergunta da categoria correta (removendo o emoji do nome para buscar no objeto original)
    // Truque: Vamos achar o objeto original varrendo as chaves
    let listaPerguntas = [];
    Object.values(dadosDoJogo).forEach(cat => {
        if (cat.nome === estadoAtual.categoria) listaPerguntas = cat.perguntas;
    });
    
    const pergunta = listaPerguntas[Math.floor(Math.random() * listaPerguntas.length)];

    document.getElementById('q-asker').innerText = perguntador.nome;
    document.getElementById('q-target').innerText = respondente.nome;
    document.getElementById('question-text').innerText = pergunta;
}

/* --- FASE 4: VOTAÇÃO --- */
function iniciarVotacao() {
    estadoAtual.votos = {};
    estadoAtual.indiceVotanteAtual = 0;
    prepararTelaVoto();
}

function prepararTelaVoto() {
    if (estadoAtual.indiceVotanteAtual < jogadores.length) {
        const votante = jogadores[estadoAtual.indiceVotanteAtual];
        document.getElementById('voter-name').innerText = votante.nome;
        
        const divOpcoes = document.getElementById('voting-options');
        divOpcoes.innerHTML = "";

        jogadores.forEach((p, index) => {
            // Não pode votar em si mesmo
            if (index !== estadoAtual.indiceVotanteAtual) {
                // Pega a primeira letra do nome para o avatar
                const inicial = p.nome.charAt(0).toUpperCase();
                
                // Cria o CARD BONITO em vez de botão simples
                divOpcoes.innerHTML += `
                <button class="vote-card slide-in" onclick="registrarVoto(${index})">
                    <div class="avatar-circle">${inicial}</div>
                    <span>${p.nome}</span>
                </button>`;
            }
        });

        mostrarTela('screen-voting');
    } else {
        calcularResultados();
    }
}

function registrarVoto(indiceVotado) {
    estadoAtual.votos[estadoAtual.indiceVotanteAtual] = indiceVotado;
    estadoAtual.indiceVotanteAtual++;
    prepararTelaVoto();
}

/* --- FASE 5: CÁLCULO DOS RESULTADOS E PONTUAÇÃO PARCIAL --- */
/* --- FASE 5: CÁLCULO DOS RESULTADOS (COM NOVA REGRA DE INOCENTES) --- */
function calcularResultados() {
    // 1. Contagem de votos (Padrão)
    let contagem = Array(jogadores.length).fill(0);
    Object.values(estadoAtual.votos).forEach(v => contagem[v]++);
    
    let maxVotos = 0;
    contagem.forEach(qtd => { if (qtd > maxVotos) maxVotos = qtd; });
    
    let maisVotadosIndices = [];
    contagem.forEach((qtd, index) => { if (qtd === maxVotos) maisVotadosIndices.push(index); });
    
    const houveEmpate = maisVotadosIndices.length > 1;
    const indiceMaisVotado = maisVotadosIndices[0];
    const indiceImpostor = estadoAtual.impostorIndex;

    // Salva estado
    estadoAtual.houveEmpate = houveEmpate; 
    estadoAtual.impostorFoiPego = (indiceMaisVotado === indiceImpostor && !houveEmpate);

    let cenario = ""; 

    // --- APLICAÇÃO DAS REGRAS ---

    // CENÁRIO 1: EMPATE
    if (houveEmpate) {
        // Impostor: +50 pontos garantidos
        jogadores[indiceImpostor].pontos += 50;

        // Inocentes: Só ganha quem votou no impostor (+150)
        Object.keys(estadoAtual.votos).forEach(voterIdx => {
            const idx = parseInt(voterIdx);
            const votouEmQuem = estadoAtual.votos[idx];
            if (idx !== indiceImpostor && votouEmQuem === indiceImpostor) {
                jogadores[idx].pontos += 150; 
            }
        });
        cenario = "empate";
    } 
    
    // CENÁRIO 2: IMPOSTOR PEGO (REGRA NOVA AQUI)
    else if (estadoAtual.impostorFoiPego) {
        // Impostor: 0 pontos por enquanto (depende do chute)
        
        // Inocentes:
        Object.keys(estadoAtual.votos).forEach(voterIdx => {
            const idx = parseInt(voterIdx);
            const votouEmQuem = estadoAtual.votos[idx];

            if (idx !== indiceImpostor) {
                if (votouEmQuem === indiceImpostor) {
                    // Quem votou CERTO ganha +150 garantido agora
                    jogadores[idx].pontos += 150; 
                } 
                else {
                    // Quem votou ERRADO espera o chute:
                    // Se impostor errar chute: +50
                    // Se impostor acertar chute: 0
                    // (Então não damos pontos aqui, deixamos para verificarChute)
                }
            }
        });
        cenario = "pego";
    }
    
    // CENÁRIO 3: IMPOSTOR ESCAPOU
    else {
        // Impostor: +150 pontos
        jogadores[indiceImpostor].pontos += 150;

        // Inocentes: +150 se votou no impostor
        Object.keys(estadoAtual.votos).forEach(voterIdx => {
            const idx = parseInt(voterIdx);
            const votouEmQuem = estadoAtual.votos[idx];
            if (idx !== indiceImpostor && votouEmQuem === indiceImpostor) {
                jogadores[idx].pontos += 150;
            }
        });
        cenario = "escapou";
    }

    // --- ATUALIZAÇÃO VISUAL ---
    const elNomeVotado = document.getElementById('voted-out-name');
    const elNomeImpostor = document.getElementById('impostor-reveal-name');
    
    if (houveEmpate) {
        elNomeVotado.innerText = "EMPATE!";
        elNomeVotado.style.color = "#f39c12";
    } else {
        elNomeVotado.innerText = jogadores[indiceMaisVotado].nome;
        elNomeVotado.style.color = "#ff4b4b";
    }
    elNomeImpostor.innerText = jogadores[indiceImpostor].nome;

    // Reseta e anima
    document.getElementById('suspense-loading-vote').style.display = 'block';
    elNomeVotado.classList.add('hidden-element');
    document.getElementById('impostor-section').classList.add('hidden-element');
    document.getElementById('suspense-loading-impostor').style.display = 'block';
    elNomeImpostor.classList.add('hidden-element');
    document.getElementById('final-actions').classList.add('hidden-element');

    mostrarTela('screen-result');

    setTimeout(() => {
        document.getElementById('suspense-loading-vote').style.display = 'none';
        elNomeVotado.classList.remove('hidden-element');
    }, 3000);
    setTimeout(() => { document.getElementById('impostor-section').classList.remove('hidden-element'); }, 5000);
    setTimeout(() => {
        document.getElementById('suspense-loading-impostor').style.display = 'none';
        elNomeImpostor.classList.remove('hidden-element');
    }, 8000);
    setTimeout(() => { revelarBotoesFinais(cenario); }, 9500);
}

function revelarBotoesFinais(cenario) {
    const actions = document.getElementById('final-actions');
    actions.classList.remove('hidden-element');
    actions.classList.add('slide-in');

    const msg = document.getElementById('result-message');
    const btnGuess = document.getElementById('btn-impostor-guess');
    const btnScores = document.getElementById('btn-final-scores');

    if (cenario === "empate") {
        msg.innerHTML = "⚖️ EMPATE!<br>O impostor já ganhou 50pts e pode chutar para ganhar +100!";
        msg.style.color = "#f39c12";
        btnGuess.style.display = "block";
        btnScores.style.display = "none";
    } 
    else if (cenario === "pego") {
        msg.innerHTML = "👮 PEGO!<br>Mas se ele acertar a palavra, ganha 150 pontos!";
        msg.style.color = "#aaffaa";
        btnGuess.style.display = "block";
        btnScores.style.display = "none";
    } 
    else {
        msg.innerHTML = "🕵️ ESCAPOU!<br>O Impostor venceu a rodada!";
        msg.style.color = "#ffaaaa";
        btnGuess.style.display = "none";
        btnScores.style.display = "block";
    }
}

/* --- FASE 6: TELA DE CHUTE (CORRIGIDA E MAIS SEGURA) --- */
function telaAdivinhacaoImpostor() {
    const div = document.getElementById('guess-options');
    div.innerHTML = ""; // Limpa tudo
    
    let opcoes = [estadoAtual.palavraSecreta];
    
    // Pega categoria atual para gerar palavras erradas
    let listaPalavras = [];
    Object.values(dadosDoJogo).forEach(cat => { 
        if (cat.nome === estadoAtual.categoria) listaPalavras = cat.palavras; 
    });

    // Adiciona 3 palavras erradas
    while (opcoes.length < 4) {
        let r = listaPalavras[Math.floor(Math.random() * listaPalavras.length)];
        if (!opcoes.includes(r)) opcoes.push(r);
    }
    
    // Embaralha
    opcoes.sort(() => Math.random() - 0.5);

    // --- AQUI ESTÁ A CORREÇÃO ---
    // Em vez de criar HTML texto, criamos elementos DOM reais.
    // Isso evita bugs com aspas ou nomes compostos.
    opcoes.forEach(palavra => {
        const btn = document.createElement('button');
        btn.className = "option-btn slide-in";
        btn.innerText = palavra;
        
        // Adiciona o clique direto no elemento (muito mais seguro)
        btn.onclick = function() { 
            verificarChute(palavra); 
        };
        
        div.appendChild(btn);
    });

    mostrarTela('screen-impostor-guess');
}

/* --- FASE 6: VERIFICAÇÃO DO CHUTE (COM LÓGICA DO INOCENTE QUE ERROU) --- */
function verificarChute(chute) {
    const impostor = jogadores[estadoAtual.impostorIndex];
    const acertou = (chute === estadoAtual.palavraSecreta);
    
    // Prepara visual
    document.getElementById('impostor-name-guess').innerText = impostor.nome;
    document.getElementById('guessed-word').innerText = chute;
    document.getElementById('real-secret-word').innerText = estadoAtual.palavraSecreta;

    document.getElementById('real-word-section').classList.add('hidden-element');
    document.getElementById('suspense-loading-secret').style.display = 'block';
    document.getElementById('real-secret-word').classList.add('hidden-element');
    document.getElementById('final-guess-actions').classList.add('hidden-element');

    let msgFinal = "";
    let corMsg = "";

    // --- LÓGICA DE PONTOS DO CHUTE ---

    if (acertou) {
        // ACERTOU
        if (estadoAtual.houveEmpate) {
            impostor.pontos += 100; // Total 150
        } else {
            // Foi Pego e Acertou: +150
            impostor.pontos += 150;
            // Inocentes que votaram errado ganham 0 (já estão com 0, nada a fazer)
        }
        
        msgFinal = "😱 INCRÍVEL! O Impostor acertou a palavra!";
        corMsg = "#aaffaa"; 

    } else {
        // ERROU
        if (estadoAtual.houveEmpate) {
            msgFinal = "😐 Errou o chute!<br>Ficou apenas com os 50 pontos do empate.";
            corMsg = "#f39c12"; 
        } else {
            // Foi Pego e Errou:
            // Impostor: 0 pontos.
            
            // Inocentes que votaram ERRADO ganham +50 agora!
            Object.keys(estadoAtual.votos).forEach(voterIdx => {
                const idx = parseInt(voterIdx);
                const votouEmQuem = estadoAtual.votos[idx];
                // Se não é impostor E não votou no impostor (votou errado)
                if (idx !== estadoAtual.impostorIndex && votouEmQuem !== estadoAtual.impostorIndex) {
                    jogadores[idx].pontos += 50;
                }
            });

            msgFinal = "🤣 ERROU!<br>Vitória dos Cidadãos!";
            corMsg = "#aaffaa"; 
        }
    }

    const elMsg = document.getElementById('guess-result-msg');
    if(elMsg) {
        elMsg.innerHTML = msgFinal;
        elMsg.style.color = corMsg;
    }

    mostrarTela('screen-guess-result');

    // Animação final
    setTimeout(() => { document.getElementById('real-word-section').classList.remove('hidden-element'); }, 2000);
    setTimeout(() => { 
        document.getElementById('suspense-loading-secret').style.display = 'none';
        document.getElementById('real-secret-word').classList.remove('hidden-element');
    }, 5000);
    setTimeout(() => { 
        document.getElementById('final-guess-actions').classList.remove('hidden-element');
        document.getElementById('final-guess-actions').classList.add('slide-in');
    }, 6500);
}

/* --- PLACAR --- */
function mostrarPlacar() {
    const lista = document.getElementById('score-list');
    lista.innerHTML = "";
    const sorted = [...jogadores].sort((a,b) => b.pontos - a.pontos);

    sorted.forEach((p, i) => {
        let medal = i === 0 ? "👑" : "";
        lista.innerHTML += `
        <li class="player-item slide-in" style="animation-delay: ${i*0.1}s">
            <span>${medal} ${p.nome}</span> 
            <strong>${p.pontos}</strong>
        </li>`;
    });
    
    // ATUALIZA O TEXTO DA RODADA
    document.getElementById('round-display').innerText = `FIM DA RODADA ${numeroRodada}`;

    mostrarTela('screen-scoreboard');
}

function novaRodada() {
    irParaCategorias();
}

/* --- FASE 7: NOVA RODADA (LÓGICA FINAL) --- */

function telaMenuNovaRodada() {
    mostrarTela('screen-new-round');
}

function executarNovaRodada(opcao) {
    numeroRodada++; // Incrementa a rodada

    if (opcao === 'categorias') {
        // Opção 1: Ver mais categorias
        irParaCategorias();
    
    } else if (opcao === 'mesma') {
        // Opção 2: Mesma categoria (Reinicia direto)
        if (estadoAtual.chaveCategoria) {
            iniciarRodada(estadoAtual.chaveCategoria);
        } else {
            // Fallback de segurança
            irParaCategorias();
        }

    } else if (opcao === 'jogadores') {
        // Opção 3: Editar jogadores
        // Volta para a tela de setup, mas mantendo os pontos e a lista atual
        renderizarListaJogadores(); 
        
        // Muda o texto do botão para "Continuar Jogo"
        const btnStart = document.getElementById('btn-start');
        btnStart.innerText = "CONTINUAR JOGO 🚀";
        
        mostrarTela('screen-setup');
    }
}