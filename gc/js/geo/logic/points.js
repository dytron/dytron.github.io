// Subtrai o centroide. Com normalize=true divide pelo maior raio (resultado em [-1,1]).
function centerPoints(pts, normalize) {
  if (!pts.length) return pts;
  let cx = 0,
    cy = 0,
    cz = 0;
  for (const p of pts) {
    cx += p.x;
    cy += p.y;
    cz += p.z;
  }
  cx /= pts.length;
  cy /= pts.length;
  cz /= pts.length;
  const centered = pts.map((p) => ({ x: p.x - cx, y: p.y - cy, z: p.z - cz }));
  if (!normalize) return centered;
  let maxDist = 0;
  for (const p of centered)
    maxDist = Math.max(maxDist, Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z));
  if (maxDist < 1e-10) return centered;
  return centered.map((p) => ({ x: p.x / maxDist, y: p.y / maxDist, z: p.z / maxDist }));
}

// Retorna false se p estiver fora de alguma face do fecho (normal aponta para fora).
function _insideHull(p, hullVerts, hullFaces) {
  const nF = hullFaces.length / 3;
  for (let i = 0; i < nF; i++) {
    const ai = hullFaces[i * 3] * 3,
      bi = hullFaces[i * 3 + 1] * 3,
      ci = hullFaces[i * 3 + 2] * 3;
    const ax = hullVerts[ai],
      ay = hullVerts[ai + 1],
      az = hullVerts[ai + 2];
    const ex = hullVerts[bi] - ax,
      ey = hullVerts[bi + 1] - ay,
      ez = hullVerts[bi + 2] - az;
    const fx = hullVerts[ci] - ax,
      fy = hullVerts[ci + 1] - ay,
      fz = hullVerts[ci + 2] - az;
    const nx = ey * fz - ez * fy,
      ny = ez * fx - ex * fz,
      nz = ex * fy - ey * fx;
    if ((p.x - ax) * nx + (p.y - ay) * ny + (p.z - az) * nz > 1e-10) return false;
  }
  return true;
}

// Sem fecho disponível: combinação convexa de k=4 pontos sorteados com pesos aleatórios normalizados.
function _sampleFallback(pts, n) {
  const k = Math.min(pts.length, 4);
  const result = [];
  for (let i = 0; i < n; i++) {
    const indexs = [];
    while (indexs.length < k) {
      const r = Math.floor(Math.random() * pts.length);
      if (!indexs.includes(r)) indexs.push(r);
    }
    const ws = indexs.map(() => -Math.log(Math.random() + 1e-12));
    const sum = ws.reduce((a, b) => a + b, 0);
    let x = 0,
      y = 0,
      z = 0;
    for (let j = 0; j < k; j++) {
      const w = ws[j] / sum;
      x += pts[indexs[j]].x * w;
      y += pts[indexs[j]].y * w;
      z += pts[indexs[j]].z * w;
    }
    result.push({ x, y, z });
  }
  return result;
}

// Gera n pontos no interior do fecho convexo por rejeição no bounding box.
// Se hullVerts/hullFaces não estiverem disponíveis, usa _sampleFallback.
function sampleConvex(pts, n, hullVerts, hullFaces) {
  if (!pts || pts.length < 2) return [];
  if (!hullVerts || !hullFaces || hullFaces.length === 0) return _sampleFallback(pts, n);

  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity;
  for (let i = 0; i < hullVerts.length; i += 3) {
    if (hullVerts[i] < minX) minX = hullVerts[i];
    if (hullVerts[i] > maxX) maxX = hullVerts[i];
    if (hullVerts[i + 1] < minY) minY = hullVerts[i + 1];
    if (hullVerts[i + 1] > maxY) maxY = hullVerts[i + 1];
    if (hullVerts[i + 2] < minZ) minZ = hullVerts[i + 2];
    if (hullVerts[i + 2] > maxZ) maxZ = hullVerts[i + 2];
  }
  const dx = maxX - minX,
    dy = maxY - minY,
    dz = maxZ - minZ;

  const result = [];
  let attempts = 0;
  while (result.length < n && attempts < n * 50) {
    attempts++;
    const p = {
      x: minX + Math.random() * dx,
      y: minY + Math.random() * dy,
      z: minZ + Math.random() * dz,
    };
    if (_insideHull(p, hullVerts, hullFaces)) result.push(p);
  }
  return result;
}

// Remove pontos duplicados (precisão de 10 casas decimais).
function dedupPoints(pts) {
  const seen = new Set();
  return pts.filter((p) => {
    const key = p.x.toFixed(10) + ',' + p.y.toFixed(10) + ',' + p.z.toFixed(10);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

