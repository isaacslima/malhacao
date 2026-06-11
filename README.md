# 🏋️‍♂️ Gerenciador de Treino Diário

Aplicação web client-side projetada para registrar e acompanhar rotinas de exercícios físicos diários de forma rápida e segura. A aplicação utiliza o banco de dados **SQLite** diretamente no navegador (via SQL.js) e persiste os dados fisicamente no computador do usuário usando a API nativa *File System Access*.

Todo o visual foi redesenhado usando a biblioteca **Pico.css v2** com suporte a temas Dark e Light.

---

## 🚀 Funcionalidades Implementadas

*   **Persistência em SQLite Local**: Conexão com arquivos de banco de dados locais `.db` (abertura segura de arquivos existentes ou criação de novos bancos).
*   **Modularização de Código**: Separação completa de responsabilidades entre marcação (HTML), estilo (CSS) e lógica (JavaScript modularizado).
*   **Design Premium Responsivo (Pico CSS v2)**: Visual moderno com suporte nativo a temas e alternância automática de cores baseada em tokens CSS.
*   **Alternância de Temas (Modo Escuro / Claro)**: Botão de seleção no cabeçalho com preferência persistida automaticamente no `localStorage`.
*   **Rotinas de Treino Semanais**: Checklist de exercícios dinâmicos sugeridos automaticamente baseado no dia da semana atual (com opção "Outro" para exercícios personalizados).
*   **Cronômetro de Série com Overlay**: Cronômetro em tela cheia com alerta visual de tempo recomendado (30 minutos) e sincronização automática com o campo de tempo de execução.
*   **Botão de Limpeza Rápida**: Reseta todos os campos do formulário de registro e zera o cronômetro ativo instantaneamente.
*   **Retrocompatibilidade de Dados**: Adiciona automaticamente novas colunas (como `tempo`) em bancos de dados antigos sem corromper os registros pré-existentes.

---

## 📁 Estrutura de Arquivos

Os arquivos estão localizados dentro do diretório `/assets`:

*   **`index.html`**: Estrutura HTML5 semântica e importações de bibliotecas.
*   **`style.css`**: Estilos customizados, variáveis de temas e layout do overlay do cronômetro.
*   **`routine.js`**: Banco de dados estático com mapeamento dos dias da semana e exercícios sugeridos.
*   **`timer.js`**: Estado global do cronômetro e ações de controle (iniciar, pausar, resetar).
*   **`db.js`**: Funções de inicialização do SQLite, alteração de esquemas, renderização de histórico e gravação de arquivos no disco local.
*   **`app.js`**: Inicializador geral do DOM, gerenciador de alternância de temas e vinculador de eventos.
*   **`test-harness.html`**: Interface interativa de testes automatizados.

---

## 🧪 Testes Automatizados

Para garantir que a aplicação continue funcionando perfeitamente sem riscos de quebra durante refatorações, foi implementada uma interface de testes de integração no navegador.

### O que o Painel de Testes faz?
*   **Mocks de API**: Simula a API do sistema de arquivos local (`showOpenFilePicker`/`showSaveFilePicker`) na memória RAM para rodar os testes com segurança e rapidez sem sobrescrever seus arquivos `.db` reais.
*   **Execução de Cenários**:
    1.  *Carregamento do SQL.js*: Garante que a biblioteca WASM de banco de dados foi carregada com sucesso.
    2.  *Criação de Banco de Dados*: Valida a criação de um novo banco SQLite e sua tabela em memória.
    3.  *Exibição dos Exercícios*: Testa se a lista de checkboxes carrega os itens corretos baseados na rotina do dia.
    4.  *Ciclo do Cronômetro*: Testa o início, pausa e finalização do contador de tempo do overlay.
    5.  *Inserção e Histórico*: Preenche dados de uma série, simula o clique em "Salvar" e verifica se o registro foi salvo no SQLite e renderizado na tabela visual.
    6.  *Limpeza de Inputs*: Garante que o botão de redefinir campos limpa todos os dados corretamente.

### Como rodar os testes?
Basta abrir o arquivo `docs/test-harness.html` diretamente em qualquer navegador. Os testes iniciam de forma autônoma e exibem o resultado final detalhado com marcadores visuais verdes e vermelhos para sucesso ou falha.