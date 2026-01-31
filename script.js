let jogadores = [];
let grupos = {};
let partidas = [];
let vitorias = {};
let faseMataMata = [];

function adicionarJogador() {
  const nome = document.getElementById("nomeJogador").value.trim();
  if (nome && !jogadores.includes(nome)) {
    jogadores.push(nome);
    vitorias[nome] = 0;
    atualizarLista();
    document.getElementById("nomeJogador").value = "";
  }
}

function removerJogador(index) {
  const nomeRemovido = jogadores.splice(index, 1)[0];
  delete vitorias[nomeRemovido];
  atualizarLista();
}

function atualizarLista() {
  const ul = document.getElementById("listaJogadores");
  ul.innerHTML = "";
  jogadores.forEach((jogador, index) => {
    const li = document.createElement("li");
    li.textContent = jogador;
    const btn = document.createElement("button");
    btn.textContent = "Remover";
    btn.onclick = () => removerJogador(index);
    li.appendChild(btn);
    ul.appendChild(li);
  });
}

function embaralhar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function sortearGrupos() {
  const numGrupos = parseInt(document.getElementById("quantGrupos").value);
  grupos = {};
  partidas = [];
  const sorteados = embaralhar([...jogadores]);
  for (let i = 0; i < numGrupos; i++) {
    grupos["Grupo " + (i + 1)] = [];
  }
  sorteados.forEach((jogador, i) => {
    grupos["Grupo " + (i % numGrupos + 1)].push(jogador);
  });
  exibirGrupos();
  gerarPartidas();
  exibirPartidas();
  atualizarClassificacao();
}

function exibirGrupos() {
  const div = document.getElementById("resultadoGrupos");
  div.innerHTML = "";
  for (const grupo in grupos) {
    const g = document.createElement("div");
    g.innerHTML = `<strong>${grupo}:</strong> ${grupos[grupo].join(", ")}`;
    div.appendChild(g);
  }
}

function gerarPartidas() {
  partidas = [];
  for (const grupo in grupos) {
    const jogadoresGrupo = grupos[grupo];
    for (let i = 0; i < jogadoresGrupo.length; i++) {
      for (let j = i + 1; j < jogadoresGrupo.length; j++) {
        partidas.push({ grupo, jogador1: jogadoresGrupo[i], jogador2: jogadoresGrupo[j], vencedor: null });
      }
    }
  }
}

function exibirPartidas() {
  const div = document.getElementById("tabelaPartidas");
  div.innerHTML = "";
  partidas.forEach((partida, index) => {
    const p = document.createElement("div");

    // Aplica classe visual de destaque se for partida de desempate
    p.className = partida.desempate ? "desempate" : "partida";

    const labelDesempate = partida.desempate ? "<strong style='color: red'>(Desempate)</strong> " : "";
    const vencedorTexto = partida.vencedor ? ` - Vencedor: ${partida.vencedor}` : "";

    p.innerHTML = `${labelDesempate}(${partida.grupo}) ${partida.jogador1} vs ${partida.jogador2}${vencedorTexto}`;
    
    if (!partida.vencedor) {
      const btn1 = document.createElement("button");
      btn1.textContent = partida.jogador1;
      btn1.onclick = () => registrarVencedor(index, partida.jogador1);
      const btn2 = document.createElement("button");
      btn2.textContent = partida.jogador2;
      btn2.onclick = () => registrarVencedor(index, partida.jogador2);
      p.appendChild(btn1);
      p.appendChild(btn2);
    }
    div.appendChild(p);
  });
}

function registrarVencedor(index, vencedor) {
  if (!partidas[index].vencedor) {
    partidas[index].vencedor = vencedor;
    vitorias[vencedor]++;
    exibirPartidas();
    atualizarClassificacao();
    verificarDesempates(partidas[index].grupo); // 👈 Verifica empate ao registrar vencedor
  }
}

