import { BaseRenderer } from "./BaseRenderer.js";

export class ModelRenderer extends BaseRenderer {
    constructor(shaderName) {
        super(shaderName);
    }

    initLocation(gl, program) {
        super.initLocation(gl, program);
    }

    initBuffersForGeometry(geometry) {
        let gl = this.gl;

        // Buffer de posições
        if (geometry.positions && geometry.positions.length > 0 && !geometry.positionBuffer) {
            geometry.positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, geometry.positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.positions), gl.STATIC_DRAW);
        }

        // Buffer de normais
        if (geometry.normals && geometry.normals.length > 0 && !geometry.normalBuffer) {
            geometry.normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, geometry.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.normals), gl.STATIC_DRAW);
        }

        // Buffer de índices
        if (geometry.indices && geometry.indices.length > 0 && !geometry.indexBuffer) {
            geometry.indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices), gl.STATIC_DRAW);
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

    draw(model, viewMatrix, projectionMatrix, props) {
        let program = this.program;

        gl.useProgram(program);

        this.applyMatrixTransform(model, viewMatrix, projectionMatrix, props);

        model.obj.geometries.forEach((geometry) => {
            this.initBuffersForGeometry(geometry); 
            this.bindBuffers(geometry);
            gl.drawArrays(gl.TRIANGLES, 0, geometry.positions.length / 3);
        });
    }
}
