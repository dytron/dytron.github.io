function j3dPlaneKey(face, pts) {
  const anchor = pts[face.verts[0]];
  let nx = face.normal.x;
  let ny = face.normal.y;
  let nz = face.normal.z;
  let d = Vec3.dot(face.normal, anchor);

  if (
    nx < -1e-10 ||
    (Math.abs(nx) <= 1e-10 && ny < -1e-10) ||
    (Math.abs(nx) <= 1e-10 && Math.abs(ny) <= 1e-10 && nz < -1e-10)
  ) {
    nx = -nx;
    ny = -ny;
    nz = -nz;
    d = -d;
  }

  return `${nx.toFixed(8)}|${ny.toFixed(8)}|${nz.toFixed(8)}|${d.toFixed(8)}`;
}

function j3dPlaneBasis(normal) {
  const ref = Math.abs(normal.x) < 0.9 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };
  const u = Vec3.normalize(Vec3.cross(ref, normal));
  const v = Vec3.cross(normal, u);
  return { u, v };
}

function j3dCross2(a, b, c) {
  return Vec2.cross(Vec2.sub(b, a), Vec2.sub(c, a));
}

function j3dDist2(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

// Usa Graham Scan no plano da face para juntar vértices coplanares.
function j3dGrahamHull2D(points2D) {
  if (points2D.length <= 2) return points2D.map((point) => point.vertex);

  const eps = 1e-10;
  const sortedBase = mergeSort(points2D, (a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });
  const pivot = sortedBase[0];
  const others = sortedBase.slice(1);
  const sorted = mergeSort(others, (a, b) => {
    const cross = j3dCross2(pivot, a, b);
    if (Math.abs(cross) > eps) return cross > 0 ? -1 : 1;
    return j3dDist2(pivot, a) - j3dDist2(pivot, b);
  });

  const stack = [pivot];
  for (const point of sorted) {
    while (stack.length >= 2 && j3dCross2(stack[stack.length - 2], stack[stack.length - 1], point) <= eps) {
      stack.pop();
    }
    stack.push(point);
  }

  return stack.map((point) => point.vertex);
}

// Junta triângulos que caíram no mesmo plano.
function j3dMergeCoplanar(faces, pts) {
  const byPlane = new Map();
  for (const face of faces) {
    const key = j3dPlaneKey(face, pts);
    if (!byPlane.has(key)) byPlane.set(key, []);
    byPlane.get(key).push(face);
  }

  const merged = [];

  for (const planeFaces of byPlane.values()) {
    if (planeFaces.length <= 1) {
      merged.push(...planeFaces);
      continue;
    }

    const uniqueVerts = new Set();
    for (const face of planeFaces) {
      face.verts.forEach((vertex) => uniqueVerts.add(vertex));
    }

    const { u, v } = j3dPlaneBasis(planeFaces[0].normal);
    const points2D = [...uniqueVerts].map((vertex) => {
      const p = pts[vertex];
      return { vertex, x: Vec3.dot(p, u), y: Vec3.dot(p, v) };
    });

    const cycle = j3dGrahamHull2D(points2D);
    if (cycle.length < 3) {
      merged.push(...planeFaces);
      continue;
    }

    const cycleNormal = Vec3.faceNormal(pts[cycle[0]], pts[cycle[1]], pts[cycle[2]]);
    if (Vec3.dot(cycleNormal, planeFaces[0].normal) < 0) cycle.reverse();

    for (let i = 1; i < cycle.length - 1; i++) {
      merged.push({
        verts: [cycle[0], cycle[i], cycle[i + 1]],
        normal: planeFaces[0].normal,
      });
    }
  }

  return merged;
}
