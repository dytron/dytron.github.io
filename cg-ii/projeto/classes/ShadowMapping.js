import { GLRenderDepth2D } from './gl-render/GLRenderDepth.js';
import { GLRenderTexture2D } from './gl-render/GLRenderTexture.js';
import { SpotLight } from './light/SpotLight.js';

export class ShadowMapping {
    constructor(light, width = 1024, height = 1024) {
        this.light = light; // Pode ser uma DirectionalLight ou SpotLight
        this.shadowMap = new GLRenderDepth2D(gl);
        this.shadowMap.initialize(true, width, height);  // Modo comparação de profundidade ativo
        
        this.lightProjectionMatrix = mat4.create();
        this.lightViewMatrix = mat4.create();
        this.lightSpaceMatrix = mat4.create(); // Matrix combinada de projeção e view

        // Variáveis para o debug quad
        this.debugQuadVAO = null;
        this.debugQuadVBO = null;
        this.debugProgram = null;
    }

    /**
     * Atualiza as matrizes de projeção e visualização da luz.
     */
    updateLightMatrices() {
        const lightPos = this.light.getPosition();
        const lightTarget = this.light.getDirection(); // Direção do holofote

        if (this.light instanceof SpotLight) {
            const fov = Math.acos(this.light.outerCutOff) * 2; // Campo de visão baseado no ângulo do spot
            mat4.perspective(this.lightProjectionMatrix, fov, 1.0, 0.1, 50); // Ajuste conforme necessário
        } else {
            // Projeção ortográfica para luz direcional
            mat4.ortho(this.lightProjectionMatrix, -10, 10, -10, 10, 0.1, 50); // Ajuste conforme necessário
        }

        // Crie a matriz de visualização da luz (usando lookAt para simular uma "câmera")
        mat4.lookAt(this.lightViewMatrix, lightPos, lightTarget, [0, 1, 0]);

        // Combine view e projection em uma só matriz
        mat4.multiply(this.lightSpaceMatrix, this.lightProjectionMatrix, this.lightViewMatrix);
    }

    /**
     * Aplica o shadow mapping na cena.
     */
    apply(scene) {
        const program = scene.shaderManager.getProgram("depth-map");
        gl.useProgram(program);

        gl.enable(gl.DEPTH_TEST);
        
        // Atualiza as matrizes de visualização/projeção da luz
        this.updateLightMatrices();

        // Vincula o shadow map
        this.shadowMap.bind();

        // Limpa o buffer de profundidade
        gl.clear(gl.DEPTH_BUFFER_BIT);

        // Envia as matrizes de projeção e visualização da luz para o shader
        const uLightProjectionMatrix = gl.getUniformLocation(program, 'uLightViewProjectionMatrix');
        gl.uniformMatrix4fv(uLightProjectionMatrix, false, this.lightSpaceMatrix);

        // Desenha os modelos da cena do ponto de vista da luz (para gerar o shadow map)
        for (let model of scene.models) {
            model.depthDraw(this.lightViewMatrix, this.lightProjectionMatrix);  // Renderiza para o depth map
        }

        // Desvincula o shadow map
        this.shadowMap.unbind();
    }

    /**
     * Configura o quad para debug do shadow map.
     */
    setupDebugQuad() {
        if (this.debugQuadVAO) return; // Se já estiver configurado, não faça de novo.

        const quadVertices = new Float32Array([
            // Posição   // TexCoord
            -1.0,  1.0,  0.0, 1.0,
            -1.0, -1.0,  0.0, 0.0,
             1.0,  1.0,  1.0, 1.0,
             1.0, -1.0,  1.0, 0.0,
        ]);

        this.debugQuadVAO = gl.createVertexArray();
        this.debugQuadVBO = gl.createBuffer();

        gl.bindVertexArray(this.debugQuadVAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.debugQuadVBO);
        gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 4 * 4, 0);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 4 * 4, 2 * 4);

        gl.bindVertexArray(null);
    }

    /**
     * Renderiza o depth map em um quad para debug.
     */
    drawDebugQuad(nearPlane, farPlane) {
        if (!this.debugQuadVAO) {
            this.setupDebugQuad();
        }

        if (!this.debugProgram) {
            // Criar e compilar o programa shader de debug (com o shader fornecido no exemplo)
            this.debugProgram = scene.shaderManager.getProgram("quad-shadow");
        }

        gl.useProgram(this.debugProgram);

        // Configurar os uniformes
        const uDepthMap = gl.getUniformLocation(this.debugProgram, 'depthMap');
        const uNearPlane = gl.getUniformLocation(this.debugProgram, 'near_plane');
        const uFarPlane = gl.getUniformLocation(this.debugProgram, 'far_plane');

        gl.uniform1f(uNearPlane, nearPlane);
        gl.uniform1f(uFarPlane, farPlane);

        // Bind do shadow map ao slot de textura
        this.shadowMap.bindTexture(0);
        gl.uniform1i(uDepthMap, 0);

        // Renderiza o quad
        gl.bindVertexArray(this.debugQuadVAO);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.bindVertexArray(null);
    }
}
