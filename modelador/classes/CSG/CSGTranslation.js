class CSGTranslation extends CSGTree {
    constructor(child, x, y, z) {
        super(child);
        this.translation = new Point(x, y, z);
        this.description = `TRANSLATION(${x},${y},${z},`;
    }
    hasPoint(point) {
        return this.left.hasPoint(point.sub(this.translation));
    }
    draw() {
        push();
        translate(this.translation.x, this.translation.y, this.translation.z);
        this.drawChildren();
        pop();
    }
}