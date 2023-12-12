class SolidObject extends Primitive {
    constructor(input) {
        super();
        this.strokeWeight = 0.5;
        this.type = "solid";
        this.solid = Solid.parseMesh(input);
        this.area = this.solid.calculateArea();
    }
    setName(name) {
        this.name = name;
        return this;
    }
    draw() {
        super.draw();
        push();
        this.solid.draw();
        pop();
    }
    static generateIcosphereInput() {
        return `VERTICES
v0: -1.0, 1.61803398875, 0.0
v1: 1.0, 1.61803398875, 0.0
v2: -1.0, -1.61803398875, 0.0
v3: 1.0, -1.61803398875, 0.0
v4: 0.0, -1.0, 1.61803398875
v5: 0.0, 1.0, 1.61803398875
v6: 0.0, -1.0, -1.61803398875
v7: 0.0, 1.0, -1.61803398875
v8: 1.61803398875, 0.0, -1.0
v9: 1.61803398875, 0.0, 1.0
v10: -1.61803398875, 0.0, -1.0
v11: -1.61803398875, 0.0, 1.0

FACES
f0: v0, v11, v5
f1: v0, v5, v1
f2: v0, v1, v7
f3: v0, v7, v10
f4: v0, v10, v11
f5: v1, v5, v9
f6: v5, v11, v4
f7: v11, v10, v2
f8: v10, v7, v6
f9: v7, v1, v8
f10: v3, v9, v4
f11: v3, v4, v2
f12: v3, v2, v6
f13: v3, v6, v8
f14: v3, v8, v9
f15: v4, v9, v5
f16: v2, v4, v11
f17: v6, v2, v10
f18: v8, v6, v7
f19: v9, v8, v1

NORMALIZE
SCALE: 100, 100, 100
`
    }
    static generateBoxInput() {
        return `VERTICES
v0: 0, 0, 0
v1: 1, 0, 0
v2: 1, 1, 0
v3: 0, 1, 0
v4: 0, 0, 1
v5: 1, 0, 1
v6: 1, 1, 1
v7: 0, 1, 1

FACES
f0: v2, v1, v0
f1: v3, v2, v0
f2: v4, v5, v6
f3: v4, v6, v7
f4: v0, v4, v7
f5: v0, v7, v3
f6: v6, v5, v1
f7: v2, v6, v1
f8: v0, v1, v5
f9: v0, v5, v4
f10: v7, v6, v2
f11: v3, v7, v2

SCALE: 100, 100, 100
`;
    }
}