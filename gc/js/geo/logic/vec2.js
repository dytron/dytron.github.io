// Q3 - operações com vetores 2D, representados como {x, y}

const Vec2 = {
  // Soma de vetores
  add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
  },

  // Subtração de vetores
  sub(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
  },

  // Multiplicação por escalar
  scale(v, s) {
    return { x: v.x * s, y: v.y * s };
  },

  // Produto escalar
  dot(a, b) {
    return a.x * b.x + a.y * b.y;
  },

  // Comprimento do vetor
  norm(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  },

  // Normaliza o vetor para comprimento 1
  // Se o vetor for zero, retorna o vetor zero
  normalize(v) {
    const n = Vec2.norm(v);
    if (n === 0) return { x: 0, y: 0 };
    return Vec2.scale(v, 1 / n);
  },

  // Componente z do produto vetorial: positivo = b à esquerda de a
  cross(a, b) {
    return a.x * b.y - a.y * b.x;
  },

  // X do ponto sobre a-b na altura y (lerp)
  lerpX(a, b, y) {
    return a.x + (y - a.y) * (b.x - a.x) / (b.y - a.y);
  },

  // Retorna verdadeiro se e somente se a, b, c são colineares
  areCollinear(a, b, c) {
    const ab = Vec2.sub(b, a);
    const ac = Vec2.sub(c, a);
    return Math.abs(ab.x * ac.y - ab.y * ac.x) < 1e-10;
  },

};
