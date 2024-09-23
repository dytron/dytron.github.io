import { BaseRenderer } from "./BaseRenderer.js";

export class ModelRenderer extends BaseRenderer {
    constructor(shaderName) {
        super(shaderName);
    }

    initLocation(gl, program) {
        super.initLocation(gl, program);
    }

    draw(model, viewMatrix, projectionMatrix, props) {
        let gl = this.gl;
        let program = this.program;

        gl.useProgram(program);
        // Aplica as transformações
        this.applyMatrixTransform(model, viewMatrix, projectionMatrix, props);

        // Renderize cada geometria dentro do modelo
        model.obj.geometries.forEach((geometry) => {
            // Configura os buffers para a geometria atual
            this.setupGeometryBuffers(geometry);

            // Agora que estamos utilizando índices, usamos `gl.drawElements`
            gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);
        });
    }

    setupGeometryBuffers(geometry) {
        let gl = this.gl;

        // Buffer de posições
        if (geometry.positions && geometry.positions.length > 0) {
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.positions), gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aVertexPosition);
        }

        // Buffer de normais
        if (geometry.normals && geometry.normals.length > 0) {
            const normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.normals), gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aVertexNormal);
        }

        // Buffer de índices
        if (geometry.indices && geometry.indices.length > 0) {
            const indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices), gl.STATIC_DRAW);
        } else {
            console.warn('Nenhum índice encontrado para a geometria.');
        }
    }
}
