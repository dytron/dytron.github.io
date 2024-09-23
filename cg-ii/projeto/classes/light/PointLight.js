import { SceneObject } from "./../SceneObject.js";

export class PointLight extends SceneObject {
  constructor(index) {
    super();
    this.setPosition([1, 2, 0]); // Posição da luz no espaço 3D
    this.ambient = [0.2, 0.2, 0.2];
    this.diffuse = [1, 1, 1];
    this.specular = [1, 1, 1];
    this.constant = 1.0; // Coeficiente constante para atenuação
    this.linear = 0.09; // Coeficiente linear para atenuação
    this.quadratic = 0.032; // Coeficiente quadrático para atenuação
    this.uniformNames = [
      "enabled",
      "position",
      "ambient",
      "diffuse",
      "specular",
      "constant",
      "linear",
      "quadratic",
    ];
    this.uniformLocation = {};
    this.enabled = false;
    this.index = index;
  }

  setPosition(position) {
    this.position = position;
  }

  getPosition() {
    return this.position;
  }

  getUniformLocation(program) {
    this.uniformNames.forEach((name) => {
      this.uniformLocation[name] = gl.getUniformLocation(
        program,
        `pointLights[${this.index}].${name}`
      );
    });
  }

  apply(program, viewMatrix, projectionMatrix) {
    gl.useProgram(program);
    this.getUniformLocation(program);

    // Envia as outras propriedades da luz para o shader
    this.uniformNames.forEach((name) => {
      const value = this[name];
      const location = this.uniformLocation[name];
      if (Array.isArray(value)) {
        gl.uniform3fv(location, value);
      } else {
        gl.uniform1f(location, value);
      }
    });
  }
}
