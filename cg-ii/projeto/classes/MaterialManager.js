export class MaterialManager {
    constructor() {
        this.textures = new Map();  // Armazena texturas carregadas
        this.materials = new Map(); // Armazena materiais carregados
        this.defaultTextures = {};
    }
    init() {
        this.defaultTextures = {
            black: this.create1PixelTexture(gl, [0, 0, 0, 255]),
            white: this.create1PixelTexture(gl, [255, 255, 255, 255]),
            normal: this.create1PixelTexture(gl, [128, 128, 255, 255])
        }
    }
    getDefaultMaterial() {
        return {
            mapAmbient: this.defaultTextures.white,
            mapDiffuse: this.defaultTextures.white,
            mapSpecular: this.defaultTextures.white,
            mapNormal: this.defaultTextures.normal,
            mapDisplacement: this.defaultTextures.black,
            ambient: [1, 1, 1],
            diffuse: [1, 1, 1],
            specular: [1, 1, 1],
            emissive: [0, 0, 0],
            shininess: 400,
        };
    }
    create1PixelTexture(gl, pixel) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                      new Uint8Array(pixel));
        return texture;
    }
    loadTexture(url) {
        if (this.textures.has(url)) {
            return this.textures.get(url); // Retorna a textura já carregada
        }

        const texture = this.create1PixelTexture(gl, [128, 192, 255, 255]);

        const image = new Image();
        image.onload = () => {
            console.log("Textura carregada: " + url);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);

            if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
        };

        image.src = url;

        this.textures.set(url, texture);
        return texture;
    }

    async loadMtl(url) {
        // Extrai o baseUrl removendo o nome do arquivo e a extensão .mtl
        const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
        
        // Verifica se os materiais já estão carregados
        if (this.materials.has(url)) {
            return this.materials.get(url); // Retorna o material já carregado
        }
    
        // Define materiais padrão
        let materials = { DEFAULT : this.getDefaultMaterial() } ;
    
        try {
            // Tenta carregar o arquivo .mtl
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erro ao carregar ${url}`); // Gera erro caso não seja possível carregar
            }
            // Parseia o conteúdo do arquivo .mtl
            const mtlText = await response.text();
            materials = this.parseMtl(mtlText, baseUrl);
        } catch (err) {
            // Em caso de erro, utiliza os materiais padrão
            console.log(`${url} não encontrado, usando texturas padrões.`);
        }
    
        // Armazena os materiais (seja os carregados ou os padrões) no cache
        this.materials.set(url, materials);
        return materials;
    }
    

    parseMtl(mtlText, baseUrl) {
        const materials = {};
        const lines = mtlText.split("\n");
        let currentMaterial = null;

        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            const keyword = parts[0];
            const values = parts.slice(1);

            switch (keyword) {
                case "newmtl":
                    currentMaterial = this.getDefaultMaterial();
                    materials[values[0]] = currentMaterial;
                    break;
                case "Ns":
                    currentMaterial.shininess = parseFloat(values[0]);
                    break;
                case "Ka":
                    currentMaterial.ambient = values.map(parseFloat);
                    break;
                case "Kd":
                    currentMaterial.diffuse = values.map(parseFloat);
                    break;
                case "Ks":
                    currentMaterial.specular = values.map(parseFloat);
                    break;
                case "Ke":
                    currentMaterial.emissive = values.map(parseFloat);
                    break;
                case "map_Ka":
                    currentMaterial.mapAmbient = this.loadTexture(`${baseUrl}/${values[0]}`);
                    break;
                case "map_Kd":
                    currentMaterial.mapDiffuse = this.loadTexture(`${baseUrl}/${values[0]}`);
                    break;
                case "map_Ks":
                    currentMaterial.mapSpecular = this.loadTexture(`${baseUrl}/${values[0]}`);
                    break;
                case "map_Bump":
                    currentMaterial.mapNormal = this.loadTexture(`${baseUrl}/${values[0]}`);
                    break;
                case "map_Disp":
                    currentMaterial.mapDisplacement = this.loadTexture(`${baseUrl}/${values[0]}`);
                    break;
            }
        });

        return materials;
    }

    isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }

    getMaterial(url) {
        return this.materials.get(url);
    }
}
