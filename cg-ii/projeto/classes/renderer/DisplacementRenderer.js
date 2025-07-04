import { BaseRenderer } from "./BaseRenderer.js";

export class DisplacementRenderer extends BaseRenderer {
    constructor(shaderName) {
        super(shaderName);
        this.materials = {}; // Armazena os materiais por nome
        this.ignoreLight = false;
        this.displacementScale = 0.1;
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
        this.aVertexColor = gl.getAttribLocation(program, 'aColor');

        this.uSamplerDiffuse = gl.getUniformLocation(program, 'material.diffuseMap');
        this.uSamplerSpecular = gl.getUniformLocation(program, 'material.specularMap');
        this.uSamplerNormal = gl.getUniformLocation(program, 'material.normalMap');
        this.uShininess = gl.getUniformLocation(program, 'material.shininess');

        this.uDiffuse = gl.getUniformLocation(program, 'material.diffuse');
        this.uSpecular = gl.getUniformLocation(program, 'material.specular');
        this.uAmbient = gl.getUniformLocation(program, 'material.ambient');
        this.uEmissive = gl.getUniformLocation(program, 'material.emissive');
        this.uIgnoreLight = gl.getUniformLocation(program, 'uIgnoreLight');

        // Novos uniforms para displacement
        this.uSamplerDisplacement = gl.getUniformLocation(program, 'material.displacementMap');
        this.uDisplacementScale = gl.getUniformLocation(program, 'displacementScale');
    }

    draw(model, viewMatrix, projectionMatrix, props) {
        let gl = this.gl;
        let program = this.program;

        gl.useProgram(program);

        // Aplica as transformações
        this.applyMatrixTransform(model, viewMatrix, projectionMatrix, props);

        // Passa o estado do ignoreLight
        gl.uniform1f(this.uIgnoreLight, this.ignoreLight);

        // Renderize cada geometria dentro do modelo
        model.obj.geometries.forEach(geometry => {
            this.initBuffersForGeometry(geometry);
            let material = this.materials[geometry.material];
            if (!material) {
                material = this.materials.DEFAULT;
            }
            if (material) {
                // Configura os mapas de textura, se existirem
                if (material.mapDiffuse) {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, material.mapDiffuse);
                    gl.uniform1i(this.uSamplerDiffuse, 0);
                }

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

                if (material.mapDisplacement) {
                    gl.activeTexture(gl.TEXTURE3);
                    gl.bindTexture(gl.TEXTURE_2D, material.mapDisplacement);
                    gl.uniform1i(this.uSamplerDisplacement, 3);
                }

                gl.uniform1f(this.uDisplacementScale, this.displacementScale);

                gl.uniform3fv(this.uAmbient, material.ambient || [1, 1, 1]); // Ka
                gl.uniform3fv(this.uEmissive, material.emissive || [0, 0.0, 0.0]); // Ke
                gl.uniform1f(this.uShininess, material.shininess || 400.0); // Brilho

                this.bindBuffers(geometry);

                gl.drawArrays(gl.TRIANGLES, 0, geometry.positions.length / 3);
            }
        });
    }

    initBuffersForGeometry(geometry) {
        let gl = this.gl;

        if (geometry.positions && geometry.positions.length > 0 && !geometry.positionBuffer) {
            geometry.positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, geometry.positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.positions), gl.STATIC_DRAW);
        }

        if (geometry.texcoords && geometry.texcoords.length > 0 && !geometry.texCoordBuffer) {
            geometry.texCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, geometry.texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.texcoords), gl.STATIC_DRAW);
        }

        if (geometry.normals && geometry.normals.length > 0 && !geometry.normalBuffer) {
            geometry.normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, geometry.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.normals), gl.STATIC_DRAW);
        }

        if (geometry.tangents && geometry.tangents.length > 0 && !geometry.tangentBuffer) {
            geometry.tangentBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, geometry.tangentBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.tangents), gl.STATIC_DRAW);
        }

        if (geometry.colors && geometry.colors.length > 0 && !geometry.colorBuffer) {
            geometry.colorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, geometry.colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.colors), gl.STATIC_DRAW);
        }
    }

    bindBuffers(geometry) {
        let gl = this.gl;

        if (geometry.positionBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, geometry.positionBuffer);
            gl.vertexAttribPointer(this.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aVertexPosition);
        }

        if (geometry.texCoordBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, geometry.texCoordBuffer);
            gl.vertexAttribPointer(this.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aTextureCoord);
        }

        if (geometry.normalBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, geometry.normalBuffer);
            gl.vertexAttribPointer(this.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aVertexNormal);
        }

        if (geometry.tangentBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, geometry.tangentBuffer);
            gl.vertexAttribPointer(this.aTangent, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aTangent);
        }

        if (geometry.colorBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, geometry.colorBuffer);
            gl.vertexAttribPointer(this.aVertexColor, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aVertexColor);
        }
    }
}
