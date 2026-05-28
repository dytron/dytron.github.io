// Parâmetros extras por primitiva (tipo -> lista de campos)
const PRIM_PARAMS = {
  cube: [{ id: 'cube_half', label: 'Metade do lado', min: 0.1, max: 10, step: 0.1, def: 1.0 }],
  sphere: [{ id: 'sphere_radius', label: 'Raio', min: 0.1, max: 10, step: 0.1, def: 1.0 }],
  cone: [
    { id: 'cone_radius', label: 'Raio', min: 0.1, max: 5, step: 0.1, def: 1.0 },
    { id: 'cone_height', label: 'Altura', min: 0.1, max: 5, step: 0.1, def: 2.0 },
  ],
  cylinder: [
    { id: 'cyl_radius', label: 'Raio', min: 0.1, max: 5, step: 0.1, def: 1.0 },
    { id: 'cyl_height', label: 'Altura', min: 0.1, max: 5, step: 0.1, def: 2.0 },
  ],
};

// Tipos que têm sub-opção de superfície
const PRIM_HAS_SURFACE = { sphere: true, cylinder: true };

let _tipoPrim = 'cube';
let _superficie = false; // sub-opção de superfície para sphere/cylinder
let _nPrim = 100;

function _getParamVal(paramId, fallback) {
  const el = document.getElementById(paramId);
  return el ? parseFloat(el.value) || fallback : fallback;
}

// Reconstrói os campos de parâmetro conforme a primitiva selecionada
function _renderParams() {
  const container = document.getElementById('prim-params');
  if (!container) return;

  const params = PRIM_PARAMS[_tipoPrim] || [];
  const temSup = PRIM_HAS_SURFACE[_tipoPrim] || false;

  let html = '';

  if (temSup) {
    html += `
      <div class="prim-sub-row">
        <label><input type="radio" name="prim-sub" value="volume" ${!_superficie ? 'checked' : ''}> Volume</label>
        <label><input type="radio" name="prim-sub" value="surface" ${_superficie ? 'checked' : ''}> Superfície</label>
      </div>`;
  }

  html += params
    .map(
      (p) => `
    <div class="prop-row prim-param-row">
      <label>${p.label}</label>
      <input type="number" id="${p.id}" class="prim-param-inp"
             min="${p.min}" max="${p.max}" step="${p.step}" value="${p.def}">
    </div>`
    )
    .join('');

  container.innerHTML = html;

  if (temSup) {
    container.querySelectorAll('input[name="prim-sub"]').forEach((r) => {
      r.addEventListener('change', () => {
        _superficie = r.value === 'surface';
      });
    });
  }
}

// Gera pontos para o tipo e parâmetros atuais
function _gerarPontos(n, tipo) {
  switch (tipo) {
    case 'cube':
      return generateCube(n, _getParamVal('cube_half', 1.0));
    case 'sphere':
      if (_superficie) {
        return generateSphereSurface(n, _getParamVal('sphere_radius', 1.0));
      }
      return generateSphere(n, _getParamVal('sphere_radius', 1.0));
    case 'cone':
      return generateCone(n, _getParamVal('cone_radius', 1.0), _getParamVal('cone_height', 2.0));
    case 'cylinder':
      if (_superficie) {
        return generateCylinderSurface(
          n,
          _getParamVal('cyl_radius', 1.0),
          _getParamVal('cyl_height', 2.0)
        );
      }
      return generateCylinder(n, _getParamVal('cyl_radius', 1.0), _getParamVal('cyl_height', 2.0));
  }
  return [];
}

// Retorna pontos gerados e dedupados (ou null se insuficiente)
function getPrimitivePoints() {
  const pts = dedupPoints(_gerarPontos(_nPrim, _tipoPrim));
  return pts.length >= 4 ? pts : null;
}

// Retorna o label da primitiva atual (para nomear o grupo)
function getPrimitiveName() {
  const labels = {
    cube: 'Cubo',
    sphere: _superficie ? 'Esfera (sup.)' : 'Esfera',
    cone: 'Cone',
    cylinder: _superficie ? 'Cilindro (sup.)' : 'Cilindro',
  };
  return labels[_tipoPrim] ?? _tipoPrim;
}

function initPrimitiveUI() {
  // Troca de primitiva
  document.querySelectorAll('input[name="prim-type"]').forEach((r) => {
    r.addEventListener('change', () => {
      _tipoPrim = r.value;
      _superficie = false;
      _renderParams();
    });
  });

  // Quantidade de pontos
  const nInput = document.getElementById('prim-n');
  if (nInput) {
    nInput.addEventListener('input', () => {
      _nPrim = Math.max(4, +nInput.value);
    });
    nInput.addEventListener('change', () => {
      _nPrim = Math.max(4, +nInput.value);
    });
  }

  _renderParams();
}
