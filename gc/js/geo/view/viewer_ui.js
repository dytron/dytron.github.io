const state = {
  op: 'hull_group', // 'hull_group' | 'hull_global' | 'tet'
  rawGroups: [], // [{ name, points }]
  groups: [], // grupos com resultado de hull ou tet
  calcMs: null, // tempo do último cálculo em ms
};

const stepState = {
  active: false,
  sequences: null,
  frames: null,
  current: 0,
  playing: false,
  frameId: 0,
  autoStartMs: 0,
  autoStartStep: 0,
  stepDurationMs: 0,
};

function _setStatus(msg) {
  const el = document.getElementById('status');
  if (el) el.textContent = msg;
}

function _updateStatus() {
  if (!state.groups.length) {
    _setStatus('Pronto.');
    return;
  }
  const nGrupos = state.groups.length;
  const nPts = state.groups.reduce((s, g) => s + (g.inputPoints ? g.inputPoints.length : 0), 0);
  const nV = state.groups.reduce(
    (s, g) => s + (g.hullVerts ? g.hullVerts.length / 3 : g.tetVerts ? g.tetVerts.length / 3 : 0),
    0
  );
  const nF = state.groups.reduce((s, g) => s + (g.hullFaces ? g.hullFaces.length / 3 : 0), 0);
  const nT = state.groups.reduce((s, g) => s + (g.tets ? g.tets.length / 4 : 0), 0);
  const temFecho = state.groups.some((g) => g.hullIndices && g.hullIndices.length);
  const nNoFecho = state.groups.reduce((s, g) => s + (g.hullIndices ? g.hullIndices.length : 0), 0);
  let msg = `${nGrupos} grupo(s) | ${nPts} pontos`;
  if (temFecho) msg += ` (${nNoFecho} no fecho)`;
  else if (nV) msg += ` | ${nV} vértices`;
  if (nF) msg += ` | ${nF} faces`;
  if (nT) msg += ` | ${nT} tetraedros`;
  if (state.calcMs !== null) msg += ` | ${state.calcMs} ms`;
  _setStatus(msg);
}

function _syncSelect(id, keepFirst) {
  const select = document.getElementById(id);
  if (!select) return;
  const prev = +select.value;
  while (select.options.length > keepFirst) select.remove(keepFirst);
  state.rawGroups.forEach((g, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `[${i}] ${g.name} (${g.points.length}pt)`;
    select.appendChild(opt);
  });
  if (prev >= 0 && prev < state.rawGroups.length) select.value = prev;
}

function _renderGroupList() {
  const list = document.getElementById('group-list');
  if (!list) return;

  const total = state.rawGroups.reduce((s, g) => s + g.points.length, 0);
  const countEl = document.getElementById('group-count');
  if (countEl)
    countEl.textContent = state.rawGroups.length ? `(${state.rawGroups.length} - ${total}pt)` : '';

  list.innerHTML = '';

  state.rawGroups.forEach((g, i) => {
    const row = document.createElement('div');
    row.className = 'group-item' + (g.hidden ? ' group-hidden' : '');
    const cor = '#' + GROUP_COLORS[i % GROUP_COLORS.length].toString(16).padStart(6, '0');
    row.innerHTML = `
      <span class="group-dot" style="background:${cor}"></span>
      <span class="group-name">${g.name}</span>
      <span class="group-count">${g.points.length}pt</span>
      <button class="group-norm" data-i="${i}" title="Normalizar grupo">N</button>
      <input type="checkbox" class="group-vis" data-i="${i}" title="Visível" ${g.hidden ? '' : 'checked'}>
      <button class="group-edit" data-i="${i}" title="Editar pontos" aria-label="Editar pontos">
        <img class="icon-svg group-edit-icon" src="assets/icons/pen.svg" alt="">
      </button>
      <button class="group-del" data-i="${i}" title="Remover">x</button>
    `;
    list.appendChild(row);
  });

  // Sincroniza os três selects de destino
  _syncSelect('target-group-prim', 1); // "Novo grupo" = opção 0
  _syncSelect('target-group-manual', 1);
  _syncSelect('target-group-sample', 1); // "Todos" = opção 0

  list.querySelectorAll('.group-vis').forEach((cb) => {
    cb.addEventListener('change', () => {
      state.rawGroups[+cb.dataset.i].hidden = !cb.checked;
      cb.closest('.group-item').classList.toggle('group-hidden', !cb.checked);
      _showRawGroups();
    });
  });

  list.querySelectorAll('.group-edit').forEach((btn) => {
    btn.addEventListener('click', () => {
      const i = +btn.dataset.i;
      openPointEditor(i, state.rawGroups[i], (index, pts) => {
        state.rawGroups[index].points = pts;
        _renderGroupList();
        _showRawGroups();
      });
    });
  });

  list.querySelectorAll('.group-norm').forEach((btn) => {
    btn.addEventListener('click', () => {
      const i = +btn.dataset.i;
      const group = state.rawGroups[i];
      group.points = centerPoints(group.points, true);
      _renderGroupList();
      _showRawGroups();
      _setStatus(`Grupo "${group.name}" normalizado.`);
    });
  });

  list.querySelectorAll('.group-del').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.rawGroups.splice(+btn.dataset.i, 1);
      _renderGroupList();
      _showRawGroups();
    });
  });
}

