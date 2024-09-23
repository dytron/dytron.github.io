export class GLRenderBuffer {
    constructor(gl, textureType) {
        this.gl = gl;
        this.textureType = textureType;
        this.framebufferID = null;
        this.depthbufferID = null;
        this.texture = null;
        this.bufferWidth = 0;
        this.bufferHeight = 0;
        this.prevBufferID = null;
        this.prevViewport = [0, 0, 0, 0];
    }

    /**
     * Deleta o render buffer.
     */
    delete() {
        const gl = this.gl;
        if (this.framebufferID) gl.deleteFramebuffer(this.framebufferID);
        if (this.depthbufferID) gl.deleteRenderbuffer(this.depthbufferID);
        if (this.texture) gl.deleteTexture(this.texture);
        this.framebufferID = null;
        this.depthbufferID = null;
        this.texture = null;
    }

    /**
     * Retorna o ID do frame buffer.
     */
    getID() {
        return this.framebufferID;
    }

    /**
     * Verifica se o frame buffer está pronto.
     */
    isReady() {
        const gl = this.gl;
        return gl.isFramebuffer(this.framebufferID);
    }

    /**
     * Retorna o ID da textura.
     */
    getTextureID() {
        return this.texture;
    }

    /**
     * Vincula a textura à unidade de textura atual.
     */
    bindTexture(textureUnit = 0) {
        const gl = this.gl;
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(this.textureType, this.texture);
    }

    /**
     * Gera os níveis mipmap para a textura.
     */
    buildTextureMipmaps() {
        const gl = this.gl;
        gl.bindTexture(this.textureType, this.texture);
        gl.generateMipmap(this.textureType);
    }

    /**
     * Define o modo de wrapping da textura.
     */
    setTextureWrappingMode(wrapS, wrapT) {
        const gl = this.gl;
        gl.bindTexture(this.textureType, this.texture);
        if (wrapS) gl.texParameteri(this.textureType, gl.TEXTURE_WRAP_S, wrapS);
        if (wrapT) gl.texParameteri(this.textureType, gl.TEXTURE_WRAP_T, wrapT);
    }

    /**
     * Define o modo de filtragem da textura.
     */
    setTextureFilteringMode(magnificationFilter = 0, minificationFilter = 0) {
        const gl = this.gl;
        gl.bindTexture(this.textureType, this.texture);
        if (magnificationFilter) {
            gl.texParameteri(this.textureType, gl.TEXTURE_MAG_FILTER, magnificationFilter);
        }
        if (minificationFilter) {
            gl.texParameteri(this.textureType, gl.TEXTURE_MIN_FILTER, minificationFilter);
        }
    }

    /**
     * Vincula o frame buffer e ajusta o viewport.
     */
    bind() {
        const gl = this.gl;
        this.prevViewport = gl.getParameter(gl.VIEWPORT);
        this.prevBufferID = gl.getParameter(gl.FRAMEBUFFER_BINDING);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferID);
        gl.viewport(0, 0, this.bufferWidth, this.bufferHeight);
    }

    /**
     * Desvincula o frame buffer e restaura o viewport.
     */
    unbind() {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.prevBufferID);
        gl.viewport(...this.prevViewport);
    }

    /**
     * Verifica se o frame buffer está completo.
     */
    isComplete() {
        const gl = this.gl;
        const prevBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferID);
        const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
        gl.bindFramebuffer(gl.FRAMEBUFFER, prevBuffer);
        return complete;
    }

    /**
     * Gera o buffer de renderização e inicializa a textura.
     */
    generateBuffer() {
        const gl = this.gl;
        this.delete();
        this.framebufferID = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferID);
        this.texture = gl.createTexture();
        gl.bindTexture(this.textureType, this.texture);
        gl.texParameteri(this.textureType, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(this.textureType, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(this.textureType, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(this.textureType, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    /**
     * Define o tamanho do buffer.
     */
    setSize(width, height) {
        this.bufferWidth = width;
        this.bufferHeight = height;
    }
}
