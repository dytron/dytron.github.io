export class CameraController {
    constructor() {
        this.STATE = {
            NONE: 0,
            MOVE: 1,
            ZOOM: 2
        };
        this.state = this.STATE.NONE;
        this.mouse = [0, 0, 0];
        this.rotation = [0, 0, 0];
        
        this.camera = null;

        this.cameraDragOffset = [0, 0, 0];
        this.mouseDragOffset = [0, 0, 0];
        this.sensibility = 1/180;

        this.zoom = 1;
        this.zoomOffset = 1;
        this.zoomSensibility = 1/180;
        this.zoomMin = 0.5;
        this.zoomMax = 5;
        this.zoomMinOrtho = 0.01;
        this.zoomMaxOrtho = 50;
        // Velocidade do movimento em câmeras ortográficas
        this.moveSpeed = 0.05;
    }
    setCamera(camera) {
        this.camera = camera;
        this.camera.controller = this;
        this.rotation = this.camera.rotation;
        this.cameraDragOffset = [...this.camera.position];
    }
    onMouseDown(mouseOffsetX, mouseOffsetY, button) {
        this.mouseDragOffset = [mouseOffsetX, mouseOffsetY, 0];
        this.onMouseMove(mouseOffsetX, mouseOffsetY);

        if (this.camera.isOrthographic) {
            // Salvar a posição da câmera no início do movimento para câmeras ortográficas
            this.cameraDragOffset = [...this.camera.position];
        } else {
            // Salvar a rotação da câmera no início do movimento para câmeras em perspectiva
            this.cameraDragOffset = [this.rotation[0], this.rotation[1], this.rotation[2]];
        }
        this.state = (button == 0) ? this.STATE.MOVE : this.STATE.ZOOM;
    }
    onMouseUp() {
        this.state = this.STATE.NONE;
        this.cameraDragOffset = [this.rotation[0], this.rotation[1], this.rotation[2]];
        this.zoomOffset = this.zoom;
    }
    onMouseMove(mouseX, mouseY) {
        this.mouse = [mouseX, mouseY, 0];
    }
    apply() {
        if (this.state === this.STATE.MOVE) {
            if (this.camera.isOrthographic) {
                // Move a câmera ortográfica ajustando diretamente sua posição
                const dx = (this.mouse[0] - this.mouseDragOffset[0]) * this.moveSpeed * this.zoom;
                const dy = (this.mouse[1] - this.mouseDragOffset[1]) * this.moveSpeed * this.zoom;

                // Atualiza a posição da câmera com base no movimento do mouse
                this.camera.position[0] = this.cameraDragOffset[0] - dx;
                this.camera.position[1] = this.cameraDragOffset[1] + dy;  // Ajusta a posição vertical de acordo com o movimento do mouse
            } else {
                // Cálculo de rotação para câmera em perspectiva
                this.rotation[1] = this.cameraDragOffset[1] 
                    + this.sensibility * (this.mouse[0] - this.mouseDragOffset[0]);
                this.rotation[0] = this.cameraDragOffset[0] 
                    + this.sensibility * (this.mouse[1] - this.mouseDragOffset[1]);
                this.rotation[0] = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation[0]));
            }
        }
    
        if (this.state === this.STATE.ZOOM) {
            this.zoom = this.zoomOffset - this.zoomSensibility * (this.mouse[0] - this.mouseDragOffset[0]);
            if (this.camera.isOrthographic) {
                this.zoom = Math.max(this.zoomMinOrtho, Math.min(this.zoomMaxOrtho, this.zoom));
            } else {
                this.zoom = Math.max(this.zoomMin, Math.min(this.zoomMax, this.zoom));
            }
        }

        if (this.camera.isOrthographic) {
            // Ajustar os limites da câmera ortográfica com base no zoom
            const scale = this.zoom;
            this.camera.left = -10 * scale;
            this.camera.right = 10 * scale;
            this.camera.top = 10 * scale;
            this.camera.bottom = -10 * scale;

        } else {
            // Cálculo para câmera em perspectiva
            const radius = this.zoom; 
            const x = radius * Math.sin(this.rotation[1]) * Math.cos(this.rotation[0]);
            const y = radius * Math.sin(this.rotation[0]);
            const z = radius * Math.cos(this.rotation[1]) * Math.cos(this.rotation[0]);
            const cameraPosition = vec3.fromValues(x, y, z);
            this.camera.position = cameraPosition;

            const cameraDirection = vec3.create();
            vec3.subtract(cameraDirection, this.camera.position, this.camera.target);
            vec3.normalize(cameraDirection, cameraDirection);

            const globalUp = vec3.fromValues(0, 1, 0);
            const cameraRight = vec3.create();
            vec3.cross(cameraRight, globalUp, cameraDirection);
            vec3.normalize(cameraRight, cameraRight);

            const cameraUp = vec3.create();
            vec3.cross(cameraUp, cameraDirection, cameraRight);
            vec3.normalize(cameraUp, cameraUp);
            this.camera.setUpVector(cameraUp);
        }
    }
    
}