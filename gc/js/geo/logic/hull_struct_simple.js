// Estrutura simples para suporte interno do fecho convexo 3D.
// Armazena faces em array e verifica arestas por busca linear nas faces já inseridas.
// isEdgeFree é O(F) - sem estrutura auxiliar de busca.

function createSimpleStruct() {
  const faces = [];

  function countEdgeUse(u, v) {
    let same = 0;
    let reverse = 0;

    for (const face of faces) {
      const [a, b, c] = face.verts;
      if ((a === u && b === v) || (b === u && c === v) || (c === u && a === v)) same++;
      if ((a === v && b === u) || (b === v && c === u) || (c === v && a === u)) reverse++;
    }

    return { same, reverse };
  }

  return {
    faces,
    we: null,
    isEdgeFree(u, v) {
      return countEdgeUse(u, v).reverse === 0;
    },
    countEdgeUse,
    insertFace(v0, v1, v2, normal) {
      faces.push({ verts: [v0, v1, v2], normal });
    },
  };
}
