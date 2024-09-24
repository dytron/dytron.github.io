import { BaseRenderer } from "./BaseRenderer.js";

export class WireframeRenderer extends BaseRenderer {
    constructor(shaderName) {
        super(shaderName);
        this.color = [1, 1, 1];
    }

    initLocation(gl, program) {
        super.initLocation(gl, program);
        this.uColor = gl.getUniformLocation(program, 'uColor'); 
    }

    setColor(color) {
        this.color = color;
        return this;
    }

    draw(model, viewMatrix, projectionMatrix) {
        let program = this.program;
        gl.useProgram(program);

        this.applyMatrixTransform(model, viewMatrix, projectionMatrix);

        gl.uniform3fv(this.uColor, this.color);

        model.obj.geometries.forEach(geometry => {
            this.initBuffersForGeometry(geometry);
            this.bindBuffers(geometry);

            // Desenha o wireframe
            const edgeCount = (geometry.positions.length / 3) * 2;
            gl.drawElements(gl.LINES, edgeCount, gl.UNSIGNED_SHORT, 0);
        });
    }

    // Inicializa os buffers apenas se ainda não tiverem sido criados
    initBuffersForGeometry(geometry) {
        let gl = this.gl;

        if (!geometry.positionBuffer) {
            geometry.positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, geometry.positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.positions.flat()), gl.STATIC_DRAW);
        }

        if (!geometry.edgeBuffer) {
            // Gera arestas implicitamente considerando que cada três vértices consecutivos formam um triângulo
            const edgeIndices = this.generateEdgesFromTriangles(geometry.positions);
            geometry.edgeBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.edgeBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(edgeIndices), gl.STATIC_DRAW);
        }
    }

    // Faz apenas o bind dos buffers já criados
    bindBuffers(geometry) {
        gl.bindBuffer(gl.ARRAY_BUFFER, geometry.positionBuffer);
        gl.vertexAttribPointer(this.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.aVertexPosition);

        if (geometry.edgeBuffer) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.edgeBuffer);
        }
    }

    // Gera as arestas para os triângulos, assumindo que cada 3 vértices consecutivos formam um triângulo
    generateEdgesFromTriangles(positions) {
        const edgeIndices = [];
        const numTriangles = positions.length / 3;

        for (let i = 0; i < numTriangles; i++) {
            const i0 = i * 3;
            const i1 = i0 + 1;
            const i2 = i0 + 2;

            // Cada triângulo gera três arestas
            edgeIndices.push(i0, i1);  // Aresta 1: v0 -> v1
            edgeIndices.push(i1, i2);  // Aresta 2: v1 -> v2
            edgeIndices.push(i2, i0);  // Aresta 3: v2 -> v0
        }

        return edgeIndices;
    }
}
