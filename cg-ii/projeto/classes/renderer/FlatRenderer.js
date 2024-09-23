import { BaseRenderer } from "./BaseRenderer.js";

export class FlatRenderer extends BaseRenderer {
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
        let gl = this.gl;
        let program = this.program;

        gl.useProgram(program);

        // Enviar a cor para o shader
        gl.uniform3fv(this.uColor, this.color);

        // Aplica as transformações
        this.applyMatrixTransform(model, viewMatrix, projectionMatrix);

        // Renderize cada geometria dentro do modelo
        model.obj.geometries.forEach(geometry => {
            // Configura os buffers para a geometria atual
            this.setupGeometryBuffers(geometry);

            // Desenhar os elementos
            gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);
        });
    }

    setupGeometryBuffers(geometry) {
        let gl = this.gl;

        if (geometry.positions && geometry.positions.length > 0) {
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.positions.flat()), gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aVertexPosition);
        }

        if (geometry.normals && geometry.normals.length > 0) {
            const normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.normals.flat()), gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aVertexNormal);
        }

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices.flat()), gl.STATIC_DRAW);
    }
}
