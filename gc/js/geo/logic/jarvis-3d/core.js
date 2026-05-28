// Estado usado enquanto o fecho está sendo montado.
function j3dCreateState() {
  const struct = createWingedStruct();
  return {
    struct,
    faces: struct.faces,
    queue: createQueue(),
  };
}

function j3dIsEdgeFree(state, u, v) {
  return state.struct.isEdgeFree(u, v);
}

// Adiciona uma face no fecho e coloca na fila as arestas que ainda faltam fechar.
function j3dAddFace(state, face) {
  const { verts, normal } = face;
  state.struct.insertFace(verts[0], verts[1], verts[2], normal);

  for (let i = 0; i < 3; i++) {
    const u = verts[i];
    const v = verts[(i + 1) % 3];
    if (j3dIsEdgeFree(state, u, v)) {
      state.queue.enqueue({ a: u, b: v, normal });
    }
  }
}

function j3dFindAdjacentPoint(a, b, refNormal, pts, exclude) {
  const ab = Vec3.sub(a, b);
  const eps = 1e-10;

  let bestScore = -Infinity;
  let bestArea = -Infinity;
  let bestDist = -Infinity;
  let best = -1;

  for (let i = 0; i < pts.length; i++) {
    if (exclude.has(i)) continue;

    const pb = Vec3.sub(pts[i], b);
    const cross = Vec3.cross(ab, pb);
    const area = Vec3.dot(cross, cross);
    if (area <= eps) continue;

    const normal = Vec3.normalize(cross);
    const score = Vec3.dot(refNormal, normal);
    const dist = Vec3.dot(Vec3.sub(pts[i], a), Vec3.sub(pts[i], a));
    const sameScore = Math.abs(score - bestScore) <= eps;
    const betterArea = area > bestArea + eps;
    const sameArea = Math.abs(area - bestArea) <= eps;

    if (
      score > bestScore + eps ||
      (sameScore && betterArea) ||
      (sameScore && sameArea && dist > bestDist + eps)
    ) {
      bestScore = score;
      bestArea = area;
      bestDist = dist;
      best = i;
    }
  }

  return best;
}

// Pega o ponto com menor y. Ele com certeza está no fecho.
function j3dFindExtremePoint(pts) {
  let min = 0;
  for (let i = 1; i < pts.length; i++) {
    if (pts[i].y < pts[min].y) {
      min = i;
      continue;
    }
    if (pts[i].y > pts[min].y) continue;

    if (pts[i].x < pts[min].x) {
      min = i;
      continue;
    }
    if (pts[i].x > pts[min].x) continue;

    if (pts[i].z < pts[min].z) min = i;
  }
  return min;
}

// Encontra a primeira face do fecho a partir do ponto extremo.
function j3dFirstFace(pts) {
  // Passo 1: p1 = ponto extremo (y mínimo), então ele com certeza está no fecho.
  const p1 = j3dFindExtremePoint(pts);
  const a = pts[p1];
  // Passo 2: cria uma direção horizontal arbitrária a partir de p1.
  const virt = { x: a.x + 1, y: a.y, z: a.z };
  // Passo 3: gira em volta dessa direção até achar o segundo ponto do fecho.
  const p2 = j3dFindAdjacentPoint(a, virt, { x: 0, y: -1, z: 0 }, pts, new Set([p1]));
  const b = pts[p2];
  const tempNormal = Vec3.faceNormal(b, virt, a);
  // Passo 4: gira em torno da aresta p1-p2 até achar p3.
  const p3 = j3dFindAdjacentPoint(a, b, tempNormal, pts, new Set([p1, p2]));
  return {
    verts: [p2, p1, p3],
    normal: Vec3.faceNormal(b, a, pts[p3]),
  };
}

// Loop principal: vai pegando arestas livres da fila até fechar o fecho.
function j3dExpand(state, pts, onFace) {
  while (!state.queue.isEmpty()) {
    const edge = state.queue.dequeue();
    if (!j3dIsEdgeFree(state, edge.a, edge.b)) continue;

    const face = j3dAdjacent(state, edge, pts);
    if (face === null) continue;

    j3dAddFace(state, face);
    if (onFace) onFace(edge);
  }
}
