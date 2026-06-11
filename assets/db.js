// db.js

// Variáveis Globais de Banco de Dados
let db = null;
let fileHandle = null;
let SQL = null; // Inicializado pelo initSqlJs no app.js

// Salva as alterações de volta no arquivo do computador
async function salvarBancoNoDisco() {
    if (!db || !fileHandle) return;

    // Verifica permissão de escrita antes de gravar
    const verifyOpts = { mode: 'readwrite' };
    if (await fileHandle.queryPermission(verifyOpts) !== 'granted') {
        if (await fileHandle.requestPermission(verifyOpts) !== 'granted') {
            alert("Sem permissão de escrita. Não foi possível salvar o progresso.");
            return;
        }
    }

    const data = db.export();
    const writable = await fileHandle.createWritable();
    await writable.write(data);
    await writable.close();
}

// Processa o arquivo SQLite selecionado (aberto ou criado)
async function processarFileHandle(handle, isNew) {
    fileHandle = handle;

    // Verifica permissão de escrita no início
    const verifyOpts = { mode: 'readwrite' };
    if (await fileHandle.queryPermission(verifyOpts) !== 'granted') {
        if (await fileHandle.requestPermission(verifyOpts) !== 'granted') {
            throw new Error("Sem permissão de escrita no arquivo escolhido.");
        }
    }

    // Tenta ler o arquivo se ele já existir e não for um banco novo
    const file = await fileHandle.getFile();
    const arrayBuffer = await file.arrayBuffer();

    if (arrayBuffer.byteLength > 0 && !isNew) {
        // Carrega o banco existente
        const uInt8Array = new Uint8Array(arrayBuffer);
        db = new SQL.Database(uInt8Array);
        
        // Tenta adicionar a coluna tempo se não existir (retrocompatibilidade)
        try {
            db.run("ALTER TABLE historico_treino ADD COLUMN tempo TEXT;");
        } catch (e) {
            // Coluna já existe, sem problemas
        }

        document.getElementById('dbStatus').innerText = "Conectado (Arquivo Carregado)";
    } else {
        // Cria um novo banco
        db = new SQL.Database();
        document.getElementById('dbStatus').innerText = "Conectado (Novo Banco Criado)";
        // Cria a tabela de treinos se não existir
        db.run(`CREATE TABLE IF NOT EXISTS historico_treino (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT DEFAULT (date('now','localtime')),
            hora TEXT DEFAULT (time('now','localtime')),
            exercicio TEXT,
            serie INTEGER,
            peso REAL,
            repeticoes INTEGER,
            tempo TEXT
        );`);
        await salvarBancoNoDisco();
    }

    const dbStatus = document.getElementById('dbStatus');
    const mainApp = document.getElementById('mainApp');
    const setupSection = document.getElementById('setupSection');

    dbStatus.style.color = "var(--pico-ins-color)";
    mainApp.classList.remove('hidden');
    setupSection.classList.add('connected-setup');

    carregarHistoricoHoje();
}

// Carrega registros inseridos no dia de hoje na tabela visual
function carregarHistoricoHoje() {
    if (!db) return;
    const logTableBody = document.getElementById('logTableBody');
    if (!logTableBody) return;
    logTableBody.innerHTML = "";

    const stmt = db.prepare("SELECT hora, exercicio, serie, peso, repeticoes, tempo FROM historico_treino WHERE data = date('now','localtime') ORDER BY id DESC");

    while (stmt.step()) {
        const row = stmt.getAsObject();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.hora}</td>
            <td>${row.exercicio}</td>
            <td>${row.serie}º</td>
            <td>${row.peso} kg</td>
            <td>${row.repeticoes}</td>
            <td>${row.tempo ? row.tempo : '-'}</td>
        `;
        logTableBody.appendChild(tr);
    }
    stmt.free();
}
