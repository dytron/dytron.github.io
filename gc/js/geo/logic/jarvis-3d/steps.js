// Roda o algoritmo guardando os passos para visualização.
function jarvis3DSteps(pts) {
  const cleanPts = dedupPoints(pts);
  if (cleanPts.length < 4) return null;

  const steps = [];
  const state = j3dCreateState();

  function snapshot(activeEdge) {
    steps.push({
      faces: state.faces.map((face) => ({
        verts: [...face.verts],
        normal: { ...face.normal },
      })),
      activeEdge: activeEdge ? { a: activeEdge.a, b: activeEdge.b } : null,
    });
  }

  j3dAddFace(state, j3dFirstFace(cleanPts));
  snapshot(null);
  j3dExpand(state, cleanPts, snapshot);

  return { pts: cleanPts, steps };
}
