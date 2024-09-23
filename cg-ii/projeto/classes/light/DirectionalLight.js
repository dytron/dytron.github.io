import { SceneObject } from "./../SceneObject.js";

export class DirectionalLight extends SceneObject {
    constructor() {
        super();
        this.setDirection([0, -1, 0]); // Direção da luz no espaço do mundo
        this.ambient = [0.5, 0.5, 0.5];
        this.diffuse = [0.7, 0.7, 0.7];
        this.specular = [1, 1, 1];
        this.uniformNames = ["enabled", "direction", "ambient", "diffuse", "specular"];
        this.uniformLocation = {};
        this.enabled = false;
    }

    setDirection(direction) {
        this.direction = direction;
    }

    getDirection() {
        return this.direction;
    }

    getUniformLocation(program) {
        this.uniformNames.forEach(name => {
            this.uniformLocation[name] = gl.getUniformLocation(program, 'lightDirection.' + name);
        });
    }

    apply(program) {
        this.getUniformLocation(program);

        // Normaliza a direção da luz para garantir que ela seja um vetor unitário
        const normalizedDirection = vec3.normalize(vec3.create(), this.direction);

        // Envia a direção fixa da luz (no espaço do mundo) para o shader
        gl.uniform3fv(this.uniformLocation.direction, normalizedDirection);

        // Envia as outras propriedades da luz para o shader
        this.uniformNames.forEach(name => {
            if (name !== 'direction') {
                const value = this[name];
                const location = this.uniformLocation[name];
                if (Array.isArray(value)) {
                    gl.uniform3fv(location, value);
                } else {
                    gl.uniform1f(location, value);
                }
            }
        });
    }
}
