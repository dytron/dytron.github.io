// Operações com vetores 3D, representados como {x, y, z}

const Vec3 = {
  // Soma de vetores
  add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
  },

  // Subtração de vetores
  sub(a, b) {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  },

  // Multiplicação por escalar
  scale(v, s) {
    return { x: v.x * s, y: v.y * s, z: v.z * s };
  },

  // Produto escalar
  dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  },

  // Comprimento ao quadrado
  norm2(v) {
    return v.x * v.x + v.y * v.y + v.z * v.z;
  },

  // Comprimento do vetor
  norm(v) {
    return Math.sqrt(Vec3.norm2(v));
  },

  // Normaliza o vetor para comprimento 1
  // Se o vetor for zero, retorna o vetor zero
  normalize(v) {
    const n = Vec3.norm(v);
    if (n < 1e-10) return { x: 0, y: 0, z: 0 };
    return Vec3.scale(v, 1 / n);
  },

  // Produto vetorial (a x b)
  cross(a, b) {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x,
    };
  },

  // Interpolação linear entre a e b pelo fator t in [0,1]
  lerp(a, b, t) {
    return {
      x: a.x + t * (b.x - a.x),
      y: a.y + t * (b.y - a.y),
      z: a.z + t * (b.z - a.z),
    };
  },

  // Normal unitária da face (v0, v1, v2) pela regra da mão direita
  faceNormal(v0, v1, v2) {
    const e1 = Vec3.sub(v1, v0);
    const e2 = Vec3.sub(v2, v0);
    const cp = Vec3.cross(e1, e2);
    return Vec3.normalize(cp);
  },

  // Retorna verdadeiro se e somente se a, b, c são colineares
  areCollinear(a, b, c) {
    const ab = Vec3.sub(b, a);
    const ac = Vec3.sub(c, a);
    const cp = Vec3.cross(ab, ac);
    return Vec3.norm(cp) < 1e-10;
  },
};
