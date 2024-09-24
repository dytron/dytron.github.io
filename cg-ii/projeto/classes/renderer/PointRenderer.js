import { BaseRenderer } from "./BaseRenderer.js";

export class PointRenderer extends BaseRenderer {
    constructor(shaderName) {
        super(shaderName);
        // Atributos
        this.pointSize = 2;
        this.color = [1, 1, 1];
    }

    // Locations
    initLocation(gl, program) {
        super.initLocation(gl, program);
        this.uPointSize = gl.getUniformLocation(program, 'uPointSize'); 
        this.uColor = gl.getUniformLocation(program, 'uColor');
    }

    setPointSize(pointSize) {
        this.pointSize = pointSize;
        return this;
    }

    setColor(color) {
        this.color = color;
        return this;
    }

    draw(model, viewMatrix, projectionMatrix, props) {
        let gl = this.gl;
        let program = this.program;
        
        gl.useProgram(program);

        this.applyMatrixTransform(model, viewMatrix, projectionMatrix, props);

        gl.uniform1f(this.uPointSize, this.pointSize);
        gl.uniform3fv(this.uColor, this.color);

        model.obj.geometries.forEach(geometry => {
            this.initBuffersForGeometry(geometry);
            this.bindBuffers(geometry);

            // Desenhar os pontos - divide por 3 pois são 3 componentes por vértice (x, y, z)
            const numVertices = geometry.positions.length / 3;
            gl.drawArrays(gl.POINTS, 0, numVertices);
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
