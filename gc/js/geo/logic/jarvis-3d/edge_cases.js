// Vê se uma aresta já apareceu nesta orientação ou na contrária.
function j3dEdgeUse(state, u, v) {
  return state.struct.countEdgeUse(u, v);
}

function j3dCanInsert(state, v0, v1, v2) {
  const e01 = j3dEdgeUse(state, v0, v1);
  const e12 = j3dEdgeUse(state, v1, v2);
  const e20 = j3dEdgeUse(state, v2, v0);
  return (
    e01.same === 0 &&
    e12.same === 0 &&
    e20.same === 0 &&
    e01.reverse <= 1 &&
    e12.reverse <= 1 &&
    e20.reverse <= 1
  );
}

function j3dProjectToEdgePlane(v, edgeDir) {
  return Vec3.sub(v, Vec3.scale(edgeDir, Vec3.dot(v, edgeDir)));
}

function j3dAngleAroundEdge(refNormal, candNormal, edgeDir) {
  const refProj = Vec3.normalize(j3dProjectToEdgePlane(refNormal, edgeDir));
  const candProj = Vec3.normalize(j3dProjectToEdgePlane(candNormal, edgeDir));
  const y = Vec3.dot(edgeDir, Vec3.cross(candProj, refProj));
  const x = Vec3.dot(refProj, candProj);
  let angle = Math.atan2(y, x);
  if (angle <= 1e-10) angle += Math.PI * 2;
  return angle;
}

// Confere se a face candidata fica do lado de fora de todos os pontos.
function j3dIsSupportingFace(i0, i1, i2, pts) {
  const eps = 1e-10;
  const normal = Vec3.faceNormal(pts[i0], pts[i1], pts[i2]);

  for (let i = 0; i < pts.length; i++) {
    if (i === i0 || i === i1 || i === i2) continue;
    const dist = Vec3.dot(normal, Vec3.sub(pts[i], pts[i0]));
    if (dist > eps) return false;
  }

  return true;
}

// Tenta montar a face vizinha de uma aresta livre.
function j3dAdjacent(state, edge, pts) {
  const a = pts[edge.a];
  const b = pts[edge.b];
  const ab = Vec3.sub(a, b);
  const edgeDir = Vec3.normalize(ab);
  const eps = 1e-10;

  let bestAngle = Infinity;
  let bestArea = -Infinity;
  let bestDist = -Infinity;
  let best = -1;

  for (let i = 0; i < pts.length; i++) {
    if (i === edge.a || i === edge.b) continue;
    if (!j3dCanInsert(state, edge.b, edge.a, i)) continue;
    if (!j3dIsSupportingFace(edge.b, edge.a, i, pts)) continue;

    const pb = Vec3.sub(pts[i], b);
    const cross = Vec3.cross(ab, pb);
    const area = Vec3.dot(cross, cross);
    if (area <= eps) continue;

    const normal = Vec3.faceNormal(pts[edge.b], pts[edge.a], pts[i]);
    const angle = j3dAngleAroundEdge(edge.normal, normal, edgeDir);
    const dist = Vec3.dot(Vec3.sub(pts[i], a), Vec3.sub(pts[i], a));
    const sameAngle = Math.abs(angle - bestAngle) <= eps;
    const betterArea = area > bestArea + eps;
    const sameArea = Math.abs(area - bestArea) <= eps;

    if (
      angle < bestAngle - eps ||
      (sameAngle && betterArea) ||
      (sameAngle && sameArea && dist > bestDist + eps)
    ) {
      bestAngle = angle;
      bestArea = area;
      bestDist = dist;
      best = i;
    }
  }

  if (best === -1) return null;
  return {
    verts: [edge.b, edge.a, best],
    normal: Vec3.faceNormal(pts[edge.b], pts[edge.a], pts[best]),
  };
}
