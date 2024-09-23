import { BaseRenderer } from "./BaseRenderer.js";

export class WireframeRenderer extends BaseRenderer {
    constructor(shaderName) {
        super(shaderName);
        this.color = [1, 1, 1];
    }

    initLocation(gl, program) {
        super.initLocation(gl, program);
        // Obtém as localizações dos atributos e uniformes do shader
        this.uColor = gl.getUniformLocation(program, 'uColor'); 
    }

    setColor(color) {
        this.color = color;
        return this;
    }

    draw(model, viewMatrix, projectionMatrix) {
        let program = this.program;
        gl.useProgram(program);

        // Aplica as transformações
        this.applyMatrixTransform(model, viewMatrix, projectionMatrix);

        gl.uniform3fv(this.uColor, this.color);

        // Renderize cada geometria dentro do modelo
        model.obj.geometries.forEach(geometry => {
            // Buffer de posição dos vértices
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.positions.flat()), gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aVertexPosition);

            // Buffer de índices das arestas (wireframe)
            const edges = this.generateEdges(geometry.indices.flat());
            const edgeBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, edgeBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(edges), gl.STATIC_DRAW);

            // Desenha as arestas
            gl.drawElements(gl.LINES, edges.length, gl.UNSIGNED_SHORT, 0);
        });
    }

    // Gera as arestas a partir dos índices dos triângulos
    generateEdges(indices) {
        const edges = new Set();

        for (let i = 0; i < indices.length; i += 3) {
            const edge1 = [indices[i], indices[i + 1]].sort((a, b) => a - b).join('-');
            const edge2 = [indices[i + 1], indices[i + 2]].sort((a, b) => a - b).join('-');
            const edge3 = [indices[i + 2], indices[i]].sort((a, b) => a - b).join('-');

            edges.add(edge1);
            edges.add(edge2);
            edges.add(edge3);
        }

        // Converter o conjunto de arestas em um array de índices
        return Array.from(edges).flatMap(edge => edge.split('-').map(Number));
    }
}
