class CSGTree extends Primitive {
    constructor(left, right) {
        super();
        this.strokeWeight = 0.5;
        this.type = "csgtree";
        this.left = left;
        this.right = right;
        this.children = [left, right];
        if (!this.right) {
            this.children = [left];
        }
    }
    setName(name) {
        this.name = name;
        return this;
    }
    setLeft(left) {
        this.left = left;
        return this;
    }
    setRight(right) {
        this.right = right;
        return this;
    }
    drawChildren() {
        // Só funciona corretamente com Union (e Fill ativado)
        if (this.left) {
            this.left.selected = this.selected;
            if (!(this.left instanceof CSGColor))
                this.left.fill = this.fill;
            this.left.draw();
        }
        if (this.right) {
            this.right.selected = this.selected;
            if (!(this.right instanceof CSGColor))
                this.right.fill = this.fill;
            this.right.draw();
        }
    }
    getDescription() {
        return "";
    }
    static parseCSGTree(input) {
        const parser = new CSGParser();
        return parser.parseExpression(input);
    }
    
    print() {
        const result = [];
        
        function traverse(node, depth) {
            if (node) {
                result.push('  '.repeat(depth) + node.description);
            }
            if (node instanceof CSGTree) {
                node.children.forEach((child, index) => {
                    traverse(child, depth + 1)
                    if (index < node.children.length - 1) {
                        result.push('  '.repeat(depth) + ',');
                      }
                });
                result.push('  '.repeat(depth) + ")");
            }
        }
        
        traverse(this, 0);
        return result.join('\n');
    }
    
    getMaxRadius() {
        return 200;
    }
    draw() {
        super.draw();
        this.drawChildren();
    }
}