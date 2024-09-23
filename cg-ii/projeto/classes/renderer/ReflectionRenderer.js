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

        // Localizações específicas para o ReflectionRenderer
        this.uSkybox = gl.getUniformLocation(program, "uSkybox");
        this.uIgnoreLight = gl.getUniformLocation(program, "uIgnoreLight");
    }

    draw(model, viewMatrix, projectionMatrix, props) {
        let program = this.program;
        
        gl.useProgram(program);
        
        // Aplica as transformações
        this.applyMatrixTransform(model, viewMatrix, projectionMatrix, props);
        
        // Vincula o cubemap para reflexões
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, scene.skybox.skyboxTexture);
        gl.uniform1i(this.uSkybox, 0);

        gl.uniform1f(this.uIgnoreLight, this.ignoreLight);
        
        // Renderiza cada geometria dentro do modelo
        model.obj.geometries.forEach((geometry) => {
            // Configura os buffers para a geometria atual
            this.setupGeometryBuffers(geometry);
            
            // Renderiza os elementos da geometria
            gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);
        });
    }
    
    

    setupGeometryBuffers(geometry) {
        // Buffer de posições
        if (geometry.positions && geometry.positions.length > 0) {
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.positions.flat()), gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aVertexPosition);
        }

        // Buffer de normais
        if (geometry.normals && geometry.normals.length > 0) {
            const normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.normals.flat()), gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aVertexNormal);
        }

        // Buffer de índices
        if (geometry.indices && geometry.indices.length > 0) {
            const indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices.flat()), gl.STATIC_DRAW);
        } else {
            console.warn('Nenhum índice encontrado para a geometria.');
        }
    }
}
