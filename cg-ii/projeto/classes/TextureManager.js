export class TextureManager {
    constructor() {
        this.textures = {};
    }
    // Método para carregar um cubemap
    loadCubeMap(name, orientations = ["posx", "negx", "posy", "negy", "posz", "negz"]) {
        if (name in this.textures) return;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

        const faceInfos = orientations.map((orientation, i) => ({
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
            url: `./cubemaps/${name}/${orientation}.png`,
        }));

        // Preencher temporariamente cada face com uma cor enquanto as imagens são carregadas
        faceInfos.forEach((faceInfo) => {
            const { target } = faceInfo;
            gl.texImage2D(target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
        });

        let loadedImages = 0; // Contador de imagens carregadas

        // Carregar as imagens do cubemap
        faceInfos.forEach((faceInfo) => {
            const { target, url } = faceInfo;
            const image = new Image();
            image.src = url;

            image.onload = () => {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

                loadedImages++;

                console.log("Textura carregada: " + url)
                // Se todas as 6 faces estiverem carregadas, gerar mipmap
                if (loadedImages === 6) {
                    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                }
            };

            image.onerror = () => {
                console.error(`Failed to load cubemap texture from ${url}`);
            };
        });

        // Definir os parâmetros de textura
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

        this.textures[name] = texture;
    }

    // Retorna uma textura pelo nome
    getTexture(name) {
        return this.textures[name];
    }
}
