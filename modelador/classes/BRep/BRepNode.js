class BRepNode {
    constructor() {

    }
    addList(where) {
       
    }
    addNext(what) {
        this.next = what;
        this.prev = null;
        if (what) {
            what.prev = this;
        }
    }
}
BRepNode.firstSolid = null;