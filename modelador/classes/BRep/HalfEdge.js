class HalfEdge extends BRepNode {
    constructor(where) {
        super();
        this.edge = null;
        this.vertex = null;
        this.loop = null;
        this.prev = null;
        this.next = this;
        if (where) {
            this.addList(where);
        }
    }
    addList(where) {
        this.addNext(where.halfEdge);
        if (!this.prev)
            this.prev = this;
        where.halfEdge = this;
        this.loop = where;
    }
    add(edge, vtx, sign) {
        let halfEdge;
        if (this.edge == null) {
            halfEdge = this;
        } else {
            halfEdge = new HalfEdge();
            this.prev.next = halfEdge;
            halfEdge.prev = this.prev;
            this.prev = halfEdge;
            halfEdge.next = this;
        }
        halfEdge.edge = edge;
        halfEdge.vertex = vtx;
        halfEdge.loop = this.loop;
        if (sign > 0) {
            edge.halfEdge1 = halfEdge;
        } else {
            edge.halfEdge2 = halfEdge;
        }
        return halfEdge;
    }
    del() {
        if (this.edge == null) {
            return null;
        }
        if (this.next == this) {
            this.edge = null;
            return this;
        }
        this.prev.next = this.next;
        this.next.prev = this.prev;
        return this.prev;
    }
}