import { BaseRenderer } from "./BaseRenderer.js";

export class ShadowMapRenderer extends BaseRenderer {
    constructor(shaderName) {
        super(shaderName);        
        this.uShadowMap = null;  // Localização do shadow map
        this.uLightSpaceMatrix = null;  // Localização da matriz de projeção da luz
    }

    initLocation(gl, program) {
        super.initLocation(gl, program);
        
        // Localização para o shadow map no shader
        this.uShadowMap = gl.getUniformLocation(program, 'uShadowMap');
        this.uBias = gl.getUniformLocation(program, 'uBias');
        
        // Localização para a matriz de projeção da luz no shader
        this.uLightSpaceMatrix = gl.getUniformLocation(program, 'uLightViewProjectionMatrix');
    }

    draw(model, viewMatrix, projectionMatrix, props) {
        let program = this.program;

        gl.useProgram(program);
        
        // Aplica as transformações de câmera
        this.applyMatrixTransform(model, viewMatrix, projectionMatrix, props);

        // Definir a matriz light space matrix (projeção da luz) no shader
        gl.uniformMatrix4fv(this.uLightSpaceMatrix, false, scene.shadowMapping.lightSpaceMatrix);

        // Definir o shadow map no shader
        scene.shadowMapping.shadowMap.bindTexture(4);
        gl.uniform1i(this.uShadowMap, 4);
        gl.uniform1f(this.uBias, 0.001);


        // Renderizar cada geometria dentro do modelo
        model.obj.geometries.forEach((geometry) => {
            // Configurar os buffers para a geometria atual
            this.setupGeometryBuffers(geometry);

            // Usar índices para desenhar a geometria
            gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);
        });
    }

    setupGeometryBuffers(geometry) {
        // Buffer de posições (necessário para o depth map)
        if (geometry.positions && geometry.positions.length > 0) {
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.positions), gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aVertexPosition);
        }

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
