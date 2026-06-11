// app.js

document.addEventListener('DOMContentLoaded', () => {
    const btnOpenDB = document.getElementById('btnOpenDB');
    const btnCreateDB = document.getElementById('btnCreateDB');
    const currentDayWorkout = document.getElementById('currentDayWorkout');
    const btnToggleTheme = document.getElementById('btnToggleTheme');

    const inputWeight = document.getElementById('inputWeight');
    const inputReps = document.getElementById('inputReps');
    const inputSets = document.getElementById('inputSets');
    const btnSaveSet = document.getElementById('btnSaveSet');
    const btnResetFields = document.getElementById('btnResetFields');

    // Novos elementos do Cronômetro e Exercício
    const btnOpenTimer = document.getElementById('btnOpenTimer');
    const timerOverlay = document.getElementById('timerOverlay');
    const btnOverlayStart = document.getElementById('btnOverlayStart');
    const btnOverlayPause = document.getElementById('btnOverlayPause');
    const btnOverlayFinish = document.getElementById('btnOverlayFinish');

    const exerciseOptionsContainer = document.getElementById('exerciseOptionsContainer');
    const customExerciseContainer = document.getElementById('customExerciseContainer');
    const inputExerciseCustom = document.getElementById('inputExerciseCustom');

    // Inicialização do Tema Dark/Light
    const storedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', storedTheme);
    btnToggleTheme.innerText = storedTheme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Escuro';

    btnToggleTheme.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        btnToggleTheme.innerText = newTheme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Escuro';
    });

    // Inicializa o SQL.js
    initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` }).then(sql => {
        SQL = sql;
        btnOpenDB.disabled = false;
        btnCreateDB.disabled = false;
    }).catch(err => console.error("Erro ao carregar SQL.js:", err));

    // Define o treino do dia atual baseado no dia da semana real
    const hoje = new Date().getDay();
    if (currentDayWorkout) {
        currentDayWorkout.innerText = rotinaSemanal[hoje];
    }
    renderExerciseOptions();

    // Renderiza os checkboxes dos exercícios
    function renderExerciseOptions() {
        if (!exerciseOptionsContainer) return;
        exerciseOptionsContainer.innerHTML = '';
        const hoje = new Date().getDay();
        const exercicios = exerciciosPorDia[hoje] || [];

        exercicios.forEach(ex => {
            const div = document.createElement('div');
            div.innerHTML = `
                <label style="display: flex; align-items: center; gap: 8px; font-weight: normal; font-size: 14px; cursor: pointer; width: 100%; margin-bottom: 0;">
                    <input type="checkbox" class="exercise-checkbox" value="${ex}" style="margin-bottom: 0; width: auto;">
                    <span>${ex}</span>
                </label>
            `;
            exerciseOptionsContainer.appendChild(div);
        });

        // Adiciona a opção Outro
        const divOutro = document.createElement('div');
        divOutro.innerHTML = `
            <label style="display: flex; align-items: center; gap: 8px; font-weight: normal; font-size: 14px; cursor: pointer; width: 100%; margin-bottom: 0;">
                <input type="checkbox" id="chkExerciseOther" class="exercise-checkbox" value="Outro" style="margin-bottom: 0; width: auto;">
                <span style="font-weight: bold; color: var(--pico-primary);">Outro</span>
            </label>
        `;
        exerciseOptionsContainer.appendChild(divOutro);

        // Ouvinte de mudança para garantir seleção única e mostrar/esconder o campo outro
        const checkboxes = exerciseOptionsContainer.querySelectorAll('.exercise-checkbox');
        checkboxes.forEach(chk => {
            chk.addEventListener('change', (e) => {
                if (e.target.checked) {
                    checkboxes.forEach(other => {
                        if (other !== e.target) other.checked = false;
                    });
                }

                const otherChecked = document.getElementById('chkExerciseOther').checked;
                if (otherChecked) {
                    customExerciseContainer.classList.remove('hidden');
                    inputExerciseCustom.focus();
                } else {
                    customExerciseContainer.classList.add('hidden');
                }
            });
        });
    }

    // Evento de Conexão com Arquivo Local (Abrir Existente)
    btnOpenDB.addEventListener('click', async () => {
        try {
            const options = {
                types: [{
                    description: 'SQLite Database',
                    accept: { 'application/x-sqlite3': ['.db'] }
                }],
                multiple: false
            };
            const [handle] = await window.showOpenFilePicker(options);
            await processarFileHandle(handle, false);
        } catch (error) {
            console.error(error);
            alert("Operação cancelada ou sem permissão de escrita no arquivo escolhido.");
        }
    });

    // Evento de Conexão com Arquivo Local (Criar Novo)
    btnCreateDB.addEventListener('click', async () => {
        try {
            const options = {
                suggestedName: 'meu_progresso_treino.db',
                types: [{
                    description: 'SQLite Database',
                    accept: { 'application/x-sqlite3': ['.db'] }
                }]
            };
            const handle = await window.showSaveFilePicker(options);
            await processarFileHandle(handle, true);
        } catch (error) {
            console.error(error);
            alert("Operação cancelada ou erro ao criar o arquivo.");
        }
    });

    // Ação de Salvar Série
    btnSaveSet.addEventListener('click', async () => {
        // Obter o exercício selecionado
        let exercicio = "";
        const checkedCheckbox = exerciseOptionsContainer.querySelector('.exercise-checkbox:checked');
        if (checkedCheckbox) {
            if (checkedCheckbox.value === "Outro") {
                exercicio = inputExerciseCustom.value.trim();
            } else {
                exercicio = checkedCheckbox.value;
            }
        }

        const peso = parseFloat(inputWeight.value);
        const reps = parseInt(inputReps.value);
        const serie = parseInt(inputSets.value);
        const mainTimerValue = document.getElementById('mainTimerValue');
        const tempo = mainTimerValue ? mainTimerValue.innerText : "00:00";

        if (!exercicio || isNaN(peso) || isNaN(reps)) {
            alert("Por favor, selecione o exercício e preencha peso e repetições.");
            return;
        }

        // Insere no banco SQLite
        db.run("INSERT INTO historico_treino (exercicio, serie, peso, repeticoes, tempo) VALUES (?, ?, ?, ?, ?)", [exercicio, serie, peso, reps, tempo]);

        // Salva as alterações de volta no arquivo do computador
        await salvarBancoNoDisco();

        // Limpa/ajusta campos para a próxima série
        inputSets.value = serie + 1;
        inputReps.value = "";

        // Reseta e para o cronômetro
        stopAndResetTimer();

        alert("Série salva com sucesso no banco de dados!");
        carregarHistoricoHoje();
    });

    // Botão para Limpar Campos
    btnResetFields.addEventListener('click', () => {
        // Desmarca todos os checkboxes
        const checkboxes = exerciseOptionsContainer.querySelectorAll('.exercise-checkbox');
        checkboxes.forEach(chk => chk.checked = false);
        customExerciseContainer.classList.add('hidden');
        inputExerciseCustom.value = "";

        // Limpa inputs
        inputWeight.value = "";
        inputReps.value = "";
        inputSets.value = "1";

        // Reseta o cronômetro
        stopAndResetTimer();
    });

    // --- LÓGICA DO CRONÔMETRO ---
    btnOpenTimer.addEventListener('click', () => {
        timerOverlay.classList.remove('hidden');
        // Se já estiver rodando, mantemos o texto como Iniciar / Continuar
        btnOverlayStart.innerText = isTimerRunning ? "Executando..." : (totalSeconds > 0 ? "Continuar" : "Iniciar / Continuar");
        btnOverlayStart.disabled = isTimerRunning;
        btnOverlayPause.disabled = !isTimerRunning;
    });

    btnOverlayStart.addEventListener('click', () => {
        startTimer();
    });

    btnOverlayPause.addEventListener('click', () => {
        pauseTimer();
    });

    btnOverlayFinish.addEventListener('click', () => {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timerOverlay.classList.add('hidden');
        updateTimerDisplay();
    });
});
