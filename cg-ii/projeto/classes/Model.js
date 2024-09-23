import { GLRenderTexture2D } from "./gl-render/GLRenderTexture.js";
import { DepthMapRenderer } from "./renderer/DepthMapRenderer.js";
import { FlatRenderer } from "./renderer/FlatRenderer.js";
import { MaterialRenderer } from "./renderer/MaterialRenderer.js";
import { ModelRenderer } from "./renderer/ModelRenderer.js";
import { SceneObject } from "./SceneObject.js";

export class Model extends SceneObject {
    constructor() {
        super();
        this.obj = null;
        this.aVertexPosition = null;
        this.aVertexNormal = null;
        this.uModelViewMatrix = null;
        this.uModelViewProjectionMatrix = null;
        this.center = [0, 0, 0];
        this.scale = [1, 1, 1];
        this.rotation = [0, 0, 0];
        this.translation = [0, 0, 0];
        this.useAutoCenter = false;
        this.renderer = new ModelRenderer();
        this.props = {};
        this.useRenderToTexture = false; // Flag para renderizar na textura
        this.renderTexture = null; // Instância do GLRenderTexture
        this.planeProperties = {
            position: [0, 0, 0], // Posição do plano
            scale: [1, 1, 1],
            translation: [0, 0, 0],
            rotation: [0, 0, 0],
            center: [0, 0, 0],
        };
        this.castShadows = true;
    }
    setOBJ(obj) {
        this.obj = obj;
        return this;
    }
    setRenderer(renderer) {
        this.renderer = renderer;
        return this;
    }
    setCenter(center) {
        this.center = center;
        return this;
    }
    setScale(scale) {
        this.scale = scale;
        return this;
    }
    setPosition(translation) {
        this.translation = translation;
        return this;
    }
    setRotationX(angle) {
        this.rotation[0] = angle;
        return this;
    }
    setRotationY(angle) {
        this.rotation[1] = angle;
        return this;
    }
    setRotationZ(angle) {
        this.rotation[2] = angle;
        return this;
    }
    autoCenter() {
        this.useAutoCenter = true;
        return this;
    }
    
    setCastShadows(castShadows) {
        this.castShadows = castShadows;
        return this;   
    }
    applyAutoCenter() {
        let minV = [Infinity, Infinity, Infinity];
        let maxV = [-Infinity, -Infinity, -Infinity];

        this.obj.geometries.forEach(geometry => {
            const positions = geometry.positions;
            for (let i = 0; i < positions.length; i += 3) {
                minV[0] = Math.min(minV[0], positions[i]);     // x
                minV[1] = Math.min(minV[1], positions[i + 1]); // y
                minV[2] = Math.min(minV[2], positions[i + 2]); // z

                maxV[0] = Math.max(maxV[0], positions[i]);     // x
                maxV[1] = Math.max(maxV[1], positions[i + 1]); // y
                maxV[2] = Math.max(maxV[2], positions[i + 2]); // z
            }
        });

        let center = [0, 0, 0];
        for (let i = 0; i < 3; i++) {
            center[i] = ((maxV[i] + minV[i]) / 2);
        }

        this.setCenter(center);
        this.useAutoCenter = false;
    }
    depthDraw(viewMatrix, projectionMatrix) {
        if (!this.castShadows) return;
        const renderer = new DepthMapRenderer("depth-map");
        renderer.updateShader(gl, scene.shaderManager);
        renderer.draw(this, viewMatrix, projectionMatrix);
    }
    draw(viewMatrix, projectionMatrix, props) {
        if (!this.obj.isLoaded()) return;
        if (this.useAutoCenter) {
            this.applyAutoCenter();
        }

        // Se a renderização em textura estiver ativada
        if (this.useRenderToTexture) {
            // Renderiza para a textura
            const viewMatrix2 = mat4.create();
            const projectionMatrix2 = mat4.create();

            this.scene.planeCamera.setUniforms(this.renderer.program);
            this.scene.planeCamera.apply(viewMatrix2, projectionMatrix2);

            this.renderTexture.bind();
            gl.clearColor(...this.scene.planeCamera.backgroundColor, 1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            this.renderer.draw(this, viewMatrix2, projectionMatrix2, props);
            this.renderTexture.unbind();
            this.renderTexture.buildTextureMipmaps();
            
            gl.useProgram(this.scene.shaderManager.program.material);
            this.scene.camera.apply(viewMatrix, projectionMatrix);
            this.scene.camera.setUniforms(this.scene.shaderManager.program.material);
            // Agora desenha o plano com a textura renderizada
            this.drawTexturedPlane(viewMatrix, projectionMatrix);
        } else {
            // Renderiza o objeto normalmente
            if (this.renderer) {
                this.renderer.draw(this, viewMatrix, projectionMatrix, props);
            }
        }
    }
    drawTexturedPlane(viewMatrix, projectionMatrix, props) {    
        // As normais do plano são todas apontando para o eixo Z positivo
        const normalX = 0.0, normalY = 0.0, normalZ = 1.0;
    
        // As tangentes do plano são todas apontando para o eixo X positivo
        const tangentX = 1.0, tangentY = 0.0, tangentZ = 0.0;
    
        // Configurar o plano e adicionar normais e tangentes aos vértices
        const planeVertices = new Float32Array([
            // Posição X, Posição Y, Posição Z, Normal X, Normal Y, Normal Z, Tangente X, Tangente Y, Tangente Z, TexCoord X, TexCoord Y
            - 1 / 2, -1 / 2, 0, normalX, normalY, normalZ, tangentX, tangentY, tangentZ, 0.0, 0.0,
              1 / 2, -1 / 2, 0, normalX, normalY, normalZ, tangentX, tangentY, tangentZ, 1.0, 0.0,
              1 / 2,  1 / 2, 0, normalX, normalY, normalZ, tangentX, tangentY, tangentZ, 1.0, 1.0,
            - 1 / 2,  1 / 2, 0, normalX, normalY, normalZ, tangentX, tangentY, tangentZ, 0.0, 1.0
        ]);
    
        const planeIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);
        const materialRenderer = new MaterialRenderer("material");
        materialRenderer.updateShader(gl, this.scene.shaderManager);
        materialRenderer.applyMatrixTransform(this.planeProperties, viewMatrix, projectionMatrix, {});
    
        gl.uniform1f(materialRenderer.uIgnoreLight, true);

        // Criar os buffers para o plano
        const planePositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, planePositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, planeVertices, gl.STATIC_DRAW);
    
