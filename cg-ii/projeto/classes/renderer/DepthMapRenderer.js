import { BaseRenderer } from "./BaseRenderer.js";

export class DepthMapRenderer extends BaseRenderer {
    constructor(shaderName) {
        super(shaderName);
        this.color = [1, 1, 1];
    }

    initLocation(gl, program) {
        if (gl === null) return;
        this.aVertexPosition = gl.getAttribLocation(program, 'aPosition');
        this.uModelMatrix = gl.getUniformLocation(program, 'uModelMatrix');
        this.uModelLightProjectionMatrix = gl.getUniformLocation(program, 'uModelLightProjectionMatrix');
    }
    

    setColor(color) {
        this.color = color;
        return this;
    }

    draw(model, lightMatrix, projectionMatrix) {
        let gl = this.gl;
        let program = this.program;

        gl.useProgram(program);

        // Aplica as transformações
        this.applyMatrixTransform(model, lightMatrix, projectionMatrix, {});

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
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.positions), gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aVertexPosition);
        }

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices), gl.STATIC_DRAW);
    }
}
