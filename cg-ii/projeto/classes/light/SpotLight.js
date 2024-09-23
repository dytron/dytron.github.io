import { SceneObject } from "./../SceneObject.js";

export class SpotLight extends SceneObject {
    constructor() {
        super();
        this.setPosition([0, 0.8, 0.8]); // Posição da luz no espaço 3D
        this.direction = [0, -1, -1]; // Direção da luz (padrão apontando para baixo)
        this.ambient = [0.2, 0.2, 0.2];
        this.diffuse = [0.8, 0.8, 0.8];
        this.specular = [1, 1, 1];
        this.constant = 1.0;  // Coeficiente constante para atenuação
        this.linear = 0.09;   // Coeficiente linear para atenuação
        this.quadratic = 0.032; // Coeficiente quadrático para atenuação
        this.cutOff = Math.cos(Math.PI / 6);  // Ângulo do cone de corte (30 graus)
        this.outerCutOff = Math.cos(Math.PI / 5); // Ângulo externo para suavizar (45 graus)
        this.uniformNames = ["enabled", "position", "direction", "ambient", "diffuse", "specular", "constant", "linear", "quadratic", "cutOff", "outerCutOff"];
        this.uniformLocation = {};
        this.enabled = true;
    }

    setPosition(position) {
        this.position = position;
    }

    setDirection(direction) {
        this.direction = direction;
    }

    getPosition() {
        return this.position;
    }

    getDirection() {
        return this.direction;
    }

    getUniformLocation(program) {
        this.uniformNames.forEach(name => {
            this.uniformLocation[name] = gl.getUniformLocation(program, 'spotLight.' + name);
        });
    }

    apply(program, viewMatrix, projectionMatrix) {
        gl.useProgram(program);
        this.getUniformLocation(program);
    
        // Envia as outras propriedades da luz para o shader
        this.uniformNames.forEach(name => {
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