// Retorna o índice do grupo destino (-1 = novo grupo)
function _targetIndex(selectId) {
  const select = document.getElementById(selectId);
  return select ? +select.value : -1;
}

function _applyImportOpts(pts) {
  const center = document.getElementById('opt-center')?.checked;
  const normalize = document.getElementById('opt-normalize')?.checked;
  if (center || normalize) return centerPoints(pts, normalize);
  return pts;
}

// Adiciona ou mescla pontos conforme o destino selecionado
function _addPoints(pts, nomeNovo, selectId) {
  const index = _targetIndex(selectId);
  if (index >= 0 && index < state.rawGroups.length) {
    // Mescla no grupo existente e deduplica
    const merged = dedupPoints(state.rawGroups[index].points.concat(pts));
    state.rawGroups[index].points = merged;
  } else {
    state.rawGroups.push({ name: nomeNovo, points: pts });
  }
  _renderGroupList();
  _showRawGroups();
  const total = state.rawGroups.reduce((s, g) => s + g.points.length, 0);
  _setStatus(`${state.rawGroups.length} grupo(s), ${total} pontos. Clique em Calcular.`);
}

function _readStepTotalMs() {
  const input = document.getElementById('step-total-ms');
  if (!input) return 4000;
  let totalMs = Math.round(+input.value || 0);
  if (totalMs < 100) totalMs = 100;
  input.value = totalMs;
  return totalMs;
}

function _syncStepControls() {
  const playBtn = document.getElementById('btn-step-play');
  const prevBtn = document.getElementById('btn-step-prev');
  const nextBtn = document.getElementById('btn-step-next');
  const hasSteps = !!(stepState.frames && stepState.frames.length);
  const lastStep = hasSteps ? stepState.frames.length - 1 : 0;

  if (playBtn) {
    playBtn.disabled = !hasSteps || lastStep === 0;
    playBtn.textContent = stepState.playing ? 'Pausar' : 'Automático';
  }
  if (prevBtn) prevBtn.disabled = !hasSteps || stepState.playing || stepState.current === 0;
  if (nextBtn)
    nextBtn.disabled = !hasSteps || stepState.playing || stepState.current === lastStep;
}

function _stopStepAuto() {
  if (stepState.frameId) cancelAnimationFrame(stepState.frameId);
  stepState.frameId = 0;
  stepState.playing = false;
  _syncStepControls();
}

function _stepAutoTick(now) {
  if (!stepState.playing || !stepState.frames) return;
  const lastStep = stepState.frames.length - 1;
  const elapsedMs = now - stepState.autoStartMs;
  const walked = Math.floor(elapsedMs / stepState.stepDurationMs);
  const target = Math.min(lastStep, stepState.autoStartStep + walked);

  if (target !== stepState.current) _renderStep(target);

  if (target >= lastStep) {
    _stopStepAuto();
    return;
  }

  stepState.frameId = requestAnimationFrame(_stepAutoTick);
}

