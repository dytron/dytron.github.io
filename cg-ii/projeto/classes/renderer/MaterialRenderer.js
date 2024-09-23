import { BaseRenderer } from "./BaseRenderer.js";

export class MaterialRenderer extends BaseRenderer {
    constructor(shaderName) {
        super(shaderName);
        this.materials = {}; // Armazena os materiais por nome
        this.ignoreLight = false;
    }
    setIgnoreLight(ignoreLight) {
        this.ignoreLight = ignoreLight;
        return this;
    }
    setMaterials(materials) {
        this.materials = materials;
    }

    initLocation(gl, program) {
        
        super.initLocation(gl, program);
        this.aTangent = gl.getAttribLocation(program, 'aTangent'); 
        this.aTextureCoord = gl.getAttribLocation(program, 'aTexCoord'); 
        this.aVertexColor = gl.getAttribLocation(program, 'aColor'); // Adicionando cor dos vértices
    
        this.uSamplerDiffuse = gl.getUniformLocation(program, 'material.diffuseMap');
        this.uSamplerSpecular = gl.getUniformLocation(program, 'material.specularMap');
        this.uSamplerNormal = gl.getUniformLocation(program, 'material.normalMap');
        this.uShininess = gl.getUniformLocation(program, 'material.shininess');
        
        this.uDiffuse = gl.getUniformLocation(program, 'material.diffuse');
        this.uSpecular = gl.getUniformLocation(program, 'material.specular');
        this.uAmbient = gl.getUniformLocation(program, 'material.ambient');
        this.uEmissive = gl.getUniformLocation(program, 'material.emissive');
        this.uIgnoreLight = gl.getUniformLocation(program, 'uIgnoreLight');
    }

    draw(model, viewMatrix, projectionMatrix, props) {
        let program = this.program;
    
        gl.useProgram(program);
    
        // Aplica as transformações
        this.applyMatrixTransform(model, viewMatrix, projectionMatrix, props);
        console.log(`model: ${model.name}, shader: ${this.shaderName}, ignoreLight: ${this.ignoreLight}`);
        gl.uniform1f(this.uIgnoreLight, this.ignoreLight);
        // Renderize cada geometria dentro do modelo
        model.obj.geometries.forEach(geometry => {
            const material = this.materials[geometry.material];
            if (material) {
                // Configura os mapas de textura, se existirem
                if (material.mapDiffuse) {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, material.mapDiffuse);
                    gl.uniform1i(this.uSamplerDiffuse, 0);
                } 
                gl.uniform1f(this.uIgnoreLight, this.ignoreLight);
                gl.uniform3fv(this.uDiffuse, material.diffuse || [1.0, 1.0, 1.0]);
                
    
                if (material.mapSpecular) {
                    gl.activeTexture(gl.TEXTURE1);
                    gl.bindTexture(gl.TEXTURE_2D, material.mapSpecular);
                    gl.uniform1i(this.uSamplerSpecular, 1);
                } 

                gl.uniform3fv(this.uSpecular, material.specular || [1.0, 1.0, 1.0]);
                
                if (material.mapNormal) {
                    gl.activeTexture(gl.TEXTURE2);
                    gl.bindTexture(gl.TEXTURE_2D, material.mapNormal);
                    gl.uniform1i(this.uSamplerNormal, 2);
                }
    
                gl.uniform3fv(this.uAmbient, material.ambient || [1, 1, 1]); // Ka
                gl.uniform3fv(this.uEmissive, material.emissive || [0, 0.0, 0.0]); // Ke
                gl.uniform1f(this.uShininess, material.shininess || 400.0); // Passa o brilho
    
                // Configura os buffers para a geometria atual
                this.setupGeometryBuffers(geometry);
    
                // Agora que estamos utilizando índices, usamos `gl.drawElements`
                gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);
            }
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

        if (geometry.texcoords && geometry.texcoords.length > 0) {
            const texCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.texcoords), gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aTextureCoord);
        }

        if (geometry.normals && geometry.normals.length > 0) {
            const normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.normals), gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aVertexNormal);
        }

        if (geometry.tangents && geometry.tangents.length > 0) {
            const tangentBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, tangentBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.tangents), gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.aTangent, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aTangent);
        }

        if (this.aVertexColor !== -1 && geometry.colors && geometry.colors.length > 0) {
            const colorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.colors), gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.aVertexColor, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aVertexColor);
        }

        if (geometry.indices && geometry.indices.length > 0) {
            const indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices), gl.STATIC_DRAW);
        }
    }
}
