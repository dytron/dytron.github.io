class CSGShine extends CSGTree {
    constructor(child, value) {
        super(child);
        this.shininess = value;
        this.description = `SHINE(${value},`;
    }
    hasPoint(point) {
        return this.left.hasPoint(point);
    }
    draw() {
        push();
        shininess(this.shininess);
        this.drawChildren();
        pop();
    }
}