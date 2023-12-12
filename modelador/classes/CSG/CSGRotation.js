class CSGRotation extends CSGTree {
    constructor(child, x, y, z) {
        super(child);
        this.rotation = new Point(x, y, z);
        this.description = `ROTATION(${degrees(x)},${degrees(y)},${degrees(z)},`;
    }
    hasPoint(point) {
        return this.left.hasPoint(point.rotateX(-this.rotation.x).rotateY(-this.rotation.y).rotateZ(-this.rotation.z));
    }
    draw() {
        push();
        rotateX(this.rotation.x);
        rotateY(this.rotation.y);
        rotateZ(this.rotation.z);
        this.drawChildren();
        pop();
    }
}