class CSGIntersection extends CSGTree {
    constructor(left, right) {
        super(left, right);
        this.description = "INTERSECTION(";
    }
    hasPoint(point) {
       return this.left.hasPoint(point) && this.right.hasPoint(point);
    }
}