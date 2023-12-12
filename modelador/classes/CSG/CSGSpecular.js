class CSGSpecular extends CSGTree {
    constructor(child, r, g, b) {
        super(child);
        this.specular = color(r, g, b);
        this.description = `SPECULAR(${r},${g},${b},`;
    }
    hasPoint(point) {
        return this.left.hasPoint(point);
    }
    draw() {
        push();
        specularMaterial(this.specular);
        this.drawChildren();
        pop();
    }
}