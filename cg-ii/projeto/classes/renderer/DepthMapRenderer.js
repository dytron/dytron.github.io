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
        let program = this.program;

        gl.useProgram(program);

        this.applyMatrixTransform(model, lightMatrix, projectionMatrix, {});

        model.obj.geometries.forEach(geometry => {
            this.initBuffersForGeometry(geometry);
            this.bindBuffers(geometry);
            gl.drawArrays(gl.TRIANGLES, 0, geometry.positions.length / 3);
        });
    }

    initBuffersForGeometry(geometry) {
        if (geometry.positions && geometry.positions.length > 0 && !geometry.positionBuffer) {
            geometry.positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, geometry.positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.positions), gl.STATIC_DRAW);
        }
    }

    bindBuffers(geometry) {
        if (geometry.positionBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, geometry.positionBuffer);
            gl.vertexAttribPointer(this.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aVertexPosition);
        }
    }
}