function _startStepAuto() {
  if (!stepState.frames || stepState.frames.length < 2) return;
  const lastStep = stepState.frames.length - 1;
  if (stepState.current >= lastStep) _renderStep(0);

  const totalMs = _readStepTotalMs();
  stepState.stepDurationMs = totalMs / lastStep;
  stepState.autoStartMs = performance.now();
  stepState.autoStartStep = stepState.current;
  stepState.playing = true;
  _syncStepControls();
  stepState.frameId = requestAnimationFrame(_stepAutoTick);
}

function _toggleStepAuto() {
  if (stepState.playing) _stopStepAuto();
  else _startStepAuto();
}

function _buildStepFrames(sequences) {
  const frames = [];
  for (let seqIndex = 0; seqIndex < sequences.length; seqIndex++) {
    const sequence = sequences[seqIndex];
    for (let stepIndex = 0; stepIndex < sequence.steps.length; stepIndex++) {
      frames.push({ seqIndex, stepIndex });
    }
  }
  return frames;
}

function _buildStepHullGroup(sequence, step) {
  const hull = j3dBuildOutput({ faces: step.faces }, sequence.pts);

  return {
    name: sequence.name,
    inputPoints: sequence.pts,
    hullVerts: hull.verts,
    hullFaces: hull.faces,
    hullIndices: hull.hullIndices,
    tetVerts: null,
    tets: null,
    color: sequence.color || GROUP_COLORS[0],
  };
}

function _renderStep(i) {
  const frame = stepState.frames[i];
  const sequence = stepState.sequences[frame.seqIndex];
  const { pts, steps } = sequence;
  stepState.current = i;
  const step = steps[frame.stepIndex];

  document.getElementById('step-counter').textContent = `Passo ${i + 1} de ${stepState.frames.length}`;
  document.getElementById('step-group-label').textContent =
    `Fechando grupo ${frame.seqIndex + 1}/${stepState.sequences.length}: ${sequence.name}`;
  _syncStepControls();

  const groups = [];
  for (let seqIndex = 0; seqIndex < frame.seqIndex; seqIndex++) {
    const finishedSequence = stepState.sequences[seqIndex];
    groups.push(_buildStepHullGroup(finishedSequence, finishedSequence.steps[finishedSequence.steps.length - 1]));
  }
  groups.push(_buildStepHullGroup(sequence, step));

  const pa = step.activeEdge ? pts[step.activeEdge.a] : null;
  const pb = step.activeEdge ? pts[step.activeEdge.b] : null;
  setActiveEdge(pa, pb);

  setGroups(groups);
}

function _enterStepMode(sequences) {
  _stopStepAuto();
  stepState.active = true;
  stepState.sequences = sequences;
  stepState.frames = _buildStepFrames(sequences);
  stepState.current = 0;
  const panel = document.getElementById('step-panel');
  panel.style.display = '';
  panel.open = true;
  _renderStep(0);
}

function _exitStepMode() {
  _stopStepAuto();
  stepState.active = false;
  stepState.sequences = null;
  stepState.frames = null;
  stepState.current = 0;
  document.getElementById('step-group-label').textContent = 'Grupo: todos';
  _syncStepControls();
  document.getElementById('step-panel').style.display = 'none';
  setActiveEdge(null, null);
  _showRawGroups();
}

// Exibe os grupos brutos na cena sem calcular hull ou tet
function _showRawGroups() {
  setGroups(
    state.rawGroups.map((g, i) => ({
      name: g.name,
      inputPoints: g.points,
      hullVerts: null,
      hullFaces: null,
      hullIndices: null,
      tetVerts: null,
      tets: null,
      color: GROUP_COLORS[i % GROUP_COLORS.length],
      hidden: g.hidden || false,
    }))
  );
  state.groups = [];
  _hideTetList();
}

