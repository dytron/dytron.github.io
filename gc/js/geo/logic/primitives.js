// Cada função retorna um array de pontos { x, y, z }

// Pontos uniformes no interior do cubo [-half, half]^3.
function generateCube(n, half = 1) {
  const pts = [];
  for (let i = 0; i < n; i++)
    pts.push({
      x: Math.random() * 2 * half - half,
      y: Math.random() * 2 * half - half,
      z: Math.random() * 2 * half - half,
    });
  return pts;
}

// Pontos uniformes no interior da esfera por rejeição no cubo delimitador.
function generateSphere(n, radius = 1) {
  const pts = [];
  while (pts.length < n) {
    const x = Math.random() * 2 * radius - radius;
    const y = Math.random() * 2 * radius - radius;
    const z = Math.random() * 2 * radius - radius;
    if (x * x + y * y + z * z <= radius * radius) pts.push({ x, y, z });
  }
  return pts;
}

// Pontos na superfície da esfera: sorteia direção aleatória e normaliza.
function generateSphereSurface(n, radius = 1) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    let v;
    do {
      v = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() * 2 - 1 };
    } while (Vec3.norm(v) === 0);
    const dir = Vec3.normalize(v);
    const pt = Vec3.scale(dir, radius);
    pts.push(pt);
  }
  return pts;
}

// Pontos uniformes no interior do cone centrado na origem por rejeição no cubo delimitador.
function generateCone(n, radius = 1, height = 1) {
  const h = height / 2;
  const pts = [];
  while (pts.length < n) {
    const x = Math.random() * 2 * radius - radius;
    const y = Math.random() * height - h;
    const z = Math.random() * 2 * radius - radius;
    const rMax = radius * (1 - (y + h) / height);
    if (x * x + z * z <= rMax * rMax) pts.push({ x, y, z });
  }
  return pts;
}

// Pontos uniformes no interior do cilindro centrado na origem por rejeição no cubo delimitador.
function generateCylinder(n, radius = 1, height = 1) {
  const h = height / 2;
  const pts = [];
  while (pts.length < n) {
    const x = Math.random() * 2 * radius - radius;
    const y = Math.random() * height - h;
    const z = Math.random() * 2 * radius - radius;
    if (x * x + z * z <= radius * radius) pts.push({ x, y, z });
  }
  return pts;
}

// Pontos na superfície do cilindro distribuídos proporcionalmente à área (lateral + 2 tampas).
function generateCylinderSurface(n, radius = 1, height = 1) {
  const h = height / 2;
  const sideArea = 2 * Math.PI * radius * height;
  const capArea = Math.PI * radius * radius;
  const total = sideArea + 2 * capArea;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const s = Math.random() * total;
    if (s < sideArea) {
      // lateral
      const a = Math.random() * 2 * Math.PI;
      const y = Math.random() * height - h;
      pts.push({ x: radius * Math.cos(a), y, z: radius * Math.sin(a) });
    } else if (s < sideArea + capArea) {
      // tampa inferior
      const r = radius * Math.sqrt(Math.random());
      const a = Math.random() * 2 * Math.PI;
      pts.push({ x: r * Math.cos(a), y: -h, z: r * Math.sin(a) });
    } else {
      // tampa superior
      const r = radius * Math.sqrt(Math.random());
      const a = Math.random() * 2 * Math.PI;
      pts.push({ x: r * Math.cos(a), y: h, z: r * Math.sin(a) });
    }
  }
  return pts;
}
