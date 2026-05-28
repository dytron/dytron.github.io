// Função principal do Jarvis 3D.
function jarvis3DJS(pts) {
  const cleanPts = dedupPoints(pts);
  if (cleanPts.length < 4) return null;

  const state = j3dCreateState();
  j3dAddFace(state, j3dFirstFace(cleanPts));
  j3dExpand(state, cleanPts);

  return j3dBuildOutput(state, cleanPts);
}