// 🔁 Função para verificar e gerar desempates
function verificarDesempates(grupo) {
  const jogadoresGrupo = grupos[grupo];
  const ranking = jogadoresGrupo.map(j => ({ nome: j, vitorias: vitorias[j] }));
  ranking.sort((a, b) => b.vitorias - a.vitorias);

  const primeiroLugar = ranking[0].vitorias;
  const empatados = ranking.filter(j => j.vitorias === primeiroLugar);

  if (empatados.length > 2) {
    const jáTemPartidas = partidas.some(p => 
      p.grupo === grupo &&
      empatados.some(e1 => p.jogador1 === e1.nome || p.jogador2 === e1.nome) &&
      p.vencedor === null
    );

    if (!jáTemPartidas) {
      alert(`Empate no ${grupo}. Nova rodada entre: ${empatados.map(e => e.nome).join(", ")}`);
      for (let i = 0; i < empatados.length; i++) {
        for (let j = i + 1; j < empatados.length; j++) {
          partidas.push({ grupo, jogador1: empatados[i].nome, jogador2: empatados[j].nome, vencedor: null });
        }
      }
      exibirPartidas();
    }
  }
  partidas.push({ grupo, jogador1: empatados[i].nome, jogador2: empatados[j].nome, vencedor: null, desempate: true });

}

function atualizarClassificacao() {
  const div = document.getElementById("classificacaoGrupos");
  div.innerHTML = "";

  for (const grupo in grupos) {
    const jogadoresGrupo = grupos[grupo];

    const rankingCompleto = jogadoresGrupo
      .map(j => ({ nome: j, vitorias: vitorias[j] }))
      .sort((a, b) => b.vitorias - a.vitorias);

    // Verifica se existe pelo menos 1 vitória no grupo
    const existeVitoria = rankingCompleto.some(j => j.vitorias > 0);

    let primeiro = "Primeiro colocado: (aguardando)";
    let segundo = "Segundo colocado: (aguardando)";

    if (existeVitoria) {
      // Seleciona os dois primeiros jogadores pelo ranking real
      const top2 = rankingCompleto.slice(0, 2);

      primeiro = `${top2[0].nome} (${top2[0].vitorias} vitórias)`;
      segundo = `${top2[1].nome} (${top2[1].vitorias} vitórias)`;
    }

    const g = document.createElement("div");
    g.innerHTML = `
      <strong>${grupo} - Classificados:</strong><br>
      ${primeiro}<br>
      ${segundo}
    `;

    div.appendChild(g);
  }
}

/*function gerarMataMata() {
  const classificados = [];
  for (const grupo in grupos) {
    const jogadoresGrupo = grupos[grupo];
    const ranking = jogadoresGrupo.map(j => ({ nome: j, vitorias: vitorias[j] }))
      .sort((a, b) => b.vitorias - a.vitorias)
      .slice(0, 2);
    classificados.push(...ranking.map(r => r.nome));
  }
  faseMataMata = [];
  criarFase(faseMataMata, embaralhar(classificados));
  exibirFaseMataMata(faseMataMata);
}*/
function gerarMataMata() {
  faseMataMata = [];
  const classificados = [];

  for (const grupo in grupos) {
    const jogadoresGrupo = grupos[grupo];
    const ranking = jogadoresGrupo
      .map(j => ({ nome: j, vitorias: vitorias[j] }))
      .sort((a, b) => b.vitorias - a.vitorias);

    const primeiro = ranking[0];
    const segundo = ranking[1];

    // Verifica se já existe classificação REAL
    const classificacaoPronta =
      primeiro.vitorias > 0 || segundo.vitorias > 0;

    if (classificacaoPronta) {
      // Adicionar normalmente
      classificados.push(primeiro.nome);
      classificados.push(segundo.nome);
    } else {
      // Inserir placeholders
      classificados.push("Primeiro colocado (aguardando)");
      classificados.push("Segundo colocado (aguardando)");
    }
  }

  // Criar estrutura da fase sem embaralhar placeholders
  const jogadoresValidos = classificados.filter(
    nome => !nome.includes("(aguardando)")
  );

  // Se ainda não temos jogadores reais suficientes, mostrar preview
  if (jogadoresValidos.length < 2) {
    faseMataMata = [
      [
        {
          jogador1: "Primeiro colocado (aguardando)",
          jogador2: "Segundo colocado (aguardando)",
          vencedor: null
        }
      ]
    ];
    exibirFaseMataMata(faseMataMata);
    return;
  }

  // Gerar mata-mata REAL
  criarFase(faseMataMata, embaralhar(jogadoresValidos));
  exibirFaseMataMata(faseMataMata);
}

