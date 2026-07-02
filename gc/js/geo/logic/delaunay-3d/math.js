// Chave canônica de uma face (vértices ordenados).
function tetFaceKey(a, b, c) {
  if (a > b) { var t = a; a = b; b = t; }
  if (b > c) { var t = b; b = c; c = t; }
  if (a > b) { var t = a; a = b; b = t; }
  return a + ',' + b + ',' + c;
}

// Ângulo sólido visto do ponto p para o triângulo (a, b, c).
function tetSolidAngle(a, b, c, p) {
  var pa = Vec3.sub(a, p), pb = Vec3.sub(b, p), pc = Vec3.sub(c, p);
  var la = Vec3.norm(pa), lb = Vec3.norm(pb), lc = Vec3.norm(pc);
  if (la < 1e-12 || lb < 1e-12 || lc < 1e-12) return 0;
  var num = Math.abs(Vec3.dot(pa, Vec3.cross(pb, pc)));
  var den = la * lb * lc
    + Vec3.dot(pa, pb) * lc + Vec3.dot(pa, pc) * lb + Vec3.dot(pb, pc) * la;
  return 2 * Math.atan2(num, den);
}

// Circunesfera de um tetraedro. Retorna { cx, cy, cz, r2 }.
function tetCircumsphere(a, b, c, d) {
  var va = Vec3.sub(a, d), vb = Vec3.sub(b, d), vc = Vec3.sub(c, d);
  var aw = Vec3.dot(va, va), bw = Vec3.dot(vb, vb), cw = Vec3.dot(vc, vc);
  var det = Vec3.dot(va, Vec3.cross(vb, vc));
  if (Math.abs(det) < 1e-30) return { cx: 0, cy: 0, cz: 0, r2: Infinity };
  var inv = 0.5 / det;
  var u = Vec3.scale(
    Vec3.add(Vec3.add(
      Vec3.scale(Vec3.cross(vb, vc), aw),
      Vec3.scale(Vec3.cross(vc, va), bw)),
      Vec3.scale(Vec3.cross(va, vb), cw)),
    inv);
  return { cx: u.x + d.x, cy: u.y + d.y, cz: u.z + d.z, r2: Vec3.dot(u, u) };
}

// Volume de um tetraedro.
function tetVolume(a, b, c, d) {
  return Math.abs(Vec3.dot(Vec3.sub(b, a), Vec3.cross(Vec3.sub(c, a), Vec3.sub(d, a)))) / 6;
}

// Soma dos volumes de todos os tetraedros.
function tetTotalVolume(tets, pts) {
  var vol = 0;
  for (var i = 0; i < tets.length; i++) {
    var t = tets[i];
    vol += tetVolume(pts[t[0]], pts[t[1]], pts[t[2]], pts[t[3]]);
  }
  return vol;
}

// Conta pontos dentro da circunesfera do tetraedro (face + candidato).
function tetCountInside(verts, candidateIndex, pp) {
  var sph = tetCircumsphere(pp[verts[0]], pp[verts[1]], pp[verts[2]], pp[candidateIndex]);
  var centro = { x: sph.cx, y: sph.cy, z: sph.cz };
  var count = 0;
  for (var j = 0; j < pp.length; j++) {
    if (j === verts[0] || j === verts[1] || j === verts[2] || j === candidateIndex) continue;
    if (Vec3.norm2(Vec3.sub(pp[j], centro)) < sph.r2 * (1 - 1e-6)) count++;
  }
  return count;
}

// Dimensão do bounding box.
function tetBBoxDim(pts) {
  var mnx = Infinity, mxx = -Infinity, mny = Infinity, mxy = -Infinity;
  var mnz = Infinity, mxz = -Infinity;
  for (var i = 0; i < pts.length; i++) {
    if (pts[i].x < mnx) mnx = pts[i].x; if (pts[i].x > mxx) mxx = pts[i].x;
    if (pts[i].y < mny) mny = pts[i].y; if (pts[i].y > mxy) mxy = pts[i].y;
    if (pts[i].z < mnz) mnz = pts[i].z; if (pts[i].z > mxz) mxz = pts[i].z;
  }
  return Math.max(mxx - mnx, mxy - mny, mxz - mnz, 1e-6);
}
