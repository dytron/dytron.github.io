// Estrutura Winged-Edge usada dentro do fecho convexo 3D.
// Para saber se uma aresta está livre, olha só as arestas ligadas ao vértice.

function createWingedStruct() {
  const we = createWingedEdge();

  function countEdgeUse(u, v) {
    const edgeIndex = findEdge(we, u, v);
    if (edgeIndex === -1) return { same: 0, reverse: 0 };

    const edge = we.edges[edgeIndex];
    if (edge.vertOrigin === u && edge.vertDestination === v) {
      return {
        same: edge.faceLeft === -1 ? 0 : 1,
        reverse: edge.faceRight === -1 ? 0 : 1,
      };
    }

    return {
      same: edge.faceRight === -1 ? 0 : 1,
      reverse: edge.faceLeft === -1 ? 0 : 1,
    };
  }

  return {
    faces: we.faces,
    we,
    isEdgeFree(u, v) {
      return countEdgeUse(u, v).reverse === 0;
    },
    countEdgeUse,
    insertFace(v0, v1, v2, normal) {
      addFaceToWE(we, v0, v1, v2, normal);
    },
  };
}