function criarFase(fase, jogadores) {
  const novaFase = [];
  for (let i = 0; i < jogadores.length; i += 2) {
    if (jogadores[i + 1]) {
      novaFase.push({ jogador1: jogadores[i], jogador2: jogadores[i + 1], vencedor: null });
    } else {
      novaFase.push({ jogador1: jogadores[i], jogador2: "(bye)", vencedor: jogadores[i] });
    }
  }
  fase.push(novaFase);
}

function exibirFaseMataMata(fases) {
  const div = document.getElementById("jogosMataMata");
  div.innerHTML = "";
  fases.forEach((rodada, faseIndex) => {
    const faseDiv = document.createElement("div");
    faseDiv.innerHTML = `<h3>Fase ${faseIndex + 1}</h3>`;
    rodada.forEach((jogo, index) => {
      const jogoDiv = document.createElement("div");
      const vencedorTexto = jogo.vencedor ? ` - Vencedor: ${jogo.vencedor}` : "";
      jogoDiv.innerHTML = `Jogo ${index + 1}: ${jogo.jogador1} vs ${jogo.jogador2}${vencedorTexto}`;
      if (!jogo.vencedor && jogo.jogador2 !== "(bye)") {
        const btn1 = document.createElement("button");
        btn1.textContent = jogo.jogador1;
        btn1.onclick = () => registrarVencedorMataMata(faseIndex, index, jogo.jogador1);
        const btn2 = document.createElement("button");
        btn2.textContent = jogo.jogador2;
        btn2.onclick = () => registrarVencedorMataMata(faseIndex, index, jogo.jogador2);
        jogoDiv.appendChild(btn1);
        jogoDiv.appendChild(btn2);
      }
      faseDiv.appendChild(jogoDiv);
    });
    div.appendChild(faseDiv);
  });
}

function registrarVencedorMataMata(faseIndex, jogoIndex, vencedor) {
  const jogo = faseMataMata[faseIndex][jogoIndex];
  if (!jogo.vencedor) {
    jogo.vencedor = vencedor;
    const todosDefinidos = faseMataMata[faseIndex].every(j => j.vencedor);
    if (todosDefinidos) {
      const proximos = faseMataMata[faseIndex].map(j => j.vencedor);
      if (proximos.length > 1) {
        criarFase(faseMataMata, embaralhar(proximos));
      }
    }
    exibirFaseMataMata(faseMataMata);
  }
}

//Travar recarregamento da página

window.addEventListener('keydown', function (e) {
  if ((e.ctrlKey && e.key === 'r') || e.key === 'F5') {
      e.preventDefault();
  }
});

window.addEventListener('beforeunload', function (e) {
  const message = 'Você tem dados não salvos. Tem certeza que deseja sair?';
  e.returnValue = message;
  return message;
});


function importarArquivo() {
  const arq = document.getElementById("arquivoLista").files[0];
  if (!arq) return alert("Selecione um arquivo!");

  const reader = new FileReader();

  reader.onload = function(e) {
    let conteudo = e.target.result;
    let lista = [];

    if (arq.name.toLowerCase().endsWith(".txt")) {
      lista = conteudo.split("\n").map(l => l.trim()).filter(l => l);
    } else if (arq.name.toLowerCase().endsWith(".json")) {
      try {
        const json = JSON.parse(conteudo);
        lista = json.jogadores || [];
      } catch {
        alert("Erro no JSON");
        return;
      }
    } else {
      alert("Formato inválido (use .txt ou .json)");
      return;
    }

    lista.forEach(nome => {
      if (nome && !jogadores.includes(nome)) {
        jogadores.push(nome);
        vitorias[nome] = 0;
      }
    });

    atualizarLista();
    alert(lista.length + " jogadores importados!");
  };

  reader.readAsText(arq);
}
