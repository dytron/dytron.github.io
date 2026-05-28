function parseOBJ(text) {
  const lines = text.split(/\r?\n/);
  const verts = []; // acumula globalmente; indices OBJ começam em 1
  const groups = [];
  let current = null;
  let hasNamedGroups = false;

  function startGroup(name) {
    current = { name: name || 'default', seen: new Map() };
    groups.push(current);
  }

  function addVertToGroup(p) {
    if (!current) return;
    const key = p.x.toFixed(6) + ',' + p.y.toFixed(6) + ',' + p.z.toFixed(6);
    if (!current.seen.has(key)) current.seen.set(key, p);
  }

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    const parts = line.split(/\s+/);
    const cmd = parts[0];

    if (cmd === 'v') {
      const p = { x: parseFloat(parts[1]), y: parseFloat(parts[2]), z: parseFloat(parts[3]) };
      verts.push(p);
      // atribui o vértice ao grupo atual (formato: g ... v ... v ...)
      addVertToGroup(p);
    } else if (cmd === 'g') {
      hasNamedGroups = true;
      startGroup(parts.slice(1).join(' '));
    } else if (cmd === 'o' && !hasNamedGroups) {
      // Compatibilidade com OBJ antigo: se ainda não apareceu "g",
      // deixa o "o" abrir um grupo também.
      startGroup(parts.slice(1).join(' '));
    } else if (cmd === 'f' || cmd === 'p') {
      if (!current) startGroup('default');
      for (let i = 1; i < parts.length; i++) {
        const vi = parseInt(parts[i].split('/')[0], 10) - 1;
        if (vi >= 0 && vi < verts.length) addVertToGroup(verts[vi]);
      }
    }
  }

  const result = groups
    .filter((g) => g.seen.size > 0)
    .map((g) => ({ name: g.name, points: [...g.seen.values()] }));

  // OBJ só com v sem grupos nem faces -> grupo único
  if (result.length === 0 && verts.length > 0) {
    const seen = new Map();
    for (const p of verts) {
      const key = p.x.toFixed(6) + ',' + p.y.toFixed(6) + ',' + p.z.toFixed(6);
      if (!seen.has(key)) seen.set(key, p);
    }
    return [{ name: 'default', points: [...seen.values()] }];
  }

  return result;
}
