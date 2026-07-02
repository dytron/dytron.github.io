const GROUP_COLORS = [
  0xe63946, 0x2a9d8f, 0xe9c46a, 0x457b9d, 0xf4a261, 0x6a4c93, 0x52b788, 0xd62828, 0x4cc9f0,
  0xfb8500, 0x80b918, 0x9b2226, 0x0077b6, 0xc77dff, 0x06d6a0,
];

let _vRenderer, _vScene, _vCamera, _vControls, _vRoot;
let _vGroups = [];

const layerVis = {
  showPoints: true,
  showHull: true,
  showHullEdges: true,
  showTets: false,
  showNumbers: false,
};

let _pointSize = 0.04;
let _hullOpacity = 0.45;
let _tetOpacity = 1;
let _tetExplode = 0.04;
let _numSize = 18;
let _selectedTet = -1;
let _selectedTetGroup = -1;

function initViewerScene(canvasEl) {
  _vRenderer = new THREE.WebGLRenderer({
    canvas: canvasEl,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  _vRenderer.setPixelRatio(devicePixelRatio);
  _vRenderer.setClearColor(0x111111);

  _vScene = new THREE.Scene();
  _vCamera = new THREE.PerspectiveCamera(45, 1, 0.001, 200);
  _vCamera.position.set(3, 2, 3);
  _vCamera.lookAt(0, 0, 0);

  _vControls = new THREE.OrbitControls(_vCamera, canvasEl);
  _vControls.enableDamping = true;

  _vScene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const luz1 = new THREE.DirectionalLight(0xffffff, 0.8);
  luz1.position.set(4, 6, 4);
  _vScene.add(luz1);
  const luz2 = new THREE.DirectionalLight(0x8899ff, 0.25);
  luz2.position.set(-3, 2, -3);
  _vScene.add(luz2);

  _grid = new THREE.GridHelper(6, 24, 0x222222, 0x222222);
  _vScene.add(_grid);

  _axes = buildAxesGroup(1.5);
  _axes.visible = false;
  _vScene.add(_axes);

  function resize() {
    const w = canvasEl.parentElement.clientWidth;
    const h = canvasEl.parentElement.clientHeight;
    _vRenderer.setSize(w, h, false);
    _vCamera.aspect = w / h;
    _vCamera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  (function loop() {
    requestAnimationFrame(loop);
    _vControls.update();
    _vRenderer.render(_vScene, _vCamera);
  })();
}

// Constrói geometria de mesh para o fecho convexo
function _makeHullMesh(verts, faces) {
  const nTris = faces.length / 3;
  const pos = new Float32Array(nTris * 9);
  const nrm = new Float32Array(nTris * 9);
  for (let t = 0; t < nTris; t++) {
    const ai = faces[t * 3] * 3,
      bi = faces[t * 3 + 1] * 3,
      ci = faces[t * 3 + 2] * 3;
    const ax = verts[ai],
      ay = verts[ai + 1],
      az = verts[ai + 2];
    const bx = verts[bi],
      by = verts[bi + 1],
      bz = verts[bi + 2];
    const cx = verts[ci],
      cy = verts[ci + 1],
      cz = verts[ci + 2];
    const ux = bx - ax,
      uy = by - ay,
      uz = bz - az;
    const vx = cx - ax,
      vy = cy - ay,
      vz = cz - az;
    const nx = uy * vz - uz * vy,
      ny = uz * vx - ux * vz,
      nz = ux * vy - uy * vx;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    const base = t * 9;
    pos[base] = ax;
    pos[base + 1] = ay;
    pos[base + 2] = az;
    pos[base + 3] = bx;
    pos[base + 4] = by;
    pos[base + 5] = bz;
    pos[base + 6] = cx;
    pos[base + 7] = cy;
    pos[base + 8] = cz;
    for (let k = 0; k < 3; k++) {
      nrm[base + k * 3] = nx / len;
      nrm[base + k * 3 + 1] = ny / len;
      nrm[base + k * 3 + 2] = nz / len;
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  return geo;
}

// Extrai arestas únicas do fecho a partir das faces (evita duplicatas)
function _makeHullEdges(verts, faces) {
  const vistos = new Set();
  const positions = [];
  const nTris = faces.length / 3;
  for (let t = 0; t < nTris; t++) {
    const a = faces[t * 3],
      b = faces[t * 3 + 1],
      c = faces[t * 3 + 2];
    for (const [i, j] of [
      [a, b],
      [b, c],
      [a, c],
    ]) {
      const chave = i < j ? `${i}_${j}` : `${j}_${i}`;
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      positions.push(
        verts[i * 3],
        verts[i * 3 + 1],
        verts[i * 3 + 2],
        verts[j * 3],
        verts[j * 3 + 1],
        verts[j * 3 + 2]
      );
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  return geo;
}

// Wireframe de um único tetraedro (para destacar o selecionado)
function _makeSingleTetWire(verts, i0, i1, i2, i3) {
  const pares = [
    [i0, i1],
    [i0, i2],
    [i0, i3],
    [i1, i2],
    [i1, i3],
    [i2, i3],
  ];
  const pos = [];
  for (const [a, b] of pares) {
    pos.push(
      verts[a * 3],
      verts[a * 3 + 1],
      verts[a * 3 + 2],
      verts[b * 3],
      verts[b * 3 + 1],
      verts[b * 3 + 2]
    );
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  return geo;
}

// Wireframe de todos os tetraedros, pulando o índice skipIndex
function _makeTetWire(verts, tets, skipIndex) {
  const pares = [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 2],
    [1, 3],
    [2, 3],
  ];
  const vistos = new Set();
  const positions = [];
  const nTets = tets.length / 4;
  for (let t = 0; t < nTets; t++) {
    if (t === skipIndex) continue;
    const base = t * 4;
    for (const [a, b] of pares) {
      const ia = tets[base + a],
        ib = tets[base + b];
      const chave = ia < ib ? ia + '_' + ib : ib + '_' + ia;
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      positions.push(
        verts[ia * 3],
        verts[ia * 3 + 1],
        verts[ia * 3 + 2],
        verts[ib * 3],
        verts[ib * 3 + 1],
        verts[ib * 3 + 2]
      );
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  return geo;
}

// Centroide de um tetraedro.
function _tetCentroid(verts, i0, i1, i2, i3) {
  return [
    (verts[i0 * 3] + verts[i1 * 3] + verts[i2 * 3] + verts[i3 * 3]) * 0.25,
    (verts[i0 * 3 + 1] + verts[i1 * 3 + 1] + verts[i2 * 3 + 1] + verts[i3 * 3 + 1]) * 0.25,
    (verts[i0 * 3 + 2] + verts[i1 * 3 + 2] + verts[i2 * 3 + 2] + verts[i3 * 3 + 2]) * 0.25,
  ];
}

// Aplica escala em torno do centroide do tet: v' = c + (v - c) * s
function _explodeVert(vx, vy, vz, cx, cy, cz, s) {
  return [cx + (vx - cx) * s, cy + (vy - cy) * s, cz + (vz - cz) * s];
}

// Monta a lista de faces a renderizar. Com explosão 0 só mostra contorno (boundary).
function _collectTetFacesToDraw(tets, explode) {
  var faceSlots = [[0,1,2,3],[0,3,1,2],[0,2,3,1],[1,3,2,0]];
  var nTets = tets.length / 4;
  var allFaces = [];

  // Conta quantas vezes cada face (por vértices ordenados) aparece
  var count = {};
  for (var t = 0; t < nTets; t++) {
    var base = t * 4;
    var iv = [tets[base], tets[base+1], tets[base+2], tets[base+3]];
    for (var fi = 0; fi < 4; fi++) {
      var fa = faceSlots[fi];
      var sorted = [iv[fa[0]], iv[fa[1]], iv[fa[2]]];
      if (sorted[0] > sorted[1]) { var tmp = sorted[0]; sorted[0] = sorted[1]; sorted[1] = tmp; }
      if (sorted[1] > sorted[2]) { var tmp = sorted[1]; sorted[1] = sorted[2]; sorted[2] = tmp; }
      if (sorted[0] > sorted[1]) { var tmp = sorted[0]; sorted[0] = sorted[1]; sorted[1] = tmp; }
      var key = sorted[0] + ',' + sorted[1] + ',' + sorted[2];
      count[key] = (count[key] || 0) + 1;
      allFaces.push({ tet: t, face: fa, key: key });
    }
  }

  // Com explosão > 0 mostra todas, senão só as de contorno (count == 1)
  var showAll = explode > 0.01;
  var result = [];
  for (var i = 0; i < allFaces.length; i++) {
    if (showAll || count[allFaces[i].key] === 1) {
      result.push(allFaces[i]);
    }
  }
  return result;
}

// Faces sólidas dos tetraedros com explosão e normais orientadas pra fora.
function _makeTetFaces(verts, tets, explode) {
  var scale = 1 - explode * 0.8;
  var nTets = tets.length / 4;
  var faces = _collectTetFacesToDraw(tets, explode);
  var pos = new Float32Array(faces.length * 9);
  var nrm = new Float32Array(faces.length * 9);
  var off = 0;

  for (var i = 0; i < faces.length; i++) {
    var f = faces[i];
    var base = f.tet * 4;
    var iv = [tets[base], tets[base+1], tets[base+2], tets[base+3]];
    var c = _tetCentroid(verts, iv[0], iv[1], iv[2], iv[3]);
    var fa = f.face;
    var tri = [];
    for (var vi = 0; vi < 3; vi++) {
      var vertI = iv[fa[vi]];
      tri.push(_explodeVert(verts[vertI*3], verts[vertI*3+1], verts[vertI*3+2], c[0], c[1], c[2], scale));
    }
    var ux = tri[1][0]-tri[0][0], uy = tri[1][1]-tri[0][1], uz = tri[1][2]-tri[0][2];
    var wx = tri[2][0]-tri[0][0], wy = tri[2][1]-tri[0][1], wz = tri[2][2]-tri[0][2];
    var nx = uy*wz-uz*wy, ny = uz*wx-ux*wz, nz = ux*wy-uy*wx;

    var opI = iv[fa[3]];
    var ox = verts[opI*3] - tri[0][0], oy = verts[opI*3+1] - tri[0][1], oz = verts[opI*3+2] - tri[0][2];
    if (nx*ox + ny*oy + nz*oz > 0) {
      nx = -nx; ny = -ny; nz = -nz;
      var tmp = tri[1]; tri[1] = tri[2]; tri[2] = tmp;
    }

    var len = Math.sqrt(nx*nx+ny*ny+nz*nz) || 1;
    for (var vi = 0; vi < 3; vi++) {
      pos[off] = tri[vi][0]; pos[off+1] = tri[vi][1]; pos[off+2] = tri[vi][2];
      nrm[off] = nx/len; nrm[off+1] = ny/len; nrm[off+2] = nz/len;
      off += 3;
    }
  }

  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  return geo;
}

// Wireframe de todos os tetraedros com explosão, pulando skipIndex.
function _makeTetWireExplode(verts, tets, skipIndex, explode) {
  var scale = 1 - explode * 0.8;
  var pares = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
  var positions = [];
  var nTets = tets.length / 4;
  for (var t = 0; t < nTets; t++) {
    if (t === skipIndex) continue;
    var base = t * 4;
    var iv = [tets[base], tets[base+1], tets[base+2], tets[base+3]];
    var c = _tetCentroid(verts, iv[0], iv[1], iv[2], iv[3]);
    for (var pi = 0; pi < pares.length; pi++) {
      var ia = iv[pares[pi][0]], ib = iv[pares[pi][1]];
      var a = _explodeVert(verts[ia*3], verts[ia*3+1], verts[ia*3+2], c[0], c[1], c[2], scale);
      var b = _explodeVert(verts[ib*3], verts[ib*3+1], verts[ib*3+2], c[0], c[1], c[2], scale);
      positions.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    }
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  return geo;
}

// Wireframe de um tet com explosão.
function _makeSingleTetWireExplode(verts, i0, i1, i2, i3, explode) {
  var scale = 1 - explode * 0.8;
  var c = _tetCentroid(verts, i0, i1, i2, i3);
  var pares = [[i0,i1],[i0,i2],[i0,i3],[i1,i2],[i1,i3],[i2,i3]];
  var pos = [];
  for (var pi = 0; pi < pares.length; pi++) {
    var a = pares[pi][0], b = pares[pi][1];
    var va = _explodeVert(verts[a*3], verts[a*3+1], verts[a*3+2], c[0], c[1], c[2], scale);
    var vb = _explodeVert(verts[b*3], verts[b*3+1], verts[b*3+2], c[0], c[1], c[2], scale);
    pos.push(va[0], va[1], va[2], vb[0], vb[1], vb[2]);
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  return geo;
}

function _makePointCloud(pts) {
  const buf = new Float32Array(pts.length * 3);
  pts.forEach((p, i) => {
    buf[i * 3] = p.x;
    buf[i * 3 + 1] = p.y;
    buf[i * 3 + 2] = p.z;
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(buf, 3));
  return geo;
}

// Cria um sprite com o número do ponto na posição indicada
function _makeLabel(texto, pos) {
  const fs = _numSize;
  const w = Math.max(64, texto.length * fs);
  const h = fs * 2;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${fs}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(texto, w / 2, h / 2);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.position.set(pos[0], pos[1], pos[2]);
  const escala = fs * 0.004;
  sprite.scale.set(escala * (w / h), escala, 1);
  return sprite;
}

// Reconstroi todos os objetos Three.js a partir dos grupos atuais
function _rebuildViewerScene() {
  if (_vRoot) {
    _vRoot.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (o.material.map) o.material.map.dispose();
        o.material.dispose();
      }
    });
    _vScene.remove(_vRoot);
  }
  _vRoot = new THREE.Group();

  // Mapa de posição -> coordenadas para numeração global única
  const pontoGlobal = new Map();

  _vGroups.forEach((g, i) => {
    if (g.hidden) return;
    const cor = g.color !== undefined ? g.color : GROUP_COLORS[i % GROUP_COLORS.length];

    if (layerVis.showPoints && g.inputPoints && g.inputPoints.length) {
      if (g.hullIndices && g.hullIndices.length) {
        // Separa pontos do fecho dos pontos internos
        const noFecho = new Set(g.hullIndices);
        const emCima = [];
        const internos = [];
        g.inputPoints.forEach((p, index) => {
          (noFecho.has(index) ? emCima : internos).push(p);
        });

        if (internos.length) {
          const geo = _makePointCloud(internos);
          _vRoot.add(
            new THREE.Points(
              geo,
              new THREE.PointsMaterial({
                color: 0xffdd00,
                size: _pointSize * 0.6,
                sizeAttenuation: true,
              })
            )
          );
        }
        if (emCima.length) {
          const geo = _makePointCloud(emCima);
          _vRoot.add(
            new THREE.Points(
              geo,
              new THREE.PointsMaterial({
                color: cor,
                size: _pointSize * 1.6,
                sizeAttenuation: true,
              })
            )
          );
        }
      } else {
        const geo = _makePointCloud(g.inputPoints);
        _vRoot.add(
          new THREE.Points(
            geo,
            new THREE.PointsMaterial({
              color: cor,
              size: _pointSize,
              sizeAttenuation: true,
            })
          )
        );
      }

      if (layerVis.showNumbers) {
        g.inputPoints.forEach((p) => {
          const chave = p.x.toFixed(5) + ',' + p.y.toFixed(5) + ',' + p.z.toFixed(5);
          if (!pontoGlobal.has(chave)) pontoGlobal.set(chave, [p.x, p.y, p.z]);
        });
      }
    }

    if (g.hullVerts && g.hullFaces && g.hullFaces.length && _meshVisible) {
      const hullGeo = _makeHullMesh(g.hullVerts, g.hullFaces);

      if (layerVis.showHull) {
        const transparente = _hullOpacity < 1;
        _vRoot.add(
          new THREE.Mesh(
            hullGeo,
            new THREE.MeshLambertMaterial({
              color: cor,
              side: THREE.FrontSide,
              transparent: transparente,
              opacity: _hullOpacity,
            })
          )
        );
      }

      if (layerVis.showHullEdges) {
        _vRoot.add(
          new THREE.LineSegments(
            _makeHullEdges(g.hullVerts, g.hullFaces),
            new THREE.LineBasicMaterial({ color: cor })
          )
        );
      }

      if (layerVis.showNumbers) {
        const nv = g.hullVerts.length / 3;
        for (let vi = 0; vi < nv; vi++) {
          const chave =
            g.hullVerts[vi * 3].toFixed(5) +
            ',' +
            g.hullVerts[vi * 3 + 1].toFixed(5) +
            ',' +
            g.hullVerts[vi * 3 + 2].toFixed(5);
          if (!pontoGlobal.has(chave))
            pontoGlobal.set(chave, [
              g.hullVerts[vi * 3],
              g.hullVerts[vi * 3 + 1],
              g.hullVerts[vi * 3 + 2],
            ]);
        }
      }
    }

    if (g.tetVerts && g.tets && g.tets.length && _meshVisible) {
      const nTets = g.tets.length / 4;

      if (layerVis.showTets) {
        const selLocal =
          _selectedTetGroup === i && _selectedTet >= 0 && _selectedTet < nTets ? _selectedTet : -1;

        // Faces sólidas: sem explosão usa o fecho (se disponível), com explosão usa as faces dos tets
        if (_tetOpacity > 0) {
          const tetTransp = _tetOpacity < 0.99;
          var tetFaceGeo = _makeTetFaces(g.tetVerts, g.tets, _tetExplode);
          _vRoot.add(
            new THREE.Mesh(
              tetFaceGeo,
              new THREE.MeshLambertMaterial({
                color: cor,
                side: tetTransp ? THREE.DoubleSide : THREE.FrontSide,
                transparent: tetTransp,
                opacity: _tetOpacity,
                depthWrite: !tetTransp,
              })
            )
          );
        }

        // Wireframe
        _vRoot.add(
          new THREE.LineSegments(
            _makeTetWireExplode(g.tetVerts, g.tets, selLocal, _tetExplode),
            new THREE.LineBasicMaterial({ color: cor, opacity: 0.5, transparent: true })
          )
        );

        if (selLocal >= 0) {
          const base = selLocal * 4;
          const [i0, i1, i2, i3] = [
            g.tets[base],
            g.tets[base + 1],
            g.tets[base + 2],
            g.tets[base + 3],
          ];
          _vRoot.add(
            new THREE.LineSegments(
              _makeSingleTetWireExplode(g.tetVerts, i0, i1, i2, i3, _tetExplode),
              new THREE.LineBasicMaterial({ color: 0xffff00 })
            )
          );
        }
      }

      if (layerVis.showNumbers) {
        const nv = g.tetVerts.length / 3;
        for (let vi = 0; vi < nv; vi++) {
          const chave =
            g.tetVerts[vi * 3].toFixed(5) +
            ',' +
            g.tetVerts[vi * 3 + 1].toFixed(5) +
            ',' +
            g.tetVerts[vi * 3 + 2].toFixed(5);
          if (!pontoGlobal.has(chave))
            pontoGlobal.set(chave, [
              g.tetVerts[vi * 3],
              g.tetVerts[vi * 3 + 1],
              g.tetVerts[vi * 3 + 2],
            ]);
        }
      }
    }
  });

  if (layerVis.showNumbers) {
    [...pontoGlobal.values()].forEach((p, index) => _vRoot.add(_makeLabel(String(index), p)));
  }

  if (_activeEdgePoints) {
    const [pa, pb] = _activeEdgePoints;
    const pos = new Float32Array([pa.x, pa.y, pa.z, pb.x, pb.y, pb.z]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    _vRoot.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xffff00 })));
  }

  _vScene.add(_vRoot);
}

let _meshVisible = true;
let _grid = null;
let _axes = null;
let _activeEdgePoints = null; // null ou [ptA, ptB] para destacar aresta ativa no modo passo a passo

function setActiveEdge(pa, pb) {
  _activeEdgePoints = pa && pb ? [pa, pb] : null;
}

function setMeshVisible(val) {
  _meshVisible = val;
  _rebuildViewerScene();
}

function setGridVisible(val) {
  if (_grid) _grid.visible = val;
}

function setAxesVisible(val) {
  if (_axes) _axes.visible = val;
}

function setGroups(groups) {
  _vGroups = groups;
  _selectedTet = -1;
  _selectedTetGroup = -1;
  _rebuildViewerScene();
}

function setLayerVis(key, val) {
  layerVis[key] = val;
  _rebuildViewerScene();
}

function setPointSize(v) {
  _pointSize = v;
  _rebuildViewerScene();
}
function setOpacity(v) {
  _hullOpacity = v;
  _rebuildViewerScene();
}
function setNumSize(v) {
  _numSize = v;
  _rebuildViewerScene();
}
function setTetOpacity(v) {
  _tetOpacity = v;
  _rebuildViewerScene();
}
function setTetExplode(v) {
  _tetExplode = v;
  _rebuildViewerScene();
}

function selectTet(groupIndex, tetIndex) {
  _selectedTetGroup = groupIndex;
  _selectedTet = tetIndex;
  _rebuildViewerScene();
}

