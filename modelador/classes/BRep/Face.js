class Face extends BRepNode {
    constructor(where) {
        super();
        this.id = null;
        this.solid = null;
        this.loop = null;
        this.loops = null;
        this.feq = null;
        this.next = null;
        this.prev = null;
        this.addList(where);
    }
    addList(where) {
        this.addNext(where.faces);
        where.faces = this;
        this.solid = where;
        this.id = where.faceID++;
    }
}