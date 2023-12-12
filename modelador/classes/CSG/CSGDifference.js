class CSGDifference extends CSGTree {
    constructor(left, right) {
        super(left, right);
        this.description = "DIFFERENCE(";
    }
    hasPoint(point) {
        return this.left.hasPoint(point) && !this.right.hasPoint(point);
    }
}