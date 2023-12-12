class Solid extends BRepNode {
    constructor(where) {
        super();
        this.id = null;
        this.faces = null;
        this.edges = null;
        this.vertex = null;
        this.next = null;
        this.prev = null;
        this.faceID = 0;
        this.vertexID = 0;
        this.edgeID = 0;
        this.addList(where);
        this.normals = [];
    }
    calculateNormals() {
        let halfEdge;
        let loop;
        let face = this.faces;
        while (face) {
            loop = face.loops;
            while (loop) {
                halfEdge = loop.halfEdge;
                let v1 = halfEdge.vertex;
                let v2 = halfEdge.next.vertex;
                let v3 = halfEdge.next.next.vertex;
                let A = v2.point.sub(v1.point);
                let B = v3.point.sub(v1.point);
                this.normals.push(A.cross(B).normalize().mul(-1));
                loop = loop.next;
            }
            face = face.next;
        }
    }
    addList(where) {
        this.addNext(where);
        //BRepNode.firstSolid = this;
    }
    print() {
        this.forEach((face)=>{
            console.log(`Face ${face.id}`);
        },()=>{
            console.log("Loop");
        },(vtx)=>{
            console.log(`v${vtx.id}: (${vtx.point.x}, ${vtx.point.y}, ${vtx.point.z})`);
        },()=>{
            console.log("");
        });
    }
    draw() {
        if (!this.normals.length) {
            this.calculateNormals();
        }
        let i = 0;
        this.forEach((face)=>{},()=>{
            let N = this.normals[i++];
            normal(N.x, N.y, N.z);
            beginShape();
        },(vtx)=>{
            vertex(vtx.point.x, vtx.point.y, vtx.point.z);
        },()=>{
            endShape(CLOSE);
        });
    }
    calculateArea() {
        let halfEdge;
        let loop;
        let face = this.faces;
        let area = 0;
        while (face) {
            loop = face.loops;
            while (loop) {
                halfEdge = loop.halfEdge;
                let v1 = halfEdge.vertex;
                let v2 = halfEdge.next.vertex;
                let v3 = halfEdge.next.next.vertex;
                area += this.calculateFaceArea(v1.point, v2.point, v3.point);
                loop = loop.next;
            }
            face = face.next;
        }
        return area;
    }
    calculateFaceArea(v1, v2, v3) {
        const A = v2.sub(v1);
        const B = v3.sub(v1);
        return A.cross(B).magnitude() / 2;        
    }
    forEach(faceFunction, loopFunction, vertexFunction, loopEnd) {
        let halfEdge;
        let loop;
        let face = this.faces;
        let vtx;
        while (face) {
            faceFunction(face);
            loop = face.loops;
            while (loop) {
                loopFunction();
                halfEdge = loop.halfEdge;
                do {
                    vtx = halfEdge.vertex;
                    vertexFunction(vtx);
                    halfEdge = halfEdge.next;
                } while (halfEdge != loop.halfEdge);
                loopEnd();
                loop = loop.next;
            }
            face = face.next;
        }
    }
    /*
    static subdivide(vertices, faces) {
        let newVertices = vertices.map(v => new Point(v.x, v.y, v.z));
        let newFaces = faces.map(f => [f[0], f[1], f[2]]);
        for (const f of faces) {
            let v0 = vertices[f[0]];
            let v1 = vertices[f[1]];
            let v2 = vertices[f[2]];
            
            let v3 = v0.add(v1).mul(0.5).normalize();
            let v4 = v1.add(v2).mul(0.5).normalize();
            let v5 = v2.add(v0).mul(0.5).normalize();

            let v0ID = f[0];
            let v1ID = f[1];
            let v2ID = f[2];
            let v3ID = vertices.length;
            vertices.push(v3);
            let v4ID = vertices.length;
            vertices.push(v4);
            let v5ID = vertices.length;
            vertices.push(v5);
            newFaces.push([v0ID, v3ID, v5ID]);
            newFaces.push([v3ID, v1ID, v4ID]);
            newFaces.push([v4ID, v2ID, v5ID]);
            newFaces.push([v3ID, v4ID, v5ID]);
        }
    }*/
    static parseMesh(input) {
        const lines = input.split('\n');

        let section = 0;

        let vertices = [];
        const faces = [];
        
        let s = new Point(100, 100, 100);
        let t = new Point(0, 0, 0);
        let toNormalize = false;
        let subdivideCount = 0;
        for (const line of lines) {
            if (line.startsWith('VERTICES')) {
                section = 0;
            } else if (line.startsWith('FACES')) {
                section = 1;
            } else if (line.startsWith('NORMALIZE')) {
                toNormalize = true;
            } else if (line.trim() !== '') {
                const parts = line.split(':');
                const data = parts[1].trim().split(',').map(coord => coord.trim());
                if (line.startsWith("SCALE")) {
                    s = new Point(parseFloat(data[0]), parseFloat(data[1]), parseFloat(data[2]));
                } else if (line.startsWith("TRANSLATION")) {
                    t = new Point(parseFloat(data[0]), parseFloat(data[1]), parseFloat(data[2]));
                } else if (line.startsWith("SUBDIVIDE")) {
                    subdivideCount = parseInt(data[0]);
                }else if (section == 0) {
                    vertices.push(new Point(parseFloat(data[0]), parseFloat(data[1]), parseFloat(data[2])));
                } else if (section == 1) {
                    const vertexIndices = data.map(index => parseInt(index.substring(1)));
                    faces.push(vertexIndices);
                }
            }
        }
        while (subdivideCount > 0) {
            subdivideCount--;
            Solid.subdivide(vertices, faces);
            console.log("a");
        }        
        if (toNormalize) {
            vertices = vertices.map(v => v.normalize());    
        }
        vertices = vertices.map(v => new Point(v.x*s.x, v.y*s.y, v.z*s.z).add(t));
        return new Solid().createFromMesh(vertices, faces);
          
    }
    createFromMesh(vertices, triangles) {
        const Edges = {};
        let verts = vertices.map(v => new Vertex(this, new Point(v.x, v.y, v.z)));
        let faces = triangles.map(f => [f, new Face(this)]);
        let loops = faces.map(face => new Loop(face[1]));
        for (const face of faces) {
            let halfEdge = new HalfEdge(face[1].loops);
            for (let i = 0; i < 3; i++) {
                const u = verts[face[0][i]];
                const v = verts[face[0][(i + 1) % 3]];
                const oppositeHalfEdge = Edges[`${v.id}-${u.id}`]; 
                if (!oppositeHalfEdge) {
                    const edge = new Edge(this);
                    halfEdge = halfEdge.add(edge, u, 1);
                } else {
                    halfEdge = halfEdge.add(oppositeHalfEdge.edge, u, -1);
                }
                Edges[`${u.id}-${v.id}`] = halfEdge;
            }
        }
        return this;
    }
}