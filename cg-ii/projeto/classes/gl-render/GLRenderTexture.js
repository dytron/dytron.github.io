import { GLRenderBuffer } from "./GLRenderBuffer.js";

export class GLRenderTexture extends GLRenderBuffer {
    constructor(gl, textureType) {
        super(gl, textureType);
    }

    initialize(useDepthBuffer, numChannels, width, height) {
        const gl = this.gl;
        const prevBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
        this.prevBufferID = prevBuffer;
        // Gera o framebuffer e a textura
        this.generateBuffer();
    
        // Cria e configura o depth buffer, se necessário
        if (useDepthBuffer) {
            this.depthbufferID = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthbufferID);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height); // Definindo o tamanho do depth buffer
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthbufferID);
        }
    
        // Configura a textura com o tamanho correto
        gl.bindTexture(this.textureType, this.texture);
        const format = this.getTextureFormat(numChannels);
        gl.texImage2D(this.textureType, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, null);
        
        // Vincula a textura ao framebuffer
        if (this.textureType !== gl.TEXTURE_CUBE_MAP) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, this.textureType, this.texture, 0);
        }
    
        gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, prevBuffer);
        this.resize(numChannels, width, height);
    
        return this.isReady();
    }
    
    /**
     * Redimensiona o buffer de renderização.
     */
    resize(numChannels, width, height) {
        const gl = this.gl;
        const format = this.getTextureFormat(numChannels);

        if (this.textureType === gl.TEXTURE_CUBE_MAP) {
            for (let i = 0; i < 6; ++i) {
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, format, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            }
        } else {
            gl.bindTexture(this.textureType, this.texture);
            gl.texImage2D(this.textureType, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, null);
        }

        if (this.depthbufferID) {
            gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthbufferID);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        }

        this.setSize(width, height);
        return this.isComplete();
    }

    /**
     * Obtém o formato de textura com base no número de canais.
     */
    getTextureFormat(numChannels) {
        const gl = this.gl;
        switch (numChannels) {
            case 1: return gl.LUMINANCE;
            case 2: return gl.LUMINANCE_ALPHA;
            case 3: return gl.RGB;
            case 4: return gl.RGBA;
            default: return gl.RGBA;
        }
    }
}
export class GLRenderTexture2D extends GLRenderTexture {
    constructor(gl) {
        super(gl, gl.TEXTURE_2D)
    }
}