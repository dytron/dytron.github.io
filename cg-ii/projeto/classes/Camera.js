import { SceneObject } from "./SceneObject.js";

export class Camera extends SceneObject {
    constructor() {
        super();
        this.position = [0, 0, 0];
        this.target = [0, 0, 0];
        this.upVector = [0, 1, 0];
        this.rotation = [0, 0, 0]; 
        this.controller = null;

        // Configurações padrão de projeção (perspectiva)
        this.isOrthographic = false;
        this.fov = 60 * Math.PI / 180; // Campo de visão em radianos
        this.aspect = 1; // Proporção inicial (deve ser ajustada de acordo com o canvas)
        this.near = 0.1; // Distância mínima da câmera
        this.far = 200;  // Distância máxima da câmera
        
        // Configurações específicas para projeção ortográfica
        this.left = -10;
        this.right = 10;
        this.bottom = -10;
        this.top = 10;
        this.orthoNear = 0.01; // Distância mínima para ortográfica
        this.orthoFar = 500;  // Distância máxima para ortográfica

        this.backgroundColor = [255, 0, 0];

        this.autoUpdateAspectRatio = false;
    }
    setBackgroundColor(backgroundColor) {
        this.backgroundColor = backgroundColor;
        return this;
    }
    setPosition(position) {
        this.position = position;
        return this;
    }
    setTarget(position) {
        this.target = position;
        return this;
    }
    setUpVector(position) {
        this.upVector = position;
        return this;
    }
    setRotation(rotation) {
        this.rotation = rotation;
        return this;
    }
    setPerspective(fov, aspect, near, far) {
        this.isOrthographic = false;
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        return this;
    }
    setOrthographic(left, right, bottom, top, near, far) {
        this.isOrthographic = true;
        this.left = left;
        this.right = right;
        this.bottom = bottom;
        this.top = top;
        this.near = near;
        this.far = far;
        return this;
    }
    updateAspectRatio(canvas) {
        this.aspect = canvas.clientWidth / canvas.clientHeight;
    }
    setUniforms(program) {
        let uViewWorldPosition = gl.getUniformLocation(program, 'uViewWorldPosition');
        if (uViewWorldPosition) {
            gl.uniform3fv(uViewWorldPosition, this.position);
        }
    }
    apply(viewMatrix, projectionMatrix) {
        this.viewMatrix = viewMatrix;
        if (this.autoUpdateAspectRatio)
            this.updateAspectRatio(gl.canvas);
        // Aplica transformações adicionais via controller, se existir
        this.controller.apply();
        // Aplica as transformações de visualização
        mat4.lookAt(viewMatrix, this.position, this.target, this.upVector);
        // Aplica a projeção baseada no modo selecionado
        if (projectionMatrix) {
            if (this.isOrthographic) {
                mat4.ortho(projectionMatrix, this.left, this.right, this.bottom, this.top, this.near, this.far);
            } else {
                mat4.perspective(projectionMatrix, this.fov, this.aspect, this.near, this.far);
            }
        }

    }
}
