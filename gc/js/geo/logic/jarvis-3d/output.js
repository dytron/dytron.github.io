// Junta o resultado final no formato usado pelo projeto.
function j3dBuildOutput(state, pts) {
  const mergedFaces = j3dMergeCoplanar(state.faces, pts);
  const seen = new Set();
  for (const face of mergedFaces) {
    face.verts.forEach((vertex) => seen.add(vertex));
  }

  const indexMap = new Map();
  let next = 0;
  for (const vertex of seen) {
    indexMap.set(vertex, next);
    next++;
  }

  const verts = new Float64Array(indexMap.size * 3);
  for (const [orig, local] of indexMap) {
    const p = pts[orig];
    verts[local * 3] = p.x;
    verts[local * 3 + 1] = p.y;
    verts[local * 3 + 2] = p.z;
  }

  const faces = new Int32Array(mergedFaces.length * 3);
  for (let i = 0; i < mergedFaces.length; i++) {
    const [a, b, c] = mergedFaces[i].verts;
    faces[i * 3] = indexMap.get(a);
    faces[i * 3 + 1] = indexMap.get(b);
    faces[i * 3 + 2] = indexMap.get(c);
  }

  return {
    verts,
    faces,
    hullIndices: new Int32Array([...seen]),
  };
}
