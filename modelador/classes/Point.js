class Point {
    constructor(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    add(p) {
      return new Point(this.x + p.x, this.y + p.y, this.z + p.z);
    }
    sub(p) {
      return new Point(this.x - p.x, this.y - p.y, this.z - p.z);
    }
    mul(k) {
      return new Point(this.x * k, this.y * k, this.z * k);
    }
    div(k) {
      return new Point(this.x / k, this.y / k, this.z / k);
    }
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    magnitude() {
      return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
    }
    normalize() {
      return this.div(this.magnitude());
    }
    applyOperation(matrix) {
      const vert = this.toMatrix();
      const result = Matrix.mul(matrix, vert);
      return new Point(result[0][0], result[1][0], result[2][0]);
    }
    scale(x, y, z) {
      return this.applyOperation([[x, 0, 0, 0], [0, y, 0, 0], [0, 0, z, 0], [0, 0, 0, 1]]);
    }
    translate(x, y, z) {
      return this.applyOperation([[1, 0, 0, x], [0, 1, 0, y], [0, 0, 1, z], [0, 0, 0, 1]]);
    }
    rotateX(angle) {
      let c = cos(angle), s = sin(angle);
      return this.applyOperation([[1, 0, 0, 0], [0, c, -s, 0], [0, s, c,0], [0, 0, 0, 1]]);
    }
    rotateY(angle) {
      let c = cos(angle), s = sin(angle);
      return this.applyOperation([[c, 0, s, 0], [0, 1, 0, 0], [-s, 0,  c, 0], [0, 0, 0, 1]]);
    }
    rotateZ(angle) {
      let c = cos(angle), s = sin(angle);
      return this.applyOperation([[c, -s, 0, 0 ], [s, c, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]);
    }
    cross(p) {
        return new Point(
            this.y * p.z - this.z * p.y,
            this.z * p.x - this.x * p.z,
            this.x * p.y - this.y * p.x
        );
    }
    setFromArray(array) {
      this.x = array[0];
      this.y = array[1];
      this.z = array[2];
    }
    toArray() {
      return [this.x, this.y, this.z, 1];
    }
    toMatrix() {
      return [[this.x], [this.y], [this.z], [1]];
    }
    toArray3D() {
        return [this.x, this.y, this.z]
    }
  }
  