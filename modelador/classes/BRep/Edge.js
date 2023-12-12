class Edge extends BRepNode {
    constructor(where) {
        super();
        this.id = null;
        this.halfEdge1 = null;
        this.halfEdge2 = null;
        this.next = null;
        this.prev = null;
        this.addList(where);
    }
    addList(where) {
        this.addNext(where.edges);
        where.edges = this;
        this.id = where.edgeID++;
    }
}