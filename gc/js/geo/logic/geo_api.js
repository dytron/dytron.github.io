function isTetrahedralizeAvailable() {
  return true;
}

async function convexHull3D(pts) {
  return jarvis3DJS(pts);
}

async function tetrahedralize(pts) {
  var result = tetDelaunay(pts);
  if (!result) throw new Error('Pontos insuficientes para tetraedralizar.');
  return result;
}