        const planeIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planeIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, planeIndices, gl.STATIC_DRAW);
    
        // Ativar a textura renderizada no diffuseMap
        this.renderTexture.bindTexture(0); // Passa a textura renderizada
    
        // Passar as texturas padrão para o specularMap e normalMap
        const whiteTexture = this.scene.materialManager.defaultTextures.white;
        const normalTexture = this.scene.materialManager.defaultTextures.normal;
    
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, whiteTexture); // SpecularMap (branco)
    
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, normalTexture); // NormalMap (normal padrão)
    
        // O stride é 11 floats (3 posição, 3 normais, 3 tangentes, 2 coordenadas de textura), cada float tem 4 bytes
        const stride = 11 * 4;
    
        // Configurar os atributos do plano corretamente com offset
        gl.vertexAttribPointer(this.renderer.aVertexPosition, 3, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(this.renderer.aVertexPosition);
    
        gl.vertexAttribPointer(this.renderer.aVertexNormal, 3, gl.FLOAT, false, stride, 3 * 4);
        gl.enableVertexAttribArray(this.renderer.aVertexNormal);
    
        gl.vertexAttribPointer(this.renderer.aTangent, 3, gl.FLOAT, false, stride, 6 * 4);
        gl.enableVertexAttribArray(this.renderer.aTangent);
    
        gl.vertexAttribPointer(this.renderer.aTextureCoord, 2, gl.FLOAT, false, stride, 9 * 4);
        gl.enableVertexAttribArray(this.renderer.aTextureCoord);
    
        // Definir os uniformes para os samplers de textura
        gl.uniform1i(this.renderer.uSamplerDiffuse, 0);  // diffuseMap (textura renderizada)
        gl.uniform1i(this.renderer.uSamplerSpecular, 1); // specularMap (branco)
        gl.uniform1i(this.renderer.uSamplerNormal, 2);   // normalMap (normal padrão)
    
        // Desenhar o plano
        gl.drawElements(gl.TRIANGLES, planeIndices.length, gl.UNSIGNED_SHORT, 0);
    }
    
    setRenderToTexture(useRenderToTexture, width = 1024, height = 1024) {
        this.useRenderToTexture = useRenderToTexture;
        if (useRenderToTexture) {
            this.renderTexture = new GLRenderTexture2D(gl);
            this.renderTexture.initialize(true, 4, width, height);
        }
        return this;
    }

    setPlaneProperties(planeProperties) {
        this.planeProperties = { ...this.planeProperties, ...planeProperties };
        return this;
    }
}