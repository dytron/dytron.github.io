class CSGColor extends CSGTree {
    constructor(child, r, g, b) {
        super(child);
        this.fill = color(r, g, b);
        this.description = `COLOR(${r},${g},${b},`;
    }
    hasPoint(point) {
        return this.left.hasPoint(point);
    }
    draw() {
        push();
        this.drawChildren();
        pop();
    }
}