function isTetrahedralizeAvailable() {
  return false;
}

async function convexHull3D(pts) {
  return jarvis3DJS(pts);
}

async function tetrahedralize() {
  throw new Error('Tetraedralização não disponível neste trabalho.');
}
