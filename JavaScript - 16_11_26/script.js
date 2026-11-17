// ==========================================================
// Minhas Tarefas — projeto final de JavaScript
// O HTML e o CSS já estão prontos. Aqui a gente escreve o JS.
// ==========================================================

const API_URL = 'https://dummyjson.com/todos/';

// ---------- Elementos da página (já selecionados) ----------
const saudacao = document.querySelector('#saudacao');
const contador = document.querySelector('#contador');
const btnNome = document.querySelector('#btn-nome');
const formTarefa = document.querySelector('#form-tarefa');
const inputTarefa = document.querySelector('#input-tarefa');
const mensagem = document.querySelector('#mensagem');
const filtro = document.querySelector('#filtro');
const lista = document.querySelector('#lista');

// ---------- Etapa 1: começamos aqui ----------

let tarefas = []

let preferencias = { nome: 'visitante', filtro: 'todas' };

async function carregarTarefas() {
    lista.innerHTML = `<li class="tarefa">Carregando tarefas...</li>`;

    const resposta = await fetch(`${API_URL}? limit=8`);
    const data = await resposta.json();

    tarefas = data.todos;
    renderizar();
}

function renderizar() {
    let html = '';

    for (const tarefa of filtrarTarefas()) {
        html += `
            <li class="tarefa ${tarefa.completed ? "concluida" : ""}">
              <span class="texto">${tarefa.todo}</span>
              <button class = "btn-excluir" data-id="${tarefa.id}">${tarefa.completed ? "desfazer" : "concluir"} </button>
              <button class="btn=excluir" data-id="${tarefa.id}">Excluir</button>

              </li>
        `;
    }
    lista.innerHTML = html;
    atualizarContador();
}

function atualizarSaudacao() {
    const hora = new Date().getHours();
    let periodo;

    if (hora < 12) {
        periodo = "Bom dia"
    } else if (hora < 18) {
        periodo = 'Boa tarde';
    } else {
        periodo = 'Boa noite'
    }

    saudacao.textContent = `${periodo}, ${preferencias.nome}!`;
}

function filtrarTarefas() {
    switch (preferencias.filtro) {
        case 'pendentes':
            return tarefas.filter((tarefa) => !tarefa.completed);
        case 'concluidas':
            return tarefas.filter((tarefa) => tarefa.completed);
        default:
            return tarefas;
    }
}
let numberContador = "0";

function atualizarContador() {
    const concluidas = tarefas.filter((tarefa) => tarefa.completed).length;
    let porcentagem = 0;

    if (tarefas.length > 0) {
        porcentagem = Math.round((concluidas / tarefas.length) * 100);
    }

    contador.textContent = `${concluidas} de ${tarefas.length} concluidas (${porcentagem}%)`;
}

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;
}

async function adicionarTarefa(texto) {

    if (texto === null || texto === '') {
        mostrarMensagem("digite alguma mensagem");
        return;
    } if (texto.length < 3) {
        mostrarMensagem("A tarefa precisa ter pelo menos 3 letras.");
        return
    }




    if (tarefas.find((tarefa) => tarefa.todo === texto)) {
        mostrarMensagem("Esta tarefa já existe.");
        return;
    }

    const resposta = await fetch(`${API_URL}`, {
        method: `POST`,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todo: texto, completed: false, userId: 1 })
    })

    const nova = resposta.json();
    tarefas.push(nova);
    inputTarefa.value = '';
    mostrarMensagem("tarefa adicionada", 'sucesso');
    renderizar();
}

async function alternarTarefa(id) {
    const tarefa = tarefas.find((tarefa) => tarefa.id === id);

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
        method: `PUT`,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !tarefa.completed })
    })

    if (!resposta.ok) {
        throw new Error(mensagemDoStatus(resposta.status));
    }

    const atualizada = await resposta.json();

    const indice = tarefas.indexOf(tarefa);
    tarefas[indice] = atualizada;

    mostrarmensagem('tarefa atualizada', 'sucesso');
    renderizar();
    } catch (erro) {
        mostrarMensagem(`Erro ao atualizar a tarefa: ${erro.message}`, 'erro');
    }
}

async function exluirTarefa(id) {
    const resposta = await fetch(`${API_URL}/${id}`);

    tarefas = tarefas.filter((tarefa) => tarefa.id !== id);
    rederizar();    
}

function salvarPreferencias() {
    localStorage.setItem('preferencias', JSON.stringify(preferencias));
}

function carregarPreferencias() {
    const salvas = localStorage.getItem('preferencias');

    if (salvas !== null) {
        preferencias = JSON.parse(salvas);
    }
    filtro.value = preferencias.filtro;
}

function mensagemDoStatus(status) {
    switch (status) {
        case 400:
            return 'o servidor recusou os dados enviado (400)';
        case 404:
            return 'o servidor não encontrou o recurso solicitado (404)';
        case 500:
            return 'o servidor encontrou um erro inesperado (500)';
        default:
            return `erro desconhecido (${status})`;
    }
}    

// click, submit, change
filtro.addEventListener('change', () => {
    preferencias.filtro = filtro.value;
    salvarPreferencias();
    renderizar();
})

formTarefa.addEventListener('submit', (event) => {
    event.preventDefault();
    const texto = inputTarefa.value.trim();
    adicionarTarefa(texto);
})

lista.addEventListener('click', (event) => {
    const botao = event.target;
    const id = Number(botao.dataset.id);

    if (botao.classList.contains('btn-excluir')) {
        alternarTarefa(id);
    } else if (botao.classList.contains('btn-excluir')) {
        exluirTarefa(id);
    }
})


btnNome.addEventListener('click', () => {
    const nome = prompt("como quer ser chamado?");

    if (nome !== null && nome.trim() !== '') {
        preferencias.nome = nome.trim();
        salvarPreferencias();
        atualizarSaudacao();
    }
})

carregarTarefas();
carregarPreferencias();
atualizarSaudacao();
renderizar();