// Painel flutuante para editar os pontos de um grupo

let _editGroupIndex = -1;
let _onSave = null; // callback(index, pts)

function openPointEditor(groupIndex, group, onSave) {
  _editGroupIndex = groupIndex;
  _onSave = onSave;

  const overlay = document.getElementById('editor-overlay');
  const titulo = document.getElementById('editor-title');
  const tbody = document.getElementById('editor-tbody');

  titulo.textContent = `Grupo: ${group.name}`;
  _renderEditorRows(tbody, group.points);

  overlay.style.display = 'flex';
}

function closePointEditor() {
  document.getElementById('editor-overlay').style.display = 'none';
  _editGroupIndex = -1;
  _onSave = null;
}

function _renderEditorRows(tbody, pts) {
  tbody.innerHTML = '';
  pts.forEach((p, i) => _appendRow(tbody, i, p.x, p.y, p.z));
}

function _appendRow(tbody, index, x, y, z) {
  const tr = document.createElement('tr');
  tr.dataset.index = index;
  tr.innerHTML = `
    <td class="ed-index">${index}</td>
    <td><input class="ed-inp" data-ax="x" type="number" step="any" value="${+x.toFixed(8)}"></td>
    <td><input class="ed-inp" data-ax="y" type="number" step="any" value="${+y.toFixed(8)}"></td>
    <td><input class="ed-inp" data-ax="z" type="number" step="any" value="${+z.toFixed(8)}"></td>
    <td><button class="ed-del" title="Remover ponto">x</button></td>
  `;
  tr.querySelector('.ed-del').addEventListener('click', () => {
    tr.remove();
    _renumberRows();
  });
  tbody.appendChild(tr);
}

function _renumberRows() {
  const tbody = document.getElementById('editor-tbody');
  tbody.querySelectorAll('tr').forEach((tr, i) => {
    tr.dataset.index = i;
    tr.querySelector('.ed-index').textContent = i;
  });
}

function _readRows() {
  const tbody = document.getElementById('editor-tbody');
  const pts = [];
  for (const tr of tbody.querySelectorAll('tr')) {
    const x = parseFloat(tr.querySelector('[data-ax=x]').value);
    const y = parseFloat(tr.querySelector('[data-ax=y]').value);
    const z = parseFloat(tr.querySelector('[data-ax=z]').value);
    if (isNaN(x) || isNaN(y) || isNaN(z)) continue;
    pts.push({ x, y, z });
  }
  return pts;
}

function initPointEditor() {
  // Botão salvar
  document.getElementById('editor-save').addEventListener('click', () => {
    const pts = dedupPoints(_readRows());
    if (pts.length < 4) {
      alert('Mínimo 4 pontos válidos após deduplicação.');
      return;
    }
    if (_onSave) _onSave(_editGroupIndex, pts);
    closePointEditor();
  });

  // Botões de fechar/cancelar
  document.getElementById('editor-cancel').addEventListener('click', closePointEditor);
  document.getElementById('editor-close-btn').addEventListener('click', closePointEditor);

  // Fechar ao clicar no fundo escuro (mousedown evita conflito com drag)
  document.getElementById('editor-overlay').addEventListener('mousedown', (e) => {
    if (e.target === e.currentTarget) closePointEditor();
  });

  // Botão adicionar linha em branco e rolar até ela
  document.getElementById('editor-add-row').addEventListener('click', () => {
    const tbody = document.getElementById('editor-tbody');
    const index = tbody.querySelectorAll('tr').length;
    _appendRow(tbody, index, 0, 0, 0);
    const body = document.querySelector('.editor-body');
    if (body) body.scrollTop = body.scrollHeight;
  });
}

