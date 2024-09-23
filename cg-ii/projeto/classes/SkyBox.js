export class SkyBox {
    constructor(camera, textureManager) {
        this.program = null;
        this.camera = camera;
        this.textureManager = textureManager;
        this.textureName = "";

        // Localizações dos uniformes
        this.skyboxLocation = null;
        this.viewDirectionProjectionInverseLocation = null;

        // Localização do atributo para as posições
        this.positionLocation = null;

        // Buffer para as posições do cubo
        this.positionBuffer = null;

        // Posições do cubo
        this.positions = new Float32Array([
            // Frente
            -1, -1,  1,
             1, -1,  1,
            -1,  1,  1,
            -1,  1,  1,
             1, -1,  1,
             1,  1,  1,

            // Trás
            -1, -1, -1,
            -1,  1, -1,
             1, -1, -1,
            -1,  1, -1,
             1,  1, -1,
             1, -1, -1,

            // Topo
            -1,  1, -1,
            -1,  1,  1,
             1,  1, -1,
            -1,  1,  1,
             1,  1,  1,
             1,  1, -1,

            // Fundo
            -1, -1, -1,
             1, -1, -1,
            -1, -1,  1,
            -1, -1,  1,
             1, -1, -1,
             1, -1,  1,

            // Direita
             1, -1, -1,
             1,  1, -1,
             1, -1,  1,
             1,  1, -1,
             1,  1,  1,
             1, -1,  1,

            // Esquerda
            -1, -1, -1,
            -1, -1,  1,
            -1,  1, -1,
            -1, -1,  1,
            -1,  1,  1,
            -1,  1, -1
        ]);
        this.skyboxTexture = null;
    }

    setTextureName(textureName) {
        this.textureName = textureName;
    }

    // Inicializa a skybox, configurando os uniformes e atributos
    init(program) {
        this.program = program;

        // Localizações dos uniformes
        this.skyboxLocation = gl.getUniformLocation(this.program, "uSkybox");
        this.viewDirectionProjectionInverseLocation = gl.getUniformLocation(this.program, "uViewDirectionProjectionInverse");

        // Localização do atributo para as posições
        this.positionLocation = gl.getAttribLocation(this.program, "aPosition");

        // Criar buffer para posições do cubo
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);
    }

    // Configura a matriz de projeção e câmera
    updateCamera(skyboxTexture) {
        gl.useProgram(this.program);

        // Configuração da projeção usando mat4
        const projectionMatrix = mat4.create();
        const viewMatrix = mat4.create();

        this.camera.apply(viewMatrix, projectionMatrix);
        // Remover translação, mantendo apenas a direção
        viewMatrix[12] = 0;
        viewMatrix[13] = 0;
        viewMatrix[14] = 0;

        // Matriz de projeção e direção da visualização
        const viewDirectionProjectionMatrix = mat4.create();
        mat4.multiply(viewDirectionProjectionMatrix, projectionMatrix, viewMatrix);

        // Inversa da matriz de direção de projeção
        const viewDirectionProjectionInverseMatrix = mat4.create();
        mat4.invert(viewDirectionProjectionInverseMatrix, viewDirectionProjectionMatrix);

        // Atualizar uniformes no shader
        gl.uniformMatrix4fv(this.viewDirectionProjectionInverseLocation, false, viewDirectionProjectionInverseMatrix);

        // Ativar o skybox (unidade de textura 0)
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        gl.uniform1i(this.skyboxLocation, 0);
    }

    // Renderiza o skybox
    render() {
        if (!this.program) return;

        // Verifica se a textura da skybox está carregada
        const skyboxTexture = this.textureManager.getTexture(this.textureName);
        this.skyboxTexture = skyboxTexture;
        if (!skyboxTexture) {
            return;
        }

        // Desativar o depth buffer para garantir que a skybox seja desenhada no fundo
        gl.depthFunc(gl.LEQUAL);

        // Atualizar a câmera e preparar para renderização
        this.updateCamera(skyboxTexture);

        // Vincular o buffer de posição e configurar o atributo
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        const size = 3; // 3 componentes por vértice (x, y, z)
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.vertexAttribPointer(this.positionLocation, size, type, normalize, stride, offset);
        gl.enableVertexAttribArray(this.positionLocation);

        // Desenhar o cubo (36 vértices, 12 triângulos)
        gl.drawArrays(gl.TRIANGLES, 0, 36);

        gl.depthFunc(gl.LESS);
    }
}
