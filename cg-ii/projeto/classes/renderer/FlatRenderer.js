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

        gl.uniform3fv(this.uColor, this.color);
        this.applyMatrixTransform(model, viewMatrix, projectionMatrix);

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
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.positions.flat()), gl.STATIC_DRAW);
        }

        if (geometry.normals && geometry.normals.length > 0 && !geometry.normalBuffer) {
            geometry.normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, geometry.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.normals.flat()), gl.STATIC_DRAW);
        }
    }

    bindBuffers(geometry) {
        if (geometry.positionBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, geometry.positionBuffer);
            gl.vertexAttribPointer(this.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aVertexPosition);
        }

        if (geometry.normalBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, geometry.normalBuffer);
            gl.vertexAttribPointer(this.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aVertexNormal);
        }
    }
}
