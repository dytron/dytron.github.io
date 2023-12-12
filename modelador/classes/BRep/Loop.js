class Loop extends BRepNode {
    constructor(where) {
        super();
        this.halfEdge = null;
        this.face = null;
        this.next = null;
        this.prev = null;
        this.addList(where);
    }
    addList(where) {
        this.addNext(where.loops);
        where.loops = this;
        this.face = where;
    }
}