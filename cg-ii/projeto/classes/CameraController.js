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
    }
    setCamera(camera) {
        this.camera = camera;
        this.camera.controller = this;
        this.rotation = this.camera.rotation;
    }
    onMouseDown(mouseOffsetX, mouseOffsetY, button) {
        this.mouseDragOffset = [mouseOffsetX, mouseOffsetY, 0];
        this.onMouseMove(mouseOffsetX, mouseOffsetY);
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
            // Ajuste de rotação em torno do eixo Y (horizontal)
            this.rotation[1] = this.cameraDragOffset[1] 
                + this.sensibility * (this.mouse[0] - this.mouseDragOffset[0]); // Horizontal, eixo Y
    
            // Ajuste de rotação vertical (não alterando a distância)
            this.rotation[0] = this.cameraDragOffset[0] 
                + this.sensibility * (this.mouse[1] - this.mouseDragOffset[1]); // Vertical, eixo X
    
            // Limitar a rotação vertical para não ir além de 90 graus
            this.rotation[0] = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation[0]));
        }
    
        if (this.state === this.STATE.ZOOM) {
            this.zoom = this.zoomOffset - this.zoomSensibility * (this.mouse[0] - this.mouseDragOffset[0]);
            this.zoom = Math.max(this.zoomMin, Math.min(this.zoomMax, this.zoom));
        }
    
        // Calcular a posição da câmera em torno do alvo
        const radius = this.zoom; 
    
        // A nova posição da câmera será em um ponto ao redor do alvo
        const x = radius * Math.sin(this.rotation[1]) * Math.cos(this.rotation[0]); // Gira ao redor do eixo Y
        const y = radius * Math.sin(this.rotation[0]); // Altura da câmera (vertical)
        const z = radius * Math.cos(this.rotation[1]) * Math.cos(this.rotation[0]); // Gira ao redor do eixo Y
    
        // Atualizar a posição da câmera
        const cameraPosition = vec3.fromValues(x, y, z);
        this.camera.position = cameraPosition;
    
        // Calcular a direção da câmera (do target para a posição da câmera)
        const cameraDirection = vec3.create();
        vec3.subtract(cameraDirection, this.camera.position, this.camera.target);
        vec3.normalize(cameraDirection, cameraDirection);
    
        // Definir o vetor "up" global (geralmente [0, 1, 0])
        const globalUp = vec3.fromValues(0, 1, 0);
    
        // Calcular o vetor "right" (produto vetorial entre o vetor "up" global e a direção da câmera)
        const cameraRight = vec3.create();
        vec3.cross(cameraRight, globalUp, cameraDirection);
        vec3.normalize(cameraRight, cameraRight);
    
        // Recalcular o vetor "up" (produto vetorial entre a direção da câmera e o vetor "right")
        const cameraUp = vec3.create();
        vec3.cross(cameraUp, cameraDirection, cameraRight);
        vec3.normalize(cameraUp, cameraUp);
    
        // Atualizar o vetor "up" da câmera
        this.camera.setUpVector(cameraUp);
    }
    
    
}