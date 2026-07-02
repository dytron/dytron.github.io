function tetCentroid(pp) {
  var g = { x: 0, y: 0, z: 0 };
  for (var i = 0; i < pp.length; i++) g = Vec3.add(g, pp[i]);
  return Vec3.scale(g, 1 / pp.length);
}

function tetOrientNormal(n, from, toward) {
  return Vec3.dot(n, Vec3.sub(toward, from)) < 0 ? Vec3.scale(n, -1) : n;
}

function tetFaceCenter(pp, a, b, c) {
  var sum = Vec3.add(pp[a], pp[b]);
  sum = Vec3.add(sum, pp[c]);
  return Vec3.scale(sum, 1 / 3);
}

// Encontra uma face do fecho e coloca na fronteira com normal apontando pra dentro.
function tetInitFrontier(pp) {
  var firstFace = j3dFirstFace(pp);
  if (!firstFace) return null;

  var g = tetCentroid(pp);
  var v = firstFace.verts;
  var n = Vec3.faceNormal(pp[v[0]], pp[v[1]], pp[v[2]]);
  n = tetOrientNormal(n, tetFaceCenter(pp, v[0], v[1], v[2]), g);

  var state = { frontier: {}, queue: createQueue() };
  var key = tetFaceKey(v[0], v[1], v[2]);
  state.frontier[key] = { verts: [v[0], v[1], v[2]], normal: n };
  state.queue.enqueue(key);
  return state;
}

// Entre os pontos visíveis a uma face, escolhe o melhor pelo critério de Delaunay.
function tetPickBestPoint(face, pp, origPts, spherePts) {
  var verts = face.verts;
  var v0 = verts[0], v1 = verts[1], v2 = verts[2];
  var normal = face.normal;
  var eps = 1e-10;

  // 1. Coleta candidatos visíveis (no semi-espaço da normal).
  var candidates = [];
  for (var i = 0; i < pp.length; i++) {
    if (i === v0 || i === v1 || i === v2) continue;
    if (Vec3.dot(normal, Vec3.sub(pp[i], pp[v0])) < eps) continue;
    var angle = tetSolidAngle(pp[v0], pp[v1], pp[v2], pp[i]);
    if (angle < eps) continue;
    var vol = tetVolume(origPts[v0], origPts[v1], origPts[v2], origPts[i]);
    var nInside = tetCountInside(verts, i, spherePts);
    candidates.push({ index: i, angle: angle, nInside: nInside, vol: vol });
  }
  if (candidates.length === 0) return -1;

  // 2. Se algum tem circunsfera vazia, descarta os que têm pontos dentro.
  var empty = [];
  for (var j = 0; j < candidates.length; j++) {
    if (candidates[j].nInside === 0) empty.push(candidates[j]);
  }
  var pool = empty.length > 0 ? empty : candidates;

  // 3. Escolhe o de maior ângulo sólido. Desempate: maior volume.
  pool.sort(function(a, b) {
    if (Math.abs(a.angle - b.angle) > 1e-10) return b.angle - a.angle;
    return b.vol - a.vol;
  });
  return pool[0].index;
}

// Insere as 3 novas faces na fronteira ou cancela se já existem.
function tetUpdateFrontier(state, verts, bestP, pp) {
  var sum = Vec3.add(pp[verts[0]], pp[verts[1]]);
  sum = Vec3.add(sum, pp[verts[2]]);
  sum = Vec3.add(sum, pp[bestP]);
  var tc = Vec3.scale(sum, 0.25);
  var newFaces = [
    [verts[1], verts[0], bestP],
    [verts[2], verts[1], bestP],
    [verts[0], verts[2], bestP],
  ];

  for (var i = 0; i < newFaces.length; i++) {
    var nf = newFaces[i];
    var key = tetFaceKey(nf[0], nf[1], nf[2]);
    if (key in state.frontier) {
      delete state.frontier[key];
    } else {
      var n = Vec3.faceNormal(pp[nf[0]], pp[nf[1]], pp[nf[2]]);
      if (Vec3.dot(n, Vec3.sub(tc, pp[nf[0]])) > 0) n = Vec3.scale(n, -1);
      state.frontier[key] = { verts: nf, normal: n };
      state.queue.enqueue(key);
    }
  }
}

// Loop principal: vai pegando faces da fronteira até preencher todo o fecho.
function tetExpand(state, pp, origPts, spherePts, onTet) {
  var tets = [];
  var stale = 0;
  var i = 0;
  var maxI = pp.length * 30;

  while (!state.queue.isEmpty() && stale <= pp.length && i < maxI) {
    i++;
    var key = state.queue.dequeue();
    if (!(key in state.frontier)) continue;

    var face = state.frontier[key];
    delete state.frontier[key];

    var bestP = tetPickBestPoint(face, pp, origPts, spherePts);
    if (bestP === -1) {
      stale++;
      continue;
    }
    stale = 0;

    tets.push([face.verts[0], face.verts[1], face.verts[2], bestP]);
    tetUpdateFrontier(state, face.verts, bestP, pp);
    if (onTet) onTet(face.verts, tets);
  }

  var converged = Object.keys(state.frontier).length === 0;
  return { tets: tets, converged: converged };
}

// Cascata de estratégias em ordem de preferência:
// 1. Sem perturbação -melhor qualidade.
// 2. Perturbação parcial -perturba navegação, circunsfera usa coords originais.
// 3. Perturbação total -fallback robusto.
function tetDelaunayCore(pts, onTet) {
  var result = tetTryNoPert(pts, pts, onTet);
  if (result) return result;

  var dim = tetBBoxDim(pts);
  var epsilons = [];
  for (var e = -2; e >= -6; e -= 0.5) epsilons.push(dim * Math.pow(10, e));

  // Perturbação parcial: vários epsilons, 3 tentativas cada.
  var anyConverged = false;
  for (var i = 0; i < epsilons.length; i++) {
    for (var j = 0; j < 3; j++) {
      result = tetTryOnce(pts, epsilons[i], true, true, onTet);
      if (result) return result;
      if (tetTryOnce._converged) anyConverged = true;
    }
    if (i >= 1 && !anyConverged) break;
  }

  // Perturbação total: perturba tudo, aceita degenerados.
  for (var i = 0; i < epsilons.length; i++) {
    for (var j = 0; j < 3; j++) {
      result = tetTryOnce(pts, epsilons[i], false, false, onTet);
      if (result) return result;
    }
  }

  return [];
}
