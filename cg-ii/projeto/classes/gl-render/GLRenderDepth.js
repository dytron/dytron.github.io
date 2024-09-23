import { GLRenderBuffer } from "./GLRenderBuffer.js";

export class GLRenderDepth extends GLRenderBuffer {
    constructor(gl, textureType) {
        super(gl, textureType);
    }

    /**
     * Inicializa o buffer de profundidade.
     */
    initialize(depthComparisonTexture, width, height) {
        const gl = this.gl;
        const prevBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
        this.prevBufferID = prevBuffer;
        this.generateBuffer();
    
        if (depthComparisonTexture) {
            // Usado para shadow mapping com comparação de profundidade
            gl.texParameteri(this.textureType, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
            gl.texParameteri(this.textureType, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
        } else {
            // Usado para debug com sampler2D normal
            gl.texParameteri(this.textureType, gl.TEXTURE_COMPARE_MODE, gl.NONE);
        }

        gl.texParameteri(this.textureType, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(this.textureType, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        // Configuração de clamping para as bordas
        gl.texParameteri(this.textureType, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(this.textureType, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Vincular a textura de profundidade ao frame buffer
        if (this.textureType !== gl.TEXTURE_CUBE_MAP) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, this.textureType, this.texture, 0);
        }
    
        gl.drawBuffers([gl.NONE]);  // Nenhum buffer de cor
        gl.readBuffer(gl.NONE);     // Não estamos lendo do buffer de cores
        gl.bindFramebuffer(gl.FRAMEBUFFER, prevBuffer);
    
        this.resize(width, height);
        return this.isReady();
    }
    

    /**
     * Redimensiona o buffer de profundidade.
     */
    resize(width, height) {
        const gl = this.gl;
    
        const depthFormat = gl.DEPTH_COMPONENT32F;  // Formato de profundidade com ponto flutuante de 32 bits
    
        if (this.textureType === gl.TEXTURE_CUBE_MAP) {
            for (let i = 0; i < 6; ++i) {
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, depthFormat, width, height, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);
            }
        } else {
            // Para texturas 2D (shadow map)
            gl.bindTexture(this.textureType, this.texture);
            gl.texImage2D(this.textureType, 0, depthFormat, width, height, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);
        }
    
        this.setSize(width, height);
        return this.isComplete();
    }
    
}
export class GLRenderDepth2D extends GLRenderDepth {
    constructor(gl) {
        super(gl, gl.TEXTURE_2D);
    }
}
