// Estrutura Winged-Edge para malhas trianguladas 3D.
// Cada aresta fica guardada uma vez só, com as duas faces que usam ela
// e com os ponteiros para andar pelas arestas vizinhas.

function createWingedEdge() {
  return {
    edges: [],       // { a, b, faceLeft, faceRight, edgeLeftCcw, edgeLeftCw, edgeRightCcw, edgeRightCw }
    faces: [],       // { edge, verts, normal }
    vertexEdges: [], // vertexEdges[v] -> arestas que tocam no vértice v
  };
}

function _getVertexEdges(we, vertex) {
  if (!we.vertexEdges[vertex]) we.vertexEdges[vertex] = [];
  return we.vertexEdges[vertex];
}

// Procura a aresta do par u-v olhando só as arestas do vértice u.
function findEdge(we, u, v) {
  const edgesFromU = we.vertexEdges[u];
  if (!edgesFromU) return -1;

  for (const edgeIndex of edgesFromU) {
    const edge = we.edges[edgeIndex];
    if ((edge.vertOrigin === u && edge.vertDestination === v) || (edge.vertOrigin === v && edge.vertDestination === u)) {
      return edgeIndex;
    }
  }

  return -1;
}

// Retorna o índice da aresta do par u-v. Se ainda não existir, cria.
function _getOrCreateEdge(we, u, v, faceIndex) {
  const edgeIndex = findEdge(we, u, v);
  if (edgeIndex !== -1) {
    const edge = we.edges[edgeIndex];

    if (edge.vertOrigin === v && edge.vertDestination === u) {
      if (edge.faceRight !== -1) throw new Error('Aresta com mais de duas faces');
      edge.faceRight = faceIndex;
      return edgeIndex;
    }

    if (edge.faceLeft !== -1) throw new Error('Aresta repetida na mesma orientação');
    edge.faceLeft = faceIndex;
    return edgeIndex;
  }

  const newEdgeIndex = we.edges.length;
  we.edges.push({
    vertOrigin: u,
    vertDestination: v,
    faceLeft: faceIndex,
    faceRight: -1,
    edgeLeftCcw: -1,
    edgeLeftCw: -1,
    edgeRightCcw: -1,
    edgeRightCw: -1,
  });
  const edgesU = _getVertexEdges(we, u);
  const edgesV = _getVertexEdges(we, v);
  edgesU.push(newEdgeIndex);
  edgesV.push(newEdgeIndex);
  return newEdgeIndex;
}

function addFaceToWE(we, v0, v1, v2, normal) {
  const faceIndex = we.faces.length;

  const e0 = _getOrCreateEdge(we, v0, v1, faceIndex);
  const e1 = _getOrCreateEdge(we, v1, v2, faceIndex);
  const e2 = _getOrCreateEdge(we, v2, v0, faceIndex);

  we.faces.push({ edge: e0, verts: [v0, v1, v2], normal });

  // Decide em qual lado da aresta esta face entrou e liga os ponteiros.
  function ligar(edgeIndex, nextEdgeIndex, prevEdgeIndex) {
    const edge = we.edges[edgeIndex];
    if (edge.faceLeft === faceIndex) {
      edge.edgeLeftCcw = nextEdgeIndex;
      edge.edgeLeftCw = prevEdgeIndex;
    } else {
      edge.edgeRightCcw = nextEdgeIndex;
      edge.edgeRightCw = prevEdgeIndex;
    }
  }

  ligar(e0, e1, e2);
  ligar(e1, e2, e0);
  ligar(e2, e0, e1);
}
