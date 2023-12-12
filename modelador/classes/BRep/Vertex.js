class Vertex extends BRepNode {
    constructor(where, point) {
        super();
        this.id = null;
        this.edge = null;
        this.point = point;
        this.next = null;
        this.prev = null;
        this.addList(where);
    }
    addList(where) {
        this.addNext(where.vertex);
        where.vertex = this;
        this.id = where.vertexID++;
    }
}