// Se todos os pontos estão no fecho, adiciona o centróide como ponto interior.
function tetEnsureInterior(pts) {
  var hullCheck = j3dCreateState();
  j3dAddFace(hullCheck, j3dFirstFace(pts));
  j3dExpand(hullCheck, pts);
  var onHull = {};
  for (var i = 0; i < hullCheck.faces.length; i++) {
    var v = hullCheck.faces[i].verts;
    onHull[v[0]] = true; onHull[v[1]] = true; onHull[v[2]] = true;
  }
  for (var i = 0; i < pts.length; i++) {
    if (!(i in onHull)) return pts;
  }
  var c = { x: 0, y: 0, z: 0 };
  for (var i = 0; i < pts.length; i++) c = Vec3.add(c, pts[i]);
  pts = pts.slice();
  pts.push(Vec3.scale(c, 1 / pts.length));
  return pts;
}

// Função principal do Delaunay 3D.
function tetDelaunay(inputPts) {
  var pts = dedupPoints(inputPts);
  if (pts.length < 4) return null;
  pts = tetEnsureInterior(pts);

  var tets = tetBestResult(pts);
  if (!tets) return null;

  tets = tets.filter(function(t) {
    return tetVolume(pts[t[0]], pts[t[1]], pts[t[2]], pts[t[3]]) > 1e-9;
  });

  return tetBuildFinalOutput(tets, pts);
}

// Escolhe o melhor resultado entre sem perturbação e com cylinderize.
function tetBestResult(pts) {
  var tets = tetDelaunayCore(pts);
  if (tets.length && tetCountDegen(tets, pts) === 0) return tets;

  var cylPts = tetCylinderize(pts);
  var tets2 = tetDelaunayCore(cylPts);

  if (tets.length && tets2.length) {
    var better = tetCountDegen(tets2, pts) < tetCountDegen(tets, pts)
                 && tetCheckVolume(tets2, pts);
    return better ? tets2 : tets;
  }

  if (tets2.length && tetCheckVolume(tets2, pts)) return tets2;
  if (tets.length) return tets;

  return null;
}

// Monta o output final com o fecho convexo anexado.
function tetBuildFinalOutput(tets, pts) {
  var hull = jarvis3DJS(pts);
  var out = tetBuildOutputFromList(tets, pts);
  out.hullVerts = hull ? hull.verts : null;
  out.hullFaces = hull ? hull.faces : null;
  out.hullIndices = hull ? hull.hullIndices : null;
  return out;
}