function _renderTetRows(gIndex) {
  const list = document.getElementById('tet-list');
  if (!list) return;
  const g = state.groups[gIndex];
  list.innerHTML = '';
  selectTet(-1, -1);

  const nTets = g.tets.length / 4;
  for (let t = 0; t < nTets; t++) {
    const i0 = g.tets[t * 4],
      i1 = g.tets[t * 4 + 1],
      i2 = g.tets[t * 4 + 2],
      i3 = g.tets[t * 4 + 3];
    const item = document.createElement('div');
    item.className = 'tet-item';
    item.dataset.index = t;
    item.innerHTML = `<span class="tet-index">#${t}</span><span class="tet-verts">${i0} ${i1} ${i2} ${i3}</span>`;
    item.addEventListener('click', () => {
      const jaEstavaSelecionado = item.classList.contains('selected');
      document
        .querySelectorAll('.tet-item.selected')
        .forEach((el) => el.classList.remove('selected'));
      if (jaEstavaSelecionado) {
        selectTet(-1, -1);
        return;
      }
      item.classList.add('selected');
      selectTet(gIndex, +item.dataset.index);
    });
    list.appendChild(item);
  }
}

function _renderTetList() {
  const panel = document.getElementById('tet-panel');
  const sel = document.getElementById('tet-group-select');
  if (!panel || !sel) return;

  const gruposComTet = state.groups
    .map((g, i) => ({ g, i }))
    .filter(({ g }) => g.tets && g.tets.length);

  if (!gruposComTet.length) {
    panel.style.display = 'none';
    return;
  }

  panel.style.display = '';
  panel.open = true;

  // Reconstrói o select preservando a seleção se possível
  const prevVal = sel.value;
  sel.innerHTML = '';
  gruposComTet.forEach(({ g, i }) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `[${i}] ${g.name} (${g.tets.length / 4} tets)`;
    sel.appendChild(opt);
  });
  if ([...sel.options].some((o) => o.value === prevVal)) sel.value = prevVal;

  _renderTetRows(+sel.value);
}

function _hideTetList() {
  const panel = document.getElementById('tet-panel');
  if (panel) panel.style.display = 'none';
}

function _applyCapabilities() {
  if (isTetrahedralizeAvailable()) return;

  const tetOp = document.querySelector('input[name="op"][value="tet"]');
  if (tetOp) {
    tetOp.disabled = true;
    tetOp.checked = false;
  }

  const hullGroupOp = document.querySelector('input[name="op"][value="hull_group"]');
  if (hullGroupOp) hullGroupOp.checked = true;
  state.op = 'hull_group';

  const visTets = document.getElementById('vis-tets');
  if (visTets) {
    visTets.checked = false;
    visTets.disabled = true;
  }

  const exportMode = document.getElementById('export-mode');
  if (exportMode) {
    const tetOption = exportMode.querySelector('option[value="tets"]');
    if (tetOption) tetOption.disabled = true;
    if (exportMode.value === 'tets') exportMode.value = 'hull';
  }

  _hideTetList();
}

// Adiciona ou mescla pontos da primitiva selecionada no grupo destino
function addPrimitiveGroup() {
  const pts = getPrimitivePoints();
  if (!pts) {
    _setStatus('Mínimo 4 pontos únicos.');
    return;
  }
  const nome = getPrimitiveName();
  _addPoints(pts, nome, 'target-group-prim');
}

// Remove todos os grupos e limpa a cena
function clearGroups() {
  state.rawGroups = [];
  state.groups = [];
  state.calcMs = null;
  _renderGroupList();
  setGroups([]);
  _hideTetList();
  _setStatus('Pronto.');
}

