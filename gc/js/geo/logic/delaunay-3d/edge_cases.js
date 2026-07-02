// Perturbação aleatória pra quebrar degenerescências cosféricas.
function tetPerturb(pts, eps) {
  return pts.map(function(p) {
    return {
      x: p.x + (Math.random() - 0.5) * 2 * eps,
      y: p.y + (Math.random() - 0.5) * 2 * eps,
      z: p.z + (Math.random() - 0.5) * 2 * eps,
    };
  });
}

// Equaliza raios pra transformar cones em cilindros.
function tetCylinderize(pts) {
  var cx = 0, cz = 0;
  for (var i = 0; i < pts.length; i++) { cx += pts[i].x; cz += pts[i].z; }
  cx /= pts.length; cz /= pts.length;
  var avgR = 0, count = 0;
  for (var i = 0; i < pts.length; i++) {
    var r = Math.sqrt((pts[i].x - cx) * (pts[i].x - cx) + (pts[i].z - cz) * (pts[i].z - cz));
    if (r > 1e-6) { avgR += r; count++; }
  }
  if (!count) return pts;
  avgR /= count;
  return pts.map(function(p) {
    var r = Math.sqrt((p.x - cx) * (p.x - cx) + (p.z - cz) * (p.z - cz));
    if (r < 1e-6) return p;
    var s = avgR / r;
    return { x: cx + (p.x - cx) * s, y: p.y, z: cz + (p.z - cz) * s };
  });
}

// Conta tetraedros degenerados (volume ~ 0 nas coords originais).
function tetCountDegen(tets, pts) {
  var d = 0;
  for (var i = 0; i < tets.length; i++) {
    var t = tets[i];
    if (tetVolume(pts[t[0]], pts[t[1]], pts[t[2]], pts[t[3]]) < 1e-14) d++;
  }
  return d;
}

// Verifica se o volume dos tets bate com o fecho.
function tetCheckVolume(tets, pts) {
  var volT = tetTotalVolume(tets, pts);
  var hull = jarvis3DJS(pts);
  var volH = 0;
  var nF = hull.faces.length / 3;
  for (var i = 0; i < nF; i++) {
    var ai = hull.faces[i * 3] * 3, bi = hull.faces[i * 3 + 1] * 3, ci = hull.faces[i * 3 + 2] * 3;
    var a = { x: hull.verts[ai], y: hull.verts[ai + 1], z: hull.verts[ai + 2] };
    var b = { x: hull.verts[bi], y: hull.verts[bi + 1], z: hull.verts[bi + 2] };
    var c = { x: hull.verts[ci], y: hull.verts[ci + 1], z: hull.verts[ci + 2] };
    volH += Vec3.dot(a, Vec3.cross(b, c)) / 6;
  }
  return Math.abs(volT / Math.abs(volH) - 1) < 0.01;
}

// Tenta uma perturbação e roda o Delaunay 3D.
function tetTryOnce(pts, eps, useOrigSphere, requireNoDegen, onTet) {
  var pp = tetPerturb(pts, eps);
  var init = tetInitFrontier(pp);
  if (!init) return null;
  var spherePts = useOrigSphere ? pts : pp;
  var result = tetExpand(init, pp, pts, spherePts, onTet);
  if (!result.converged || !tetCheckVolume(result.tets, pts)) {
    tetTryOnce._converged = false;
    return null;
  }
  tetTryOnce._converged = true;
  if (requireNoDegen && tetCountDegen(result.tets, pts) > 0) return null;
  return result.tets;
}

// Tenta sem perturbação (preserva faces do fecho).
function tetTryNoPert(pts, spherePts, onTet) {
  var init = tetInitFrontier(pts);
  if (!init) return null;
  var result = tetExpand(init, pts, pts, spherePts, onTet);
  if (result.converged && tetCheckVolume(result.tets, pts)) return result.tets;
  return null;
}
