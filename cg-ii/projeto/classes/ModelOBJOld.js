export class ModelOBJOld {
    constructor(name) {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = []; // Novo array para armazenar coordenadas de textura
        this.loaded = false;
        this.name = name;
    }

    async load(url) {
        const response = await fetch(url);
        const text = await response.text();
        this.parse(text);
    }

    computeFaceNormal(v1, v2, v3) {
        const edge1 = v2.map((coord, i) => coord - v1[i]);
        const edge2 = v3.map((coord, i) => coord - v1[i]);
        const normal = [
            edge1[1] * edge2[2] - edge1[2] * edge2[1],
            edge1[2] * edge2[0] - edge1[0] * edge2[2],
            edge1[0] * edge2[1] - edge1[1] * edge2[0],
        ];
        const length = Math.sqrt(normal.reduce((sum, val) => sum + val * val, 0));
        return normal.map(coord => coord / length);
    }

    updateNormals() {
        this.normals.forEach(normal => normal.fill(0));

        // Computar normais para cada face
        for (let i = 0; i < this.indices.length; i += 3) {
            const i1 = this.indices[i];
            const i2 = this.indices[i + 1];
            const i3 = this.indices[i + 2];

            const v1 = this.vertices[i1];
            const v2 = this.vertices[i2];
            const v3 = this.vertices[i3];

            const normal = this.computeFaceNormal(v1, v2, v3);

            // Acumular normal da face em cada normal de vértice
            [i1, i2, i3].forEach(index => {
                this.normals[index] = this.normals[index].map((val, idx) => val + normal[idx]);
            });
        }

        // Normalizar as normais acumuladas
        this.normals = this.normals.map(normal => {
            const length = Math.sqrt(normal.reduce((sum, val) => sum + val * val, 0));
            return normal.map(coord => coord / length);
        });
    }

    parse(text) {
        const vertices = [];
        const indices = [];
        const texCoords = []; // Armazena temporariamente as coordenadas de textura
        const parsedTexCoords = []; // Armazena as coordenadas de textura para cada vértice

        const lines = text.split('\n');

        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            const type = parts.shift();

            if (type === 'v') {
                // Vertices
                const vertex = parts.map(parseFloat);
                vertices.push(vertex);
            } else if (type === 'vt') {
                // Coordenadas de textura
                const texCoord = parts.map(parseFloat);
                texCoords.push(texCoord);
            } else if (type === 'f') {
                // Faces
                const face = parts.map(part => {
                    const indices = part.split('/').map(str => (str ? parseInt(str) - 1 : -1));
                    if (indices[1] !== -1) {
                        parsedTexCoords[indices[0]] = texCoords[indices[1]];
                    }
                    return indices[0];
                });
                for (let i = 1; i < face.length - 1; i++) {
                    indices.push(face[0], face[i], face[i + 1]);
                }
            }
        });

        // Define os dados processados
        this.vertices = vertices;
        this.indices = indices;
        this.normals = new Array(vertices.length).fill(0).map(() => [0, 0, 0]);
        this.texCoords = parsedTexCoords.map(tc => tc || [0, 0]); // Garante que cada vértice tenha uma coordenada de textura

        this.loaded = true;

        // Atualiza as normais
        this.updateNormals();
    }

    isLoaded() {
        return this.loaded;
    }

    print() {
        console.log(this);
    }
}