// Calcula hull ou tet para todos os grupos acumulados
async function calculate() {
  if (!state.rawGroups.length) {
    _setStatus('Adicione pontos primeiro.');
    return;
  }
  if (state.op === 'tet' && !isTetrahedralizeAvailable()) {
    _setStatus('Tetraedralização não disponível nesta versão.');
    return;
  }
  _setStatus('Calculando...');
  const t0 = performance.now();

  try {
    const processados = [];

    if (state.op === 'hull_global') {
      // Junta todos os pontos num único conjunto e calcula um fecho só
      const todosPontos = state.rawGroups.flatMap((g) => g.points);
      const deduped = dedupPoints(todosPontos);
      const r = await convexHull3D(deduped);
      processados.push({
        name: 'global',
        inputPoints: deduped,
        hullVerts: r.verts,
        hullFaces: r.faces,
        hullIndices: r.hullIndices,
        tetVerts: null,
        tets: null,
        color: GROUP_COLORS[0],
      });
    } else if (state.op === 'hull_group') {
      // Fecho separado para cada grupo
      for (let i = 0; i < state.rawGroups.length; i++) {
        const { name, points, hidden } = state.rawGroups[i];
        const cor = GROUP_COLORS[i % GROUP_COLORS.length];
        if (state.rawGroups.length > 1)
          _setStatus(`Calculando grupo "${name}" (${i + 1}/${state.rawGroups.length})...`);
        const r = await convexHull3D(points);
        processados.push({
          name,
          inputPoints: points,
          hullVerts: r.verts,
          hullFaces: r.faces,
          hullIndices: r.hullIndices,
          tetVerts: null,
          tets: null,
          color: cor,
          hidden: hidden || false,
        });
      }
    } else {
      // Tetraedralização por grupo
      const avisos = [];
      for (let i = 0; i < state.rawGroups.length; i++) {
        const { name, points, hidden } = state.rawGroups[i];
        const cor = GROUP_COLORS[i % GROUP_COLORS.length];
        if (state.rawGroups.length > 1)
          _setStatus(`Calculando grupo "${name}" (${i + 1}/${state.rawGroups.length})...`);
        let tetVerts = null,
          tets = null;
        try {
          const r = await tetrahedralize(points);
          tetVerts = r.verts;
          tets = r.tets;
          if (!tets || tets.length === 0)
            avisos.push(`"${name}": sem tetraedros (pontos degenerados?)`);
        } catch (err) {
          avisos.push(`"${name}": falhou - ${err.message}`);
        }
        processados.push({
          name,
          inputPoints: points,
          hullVerts: null,
          hullFaces: null,
          hullIndices: null,
          tetVerts,
          tets,
          color: cor,
          hidden: hidden || false,
        });
      }
      if (avisos.length) console.warn('Tetraedralização:', avisos.join('; '));
    }

    state.groups = processados;
    state.calcMs = Math.round(performance.now() - t0);
    _stopStepAuto();
    stepState.active = false;
    document.getElementById('step-panel').style.display = 'none';
    setActiveEdge(null, null);

    if (state.op === 'tet') {
      const cb = document.getElementById('vis-tets');
      if (cb && !cb.checked) {
        cb.checked = true;
        setLayerVis('showTets', true);
      }
      _renderTetList();
    } else {
      _hideTetList();
    }
    setGroups(state.groups);
    _updateStatus();
  } catch (e) {
    _setStatus('Erro: ' + e.message);
  }
}

// Importa grupos de um arquivo OBJ e acumula (ou mescla no destino)
function importOBJ(text) {
  _setStatus('Lendo OBJ...');
  const parsed = parseOBJ(text);
  if (!parsed.length) {
    _setStatus('Nenhum grupo encontrado no OBJ.');
    return;
  }

  let novos = parsed
    .map(({ name, points }) => ({ name, points: dedupPoints(points) }))
    .filter((g) => g.points.length >= 4);

  if (!novos.length) {
    _setStatus('Nenhum grupo com pontos suficientes.');
    return;
  }

  // centralizar/normalizar usando o centroide global de todos os grupos juntos
  const center = document.getElementById('opt-center')?.checked;
  const normalize = document.getElementById('opt-normalize')?.checked;
  if (center || normalize) {
    const todos = novos.flatMap((g) => g.points);
    let cx = 0,
      cy = 0,
      cz = 0;
    for (const p of todos) {
      cx += p.x;
      cy += p.y;
      cz += p.z;
    }
    cx /= todos.length;
    cy /= todos.length;
    cz /= todos.length;
    let escala = 1;
    if (normalize) {
      // normaliza pelo maior semi-eixo do bounding box (consistente com half=1 do cubo)
      let minX = Infinity,
        maxX = -Infinity;
      let minY = Infinity,
        maxY = -Infinity;
      let minZ = Infinity,
        maxZ = -Infinity;
      for (const p of todos) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
        if (p.z < minZ) minZ = p.z;
        if (p.z > maxZ) maxZ = p.z;
      }
      const semi = Math.max(maxX - minX, maxY - minY, maxZ - minZ) / 2;
      if (semi > 1e-10) escala = 1 / semi;
    }
    novos = novos.map((g) => ({
      name: g.name,
      points: g.points.map((p) => ({
        x: (p.x - cx) * escala,
        y: (p.y - cy) * escala,
        z: (p.z - cz) * escala,
      })),
    }));
  }

  // OBJ importado via toolbar sempre cria novos grupos
  novos.forEach((g) => state.rawGroups.push(g));

  _renderGroupList();
  _showRawGroups();
  const total = state.rawGroups.reduce((s, g) => s + g.points.length, 0);
  _setStatus(`${state.rawGroups.length} grupo(s), ${total} pontos únicos. Clique em Calcular.`);
}

