// Monta o resultado a partir de uma lista de tetraedros [[v0,v1,v2,v3], ...].
function tetBuildOutputFromList(tetList, pts) {
  var filtered = [];
  for (var ti = 0; ti < tetList.length; ti++) {
    var t = tetList[ti];
    var ab = Vec3.sub(pts[t[1]], pts[t[0]]);
    var ac = Vec3.sub(pts[t[2]], pts[t[0]]);
    var ad = Vec3.sub(pts[t[3]], pts[t[0]]);
    if (Math.abs(Vec3.dot(ab, Vec3.cross(ac, ad))) > 1e-14) filtered.push(t);
  }
  tetList = filtered;

  var usados = {};
  for (var ti = 0; ti < tetList.length; ti++) {
    var tet = tetList[ti];
    for (var vi = 0; vi < 4; vi++) usados[tet[vi]] = true;
  }

  var indexMap = {};
  var next = 0;
  for (var orig in usados) {
    indexMap[orig] = next;
    next++;
  }

  var verts = new Float64Array(next * 3);
  for (var orig in indexMap) {
    var local = indexMap[orig];
    var p = pts[+orig];
    verts[local * 3] = p.x;
    verts[local * 3 + 1] = p.y;
    verts[local * 3 + 2] = p.z;
  }

  var tets = new Int32Array(tetList.length * 4);
  for (var ti = 0; ti < tetList.length; ti++) {
    var tet = tetList[ti];
    tets[ti * 4] = indexMap[tet[0]];
    tets[ti * 4 + 1] = indexMap[tet[1]];
    tets[ti * 4 + 2] = indexMap[tet[2]];
    tets[ti * 4 + 3] = indexMap[tet[3]];
  }

  return { verts: verts, tets: tets };
}
