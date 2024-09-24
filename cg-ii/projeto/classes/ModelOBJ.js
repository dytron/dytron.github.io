class Geometry {
    constructor() {
        this.positions = [];
        this.texcoords = [];
        this.normals = [];
        this.tangents = [];
        this.colors = [];
    }
}

export class ModelOBJ {
    constructor(name) {
        this.name = name;
        this.geometries = [];
        this.materialLibs = [];
        this.url = "";
    }

    async load(url) {
        const response = await fetch(url);
        const text = await response.text();
        this.parse(text);
        this.url = url;
        
        console.log("Obj carregado: " + url);
    }
    async loadFromName() {
        return this.load(`./models/${this.name}.obj`);
    }
    newGeometry(material, group) {
        const geometry = new Geometry();
        geometry.material = material || 'default';
        geometry.group = group || 'default';
        this.geometries.push(geometry);
        return geometry;
    }

    parse(text) {
        const objPositions = [[0, 0, 0]];
        const objTexcoords = [[0, 0]];
        const objNormals = [[0, 0, 0]];
        const objColors = [[0, 0, 0]];
    
        const objVertexData = [
            objPositions,
            objTexcoords,
            objNormals,
            objColors,
        ];
    
        let currentGeometry = this.newGeometry();
    
        // Função para adicionar vértice
        const addVertex = (vert) => {
            const ptn = vert.split('/');
            const indices = ptn.map((objIndexStr, i) => {
                if (!objIndexStr) return undefined;
                const objIndex = parseInt(objIndexStr);
                return objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
            });
    
            indices.forEach((index, i) => {
                if (index !== undefined) {
                    switch (i) {
                        case 0: currentGeometry.positions.push(...objVertexData[i][index]); break;
                        case 1: currentGeometry.texcoords.push(...objVertexData[i][index]); break;
                        case 2: currentGeometry.normals.push(...objVertexData[i][index]); break;
                        case 3: currentGeometry.colors.push(...objVertexData[i][index]); break;
                    }
                }
            });
        };
    
        const keywords = {
            v: (parts) => {
                if (parts.length > 3) {
                    objPositions.push(parts.slice(0, 3).map(parseFloat));
                    objColors.push(parts.slice(3).map(parseFloat));
                } else {
                    objPositions.push(parts.map(parseFloat));
                }
            },
            vt: (parts) => {
                objTexcoords.push(parts.slice(0, 2).map(parseFloat));
            },
            vn: (parts) => {
                objNormals.push(parts.slice(0, 3).map(parseFloat));
            },
            f: (parts) => {
                const numTriangles = parts.length - 2;
                for (let tri = 0; tri < numTriangles; ++tri) {
                    addVertex(parts[0]);
                    addVertex(parts[tri + 1]);
                    addVertex(parts[tri + 2]);
                }
            },
            mtllib: (parts) => {
                this.materialLibs.push(parts.join(' '));
            },
            usemtl: (parts) => {
                currentGeometry = this.newGeometry(parts.join(' '), currentGeometry.group);
            },
            g: (parts) => {
                currentGeometry = this.newGeometry(currentGeometry.material, parts.join(' '));
            },
        };
    
        const lines = text.split('\n');
        for (const line of lines) {
            const [keyword, ...parts] = line.trim().split(/\s+/);
            const handler = keywords[keyword];
            if (handler) handler.call(this, parts);
        }
    
        this.geometries = this.geometries.filter(geometry => geometry.positions.length > 0);
        // Atualize dados da geometria
        this.geometries.forEach(geometry => {
            geometry.tangents = this.generateTangents(geometry);
        });
    }
    
    computeFaceNormal(v1, v2, v3) {
        if (!v1 || !v2 || !v3) {
            console.error("Invalid vertices for normal calculation", { v1, v2, v3 });
            return [0, 0, 0];
        }
        const edge1 = v2.map((coord, i) => coord - v1[i]);
        const edge2 = v3.map((coord, i) => coord - v1[i]);
        const normal = [
            edge1[1] * edge2[2] - edge1[2] * edge2[1],
            edge1[2] * edge2[0] - edge1[0] * edge2[2],
            edge1[0] * edge2[1] - edge1[1] * edge2[0],
        ];
        const length = Math.sqrt(normal.reduce((sum, val) => sum + val * val, 0));
        return normal.map(coord => (length > 0 ? coord / length : 0));
    }
    
