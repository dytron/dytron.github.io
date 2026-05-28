// Constroi um grupo Three.js com os 3 eixos coloridos + labels X Y Z.
// Usa depthTest: false para sempre sobrepor a grid.
function buildAxesGroup(size) {
  size = size || 2;
  const group = new THREE.Group();

  const axes = [
    { dir: [1, 0, 0], color: 0xe63946, label: 'X' },
    { dir: [0, 1, 0], color: 0x52b788, label: 'Y' },
    { dir: [0, 0, 1], color: 0x4cc9f0, label: 'Z' },
  ];

  for (const { dir, color, label } of axes) {
    const buf = new Float32Array([0, 0, 0, dir[0] * size, dir[1] * size, dir[2] * size]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(buf, 3));
    const mat = new THREE.LineBasicMaterial({ color, depthTest: false, depthWrite: false });
    const line = new THREE.Line(geo, mat);
    line.renderOrder = 999;
    group.add(line);

    // label no extremo
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.font = 'bold 44px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 32, 32);
    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: tex,
        depthTest: false,
        depthWrite: false,
      })
    );
    sprite.renderOrder = 999;
    sprite.position.set(dir[0] * size * 1.15, dir[1] * size * 1.15, dir[2] * size * 1.15);
    sprite.scale.set(0.22, 0.22, 1);
    group.add(sprite);
  }

  return group;
}
