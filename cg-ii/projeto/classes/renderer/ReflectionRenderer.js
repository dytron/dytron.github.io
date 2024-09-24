import { BaseRenderer } from "./BaseRenderer.js";

export class ReflectionRenderer extends BaseRenderer {
    constructor(shaderName) {
        super(shaderName);
        this.uCameraPosition = null;
        this.uSkybox = null;
        this.uIgnoreLight = null;
        this.ignoreLight = false;
    }

    setIgnoreLight(ignoreLight) {
        this.ignoreLight = ignoreLight;
        return this;
    }

    initLocation(gl, program) {
        super.initLocation(gl, program);

        this.uSkybox = gl.getUniformLocation(program, "uSkybox");
        this.uIgnoreLight = gl.getUniformLocation(program, "uIgnoreLight");
    }

    draw(model, viewMatrix, projectionMatrix, props) {
        let program = this.program;

        gl.useProgram(program);

        this.applyMatrixTransform(model, viewMatrix, projectionMatrix, props);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, scene.skybox.skyboxTexture);
        gl.uniform1i(this.uSkybox, 0);

        gl.uniform1f(this.uIgnoreLight, this.ignoreLight);

        model.obj.geometries.forEach((geometry) => {
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