    updateNormals() {
        this.geometries.forEach(geometry => {
            const numVertices = geometry.positions.length / 3;
            const normals = new Array(numVertices).fill(0).map(() => [0, 0, 0]);
    
            // Para cada triângulo, calcule a normal e adicione às normais dos vértices envolvidos
            for (let i = 0; i < geometry.indices.length; i += 3) {
                const i1 = geometry.indices[i];
                const i2 = geometry.indices[i + 1];
                const i3 = geometry.indices[i + 2];
    
                const v1 = geometry.positions.slice(i1 * 3, i1 * 3 + 3);
                const v2 = geometry.positions.slice(i2 * 3, i2 * 3 + 3);
                const v3 = geometry.positions.slice(i3 * 3, i3 * 3 + 3);
    
                const normal = this.computeFaceNormal(v1, v2, v3);
    
                // Adiciona a normal da face a cada vértice envolvido
                [i1, i2, i3].forEach(index => {
                    normals[index] = normals[index].map((val, idx) => val + normal[idx]);
                });
            }
    
            // Normaliza as normais acumuladas para suavizar
            geometry.normals = normals.map(normal => {
                const length = Math.sqrt(normal.reduce((sum, val) => sum + val * val, 0));
                return normal.map(coord => (length > 0 ? coord / length : 0));
            }).flat();
        });
    }
    
    makeIndexIterator(indices) {
        let ndx = 0;
        const fn = () => indices[ndx++];
        fn.reset = () => { ndx = 0; };
        fn.numElements = indices.length;
        return fn;
    }
    makeUnindexedIterator(positions) {
        let ndx = 0;
        const fn = () => ndx++;
        fn.reset = () => { ndx = 0; };
        fn.numElements = positions.length / 3;
        return fn;
    }
    generateTangents(geometry) {
        const getNextIndex = geometry.indices ? this.makeIndexIterator(geometry.indices) : this.makeUnindexedIterator(geometry.positions);
        const numFaceVerts = getNextIndex.numElements;
        const numFaces = numFaceVerts / 3;

        const tangents = [];
        for (let i = 0; i < numFaces; ++i) {
            const n1 = getNextIndex();
            const n2 = getNextIndex();
            const n3 = getNextIndex();

            const p1 = geometry.positions.slice(n1 * 3, n1 * 3 + 3);
            const p2 = geometry.positions.slice(n2 * 3, n2 * 3 + 3);
            const p3 = geometry.positions.slice(n3 * 3, n3 * 3 + 3);

            const uv1 = geometry.positions.slice(n1 * 2, n1 * 2 + 2);
            const uv2 = geometry.positions.slice(n2 * 2, n2 * 2 + 2);
            const uv3 = geometry.positions.slice(n3 * 2, n3 * 2 + 2);

            const dp12 = p2.map((coord, i) => coord - p1[i]);
            const dp13 = p3.map((coord, i) => coord - p1[i]);

            const duv12 = this.subtractVector2(uv2, uv1);
            const duv13 = this.subtractVector2(uv3, uv1);

            const f = 1.0 / (duv12[0] * duv13[1] - duv13[0] * duv12[1]);
            const tangent = Number.isFinite(f)
                ? dp12.map((coord, i) => f * (duv13[1] * coord - duv12[1] * dp13[i]))
                : [1, 0, 0];

            tangents.push(...tangent, ...tangent, ...tangent);
        }

        return tangents;
    }

    subtractVector2(a, b) {
        return a.map((v, ndx) => v - b[ndx]);
    }

    isLoaded() {
        return this.geometries.length > 0 && this.geometries[0].positions.length > 0;
    }
}