function _parseManualPoints() {
  const ta = document.getElementById('manual-points');
  if (!ta) return null;
  const linhas = ta.value
    .trim()
    .split('\n')
    .filter((l) => l.trim());
  const pts = [];
  for (const linha of linhas) {
    const partes = linha.trim().split(/[\s,;]+/);
    if (partes.length < 3) continue;
    const x = parseFloat(partes[0]),
      y = parseFloat(partes[1]),
      z = parseFloat(partes[2]);
    if (isNaN(x) || isNaN(y) || isNaN(z)) continue;
    pts.push({ x, y, z });
  }
  const deduped = dedupPoints(pts);
  if (deduped.length < 4) {
    _setStatus('Mínimo 4 pontos válidos (x y z por linha).');
    return null;
  }
  return deduped;
}

function exportOBJ() {
  const mode = document.getElementById('export-mode')?.value || 'hull';

  const fonte = mode === 'points' ? state.rawGroups : state.groups;
  if (!fonte.length) {
    _setStatus('Nada para exportar.');
    return;
  }

  // Formato exportado: grupos separados por "g", com vértices e faces
  // intercalados por grupo. Índices de face são globais e 1-based.
  const linhas = ['# Exportado pelo Geo Viewer'];
  let totalVerts = 0;

  for (const g of fonte) {
    if (mode === 'points') {
      linhas.push(`g ${g.name}`);
      for (const p of g.points) {
        linhas.push(`v ${p.x} ${p.y} ${p.z}`);
        totalVerts++;
      }
      continue;
    }

    const verts = mode === 'hull' ? g.hullVerts : g.tetVerts;
    const faces = mode === 'hull' ? g.hullFaces : g.tets ? _tetFaces(g.tets) : null;
    if (!verts || !faces || faces.length === 0) continue;

    linhas.push(`g ${g.name}`);
    const base = totalVerts + 1; // índice global do primeiro vértice deste grupo
    const nVerts = verts.length / 3;
    for (let i = 0; i < nVerts; i++) {
      linhas.push(`v ${verts[i * 3]} ${verts[i * 3 + 1]} ${verts[i * 3 + 2]}`);
      totalVerts++;
    }
    const nFaces = faces.length / 3;
    for (let t = 0; t < nFaces; t++) {
      const a = base + faces[t * 3];
      const b = base + faces[t * 3 + 1];
      const c = base + faces[t * 3 + 2];
      linhas.push(`f ${a} ${b} ${c}`);
    }
  }

  const obj = linhas.join('\n');
  const blob = new Blob([obj], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.href = url;
  a.download = `geo_${mode}.obj`;
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Converte lista de tets (4 índices cada) nas faces únicas da boundary
function _tetFaces(tets) {
  const count = new Map();
  const nTets = tets.length / 4;
  for (let t = 0; t < nTets; t++) {
    const [a, b, c, d] = [tets[t * 4], tets[t * 4 + 1], tets[t * 4 + 2], tets[t * 4 + 3]];
    for (const tri of [
      [a, b, c],
      [a, b, d],
      [a, c, d],
      [b, c, d],
    ]) {
      const key = mergeSort(tri, (x, y) => x - y).join(',');
      count.set(key, (count.get(key) || 0) + 1);
    }
  }
  const faces = [];
  const nTets2 = tets.length / 4;
  for (let t = 0; t < nTets2; t++) {
    const [a, b, c, d] = [tets[t * 4], tets[t * 4 + 1], tets[t * 4 + 2], tets[t * 4 + 3]];
    for (const tri of [
      [a, b, c],
      [a, b, d],
      [a, c, d],
      [b, c, d],
    ]) {
      const key = mergeSort(tri, (x, y) => x - y).join(',');
      if (count.get(key) === 1) faces.push(...tri);
    }
  }
  return faces;
}

function _bindUI() {
  // Operação
  document.querySelectorAll('input[name="op"]').forEach((r) => {
    r.addEventListener('change', () => {
      state.op = r.value;
    });
  });

  // Troca de grupo na lista de tetraedros
  document.getElementById('tet-group-select').addEventListener('change', (e) => {
    _renderTetRows(+e.target.value);
  });

  document.getElementById('btn-add').addEventListener('click', addPrimitiveGroup);
  document.getElementById('btn-clear').addEventListener('click', clearGroups);
  document.getElementById('btn-calculate').addEventListener('click', calculate);

  document.getElementById('btn-step-mode').addEventListener('click', () => {
    if (!state.rawGroups.length) {
      _setStatus('Adicione pontos primeiro.');
      return;
    }
    if (state.op === 'tet') {
      _setStatus('Passo a passo só funciona para fecho convexo.');
      return;
    }

    const sequences = [];

    if (state.op === 'hull_group') {
      for (let i = 0; i < state.rawGroups.length; i++) {
        const group = state.rawGroups[i];
        const result = jarvis3DSteps(group.points);
        if (!result) continue;
        sequences.push({
          name: group.name,
          pts: result.pts,
          steps: result.steps,
          color: GROUP_COLORS[i % GROUP_COLORS.length],
        });
      }
    } else {
      const pts = state.rawGroups.flatMap((g) => g.points);
      const result = jarvis3DSteps(pts);
      if (result) {
        sequences.push({
          name: 'todos',
          pts: result.pts,
          steps: result.steps,
          color: GROUP_COLORS[0],
        });
      }
    }

    if (!sequences.length) {
      _setStatus('Pontos insuficientes (mínimo 4).');
      return;
    }

    const totalSteps = sequences.reduce((sum, sequence) => sum + sequence.steps.length, 0);
    _enterStepMode(sequences);
    _setStatus(`${totalSteps} passos em ${sequences.length} grupo(s). Use os botões ou o modo automático.`);
  });

  document.getElementById('btn-step-play').addEventListener('click', _toggleStepAuto);

  document.getElementById('btn-step-prev').addEventListener('click', () => {
    if (stepState.current > 0) _renderStep(stepState.current - 1);
  });

  document.getElementById('btn-step-next').addEventListener('click', () => {
    if (stepState.frames && stepState.current < stepState.frames.length - 1) {
      _renderStep(stepState.current + 1);
    }
  });

  document.getElementById('btn-step-exit').addEventListener('click', _exitStepMode);
  document.getElementById('step-total-ms').addEventListener('change', _readStepTotalMs);

  async function _sampleGroup(index, n) {
    const raw = state.rawGroups[index];
    if (raw.points.length < 4) return 0;
    let hv = state.groups[index]?.hullVerts || null;
    let hf = state.groups[index]?.hullFaces || null;
    if (!hv || !hf) {
      try {
        const r = await convexHull3D(raw.points);
        hv = r.verts;
        hf = r.faces;
      } catch (_) {}
    }
    const novos = sampleConvex(raw.points, n, hv, hf);
    state.rawGroups[index].points = dedupPoints(raw.points.concat(novos));
    return novos.length;
  }

  document.getElementById('btn-sample').addEventListener('click', async () => {
    if (!state.rawGroups.length) {
      _setStatus('Nenhum grupo para amostrar.');
      return;
    }
    const n = Math.max(1, parseInt(document.getElementById('sample-n').value) || 200);
    const selVal = +document.getElementById('target-group-sample').value;
    let total = 0;
    if (selVal === -2) {
      for (let i = 0; i < state.rawGroups.length; i++) total += await _sampleGroup(i, n);
      _renderGroupList();
      _showRawGroups();
      _setStatus(`${total} pontos adicionados em ${state.rawGroups.length} grupo(s).`);
    } else {
      total = await _sampleGroup(selVal, n);
      _renderGroupList();
      _showRawGroups();
      _setStatus(`${total} pontos adicionados ao grupo "${state.rawGroups[selVal].name}".`);
    }
  });

  // Adiciona grupo a partir de pontos digitados manualmente
  const btnManual = document.getElementById('btn-add-manual');
  if (btnManual) {
    btnManual.addEventListener('click', () => {
      const pts = _parseManualPoints();
      if (!pts) return;
      _addPoints(pts, 'manual', 'target-group-manual');
    });
  }

  // Carrega arquivo OBJ (reset do value permite recarregar o mesmo arquivo)
  const fileInput = document.getElementById('obj-file');
  if (fileInput) {
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        importOBJ(e.target.result);
        fileInput.value = '';
      };
      reader.readAsText(file);
    });
  }

  // Checkboxes de visualização
  const visMap = {
    'vis-points': 'showPoints',
    'vis-hull': 'showHull',
    'vis-edges': 'showHullEdges',
    'vis-tets': 'showTets',
    'vis-numbers': 'showNumbers',
  };
  for (const [id, chave] of Object.entries(visMap)) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.addEventListener('change', () => {
      setLayerVis(chave, el.checked);
      if (id === 'vis-numbers')
        document.getElementById('numsize-row').style.display = el.checked ? '' : 'none';
    });
  }

  // Sliders
  const opSlider = document.getElementById('hull-opacity');
  const opVal = document.getElementById('hull-opacity-val');
  if (opSlider)
    opSlider.addEventListener('input', () => {
      const v = parseFloat(opSlider.value);
      if (opVal) opVal.textContent = v.toFixed(2);
      setOpacity(v);
    });

  const ptSlider = document.getElementById('point-size');
  const ptVal = document.getElementById('point-size-val');
  if (ptSlider)
    ptSlider.addEventListener('input', () => {
      const v = parseFloat(ptSlider.value);
      if (ptVal) ptVal.textContent = v.toFixed(3);
      setPointSize(v);
    });

  const nsSlider = document.getElementById('num-size');
  const nsVal = document.getElementById('num-size-val');
  if (nsSlider)
    nsSlider.addEventListener('input', () => {
      const v = +nsSlider.value;
      if (nsVal) nsVal.textContent = v;
      setNumSize(v);
    });

  document.getElementById('btn-export-obj').addEventListener('click', exportOBJ);

  // Toggle da grid na toolbar
  const btnSaveImg = document.getElementById('btn-save-img');
  if (btnSaveImg) {
    btnSaveImg.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = document.getElementById('canvas').toDataURL('image/png');
      a.download = 'geo_viewer.png';
      a.click();
    });
  }

  const btnGrid = document.getElementById('btn-toggle-grid');
  if (btnGrid) {
    btnGrid.addEventListener('click', () => {
      const ativo = btnGrid.classList.toggle('active');
      setGridVisible(ativo);
    });
  }

  // Toggle dos eixos na toolbar
  const btnAxes = document.getElementById('btn-toggle-axes');
  if (btnAxes) {
    setAxesVisible(true);
    btnAxes.addEventListener('click', () => {
      const ativo = btnAxes.classList.toggle('active');
      setAxesVisible(ativo);
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initViewerScene(document.getElementById('canvas'));
  initPrimitiveUI();
  initPointEditor();
  _applyCapabilities();
  _bindUI();
  _setStatus('Pronto.');
});

