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

        // Aplica as transformações
        this.applyMatrixTransform(model, viewMatrix, projectionMatrix, props);

        // Configura o tamanho do ponto
        gl.uniform1f(this.uPointSize, this.pointSize);

        // Configura a cor do ponto
        gl.uniform3fv(this.uColor, this.color);

        // Renderize cada geometria dentro do modelo
        model.obj.geometries.forEach(geometry => {
            // Buffer para os vértices
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.positions.flat()), gl.STATIC_DRAW);

            gl.vertexAttribPointer(this.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aVertexPosition);

            // Desenhar os pontos - divide por 3 pois são 3 componentes por vértice (x, y, z)
            const numVertices = geometry.positions.length / 3;
            gl.drawArrays(gl.POINTS, 0, numVertices);
        });
    }
}
