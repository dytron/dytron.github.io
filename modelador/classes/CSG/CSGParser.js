class CSGParser {
    constructor() {
        this.primitiveClasses = {
            "BOX": Box,
            "SPHERE": Sphere,
            "CYLINDER": Cylinder,
            "CONE": Cone,
            "TORUS": Torus,
            "PYRAMID": Pyramid
        };
    }
    
    tokenize(expression) {
        return expression.replace(/\|/g, ',').split(/(\(|\)|,|\||\n)/).filter(token => token.trim() !== '');
    }
    
    isPrimitive(type) {
        return type in this.primitiveClasses;
    }

    parsePrimitive(type, tokens) {
        tokens.shift(); // Remove (
        let params = [];
        while (true) {
            let token = tokens.shift();
            if (token === ")") {
                break;
            }
            if (token !== ",") {
                params.push(parseFloat(token));
            } 
        }
        const classConstructor = this.primitiveClasses[type];
        return new classConstructor(...params);
    }

    parseTranslation(tokens) {
        tokens.shift(); // (
        const x = parseFloat(tokens[0]);
        tokens.shift(); // x
        tokens.shift(); // ,
        const y = parseFloat(tokens[0]);
        tokens.shift(); // y
        tokens.shift(); // ,
        const z = parseFloat(tokens[0]);
        tokens.shift(); // z
        tokens.shift(); // ,
        const shape = this.parseShape(tokens);
        tokens.shift(); // )
        return new CSGTranslation(shape, x, y, z);
    }

    parseRotation(tokens) {
        tokens.shift(); // (
        const x = radians(parseFloat(tokens[0]));
        tokens.shift(); // x
        tokens.shift(); // ,
        const y = radians(parseFloat(tokens[0]));
        tokens.shift(); // y
        tokens.shift(); // ,
        const z = radians(parseFloat(tokens[0]));
        tokens.shift(); // z
        tokens.shift(); // |
        const shape = this.parseShape(tokens);
        tokens.shift(); // )
        return new CSGRotation(shape, x, y, z);
    }

    parseColor(tokens) {
        tokens.shift(); // (
        const r = parseFloat(tokens[0]);
        tokens.shift(); // r
        tokens.shift(); // ,
        const g = parseFloat(tokens[0]);
        tokens.shift(); // g
        tokens.shift(); // ,
        const b = parseFloat(tokens[0]);
        tokens.shift(); // b
        tokens.shift(); // ,
        const shape = this.parseShape(tokens);
        tokens.shift(); // )
        return new CSGColor(shape, r, g, b);
    }

    parseSpecular(tokens) {
        tokens.shift(); // (
        const r = parseFloat(tokens[0]);
        tokens.shift(); // r
        tokens.shift(); // ,
        const g = parseFloat(tokens[0]);
        tokens.shift(); // g
        tokens.shift(); // ,
        const b = parseFloat(tokens[0]);
        tokens.shift(); // b
        tokens.shift(); // ,
        const shape = this.parseShape(tokens);
        tokens.shift(); // )
        return new CSGSpecular(shape, r, g, b);
    }

    parseShine(tokens) {
        tokens.shift(); // (
        const value = parseFloat(tokens[0]);
        tokens.shift(); // value
        tokens.shift(); // ,
        const shape = this.parseShape(tokens);
        tokens.shift(); // )
        return new CSGShine(shape, value);
    }

    parseUnion(tokens) {
        tokens.shift(); // (
        const shape1 = this.parseShape(tokens);
        tokens.shift(); // ,
        const shape2 = this.parseShape(tokens);
        tokens.shift(); // )
        if (shape1 && shape2) {
            return new CSGUnion(shape1, shape2);
        }
    }

    parseIntersection(tokens) {
        tokens.shift(); // (
        const shape1 = this.parseShape(tokens);
        tokens.shift(); // ,
        const shape2 = this.parseShape(tokens);
        tokens.shift(); // )
        if (shape1 && shape2) {
            return new CSGIntersection(shape1, shape2);
        }
    }

    parseDifference(tokens) {
        tokens.shift(); // (
        const shape1 = this.parseShape(tokens);
        tokens.shift(); // ,
        const shape2 = this.parseShape(tokens);
        tokens.shift(); // )
        if (shape1 && shape2) {
            return new CSGDifference(shape1, shape2);
        }
    }

    parseShape(tokens) {
        let type = tokens[0];
        tokens.shift();
        if (this.isPrimitive(type)) {
            return this.parsePrimitive(type, tokens);
        } else if (type === "UNION") {
            return this.parseUnion(tokens);
        } else if (type === "INTERSECTION") {
            return this.parseIntersection(tokens);
        } else if (type === "DIFFERENCE") {
            return this.parseDifference(tokens);
        } else if (type === "TRANSLATION") {
            return this.parseTranslation(tokens);
        } else if (type === "ROTATION") {
            return this.parseRotation(tokens);
        } else if (type === "COLOR") {
            return this.parseColor(tokens);
        } else if (type === "SPECULAR") {
            return this.parseSpecular(tokens);
        } else if (type === "SHINE") {
            return this.parseShine(tokens);
        }
        return null;
    }

    parseExpression(expression) {
        const tokens = this.tokenize(expression.replace(/[\n\s]/g, ''));
        const shape = this.parseShape(tokens);
        if (tokens.length === 0) {
            return shape;
        } else {
            console.log(tokens);
            throw new Error("Invalid expression");
        }
    }
}