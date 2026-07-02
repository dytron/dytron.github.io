// Roda a tetraedralização guardando os passos para visualização.
function tetDelaunaySteps(inputPts) {
  var pts = dedupPoints(inputPts);
  if (pts.length < 4) return null;
  pts = tetEnsureInterior(pts);

  var hull = jarvis3DJS(pts);
  if (!hull) return null;
  var hullState = j3dCreateState();
  j3dAddFace(hullState, j3dFirstFace(pts));
  j3dExpand(hullState, pts);
  var hullOut = j3dBuildOutput(hullState, pts);

  var tets = tetDelaunay(pts);
  if (!tets) return null;

  // Reconstrói os passos a partir dos tets finais
  var steps = [{ tets: [], activeFace: null }];
  var nTets = tets.tets.length / 4;
  for (var t = 0; t < nTets; t++) {
    var partial = [];
    for (var j = 0; j <= t; j++) {
      partial.push([tets.tets[j*4], tets.tets[j*4+1], tets.tets[j*4+2], tets.tets[j*4+3]]);
    }
    steps.push({ tets: partial, activeFace: null });
  }

  return {
    pts: pts,
    steps: steps,
    hullVerts: hullOut.verts,
    hullFaces: hullOut.faces,
    hullIndices: hullOut.hullIndices,
  };
}
