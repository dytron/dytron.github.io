import { radiansToDegrees, degreesToRadians } from '../utils/mathUtils.js';
import { updateUICameraInputs } from '../utils/domUtils.js';
import { hexToRgb } from '../utils/colorUtils.js';

export function setupCameraControls(scene) {
    // Inputs de posição, target, upVector e rotação da câmera
    const camPosXInput = document.getElementById("cam-pos-x");
    const camPosYInput = document.getElementById("cam-pos-y");
    const camPosZInput = document.getElementById("cam-pos-z");

    const camTargetXInput = document.getElementById("cam-target-x");
    const camTargetYInput = document.getElementById("cam-target-y");
    const camTargetZInput = document.getElementById("cam-target-z");

    const camUpXInput = document.getElementById("cam-up-x");
    const camUpYInput = document.getElementById("cam-up-y");
    const camUpZInput = document.getElementById("cam-up-z");

    const camRotXInput = document.getElementById("cam-rot-x");
    const camRotYInput = document.getElementById("cam-rot-y");
    const camRotZInput = document.getElementById("cam-rot-z");

    const camFovInput = document.getElementById("cam-fov");
    const camAspectInput = document.getElementById("cam-aspect");

    const camLeftInput = document.getElementById("cam-left");
    const camRightInput = document.getElementById("cam-right");
    const camTopInput = document.getElementById("cam-top");
    const camBottomInput = document.getElementById("cam-bottom");

    const projectionSelect = document.getElementById("projection-select");

    const camBgColorInput = document.getElementById("cam-bg-color");
    const camSkyboxSelect = document.getElementById("cam-skybox-select");

    // Event listeners para os inputs de posição, target, upVector e rotação da câmera
    camPosXInput.addEventListener("input", () => {
        scene.cameraController.camera.position[0] = parseFloat(camPosXInput.value);
    });
    camPosYInput.addEventListener("input", () => {
        scene.cameraController.camera.position[1] = parseFloat(camPosYInput.value);
    });
    camPosZInput.addEventListener("input", () => {
        scene.cameraController.camera.position[2] = parseFloat(camPosZInput.value);
    });

    camTargetXInput.addEventListener("input", () => {
        scene.cameraController.camera.target[0] = parseFloat(camTargetXInput.value);
    });
    camTargetYInput.addEventListener("input", () => {
        scene.cameraController.camera.target[1] = parseFloat(camTargetYInput.value);
    });
    camTargetZInput.addEventListener("input", () => {
        scene.cameraController.camera.target[2] = parseFloat(camTargetZInput.value);
    });

    camUpXInput.addEventListener("input", () => {
        scene.cameraController.camera.upVector[0] = parseFloat(camUpXInput.value);
    });
    camUpYInput.addEventListener("input", () => {
        scene.cameraController.camera.upVector[1] = parseFloat(camUpYInput.value);
    });
    camUpZInput.addEventListener("input", () => {
        scene.cameraController.camera.upVector[2] = parseFloat(camUpZInput.value);
    });

    camRotXInput.addEventListener("input", () => {
        scene.cameraController.camera.rotation[0] = degreesToRadians(parseFloat(camRotXInput.value));
    });
    camRotYInput.addEventListener("input", () => {
        scene.cameraController.camera.rotation[1] = degreesToRadians(parseFloat(camRotYInput.value));
    });
    camRotZInput.addEventListener("input", () => {
        scene.cameraController.camera.rotation[2] = degreesToRadians(parseFloat(camRotZInput.value));
    });

    // Event listeners para os inputs de projeção perspectiva
    camFovInput.addEventListener("input", () => {
        scene.cameraController.camera.fov = degreesToRadians(parseFloat(camFovInput.value));
    });
    camAspectInput.addEventListener("input", () => {
        scene.cameraController.camera.aspect = parseFloat(camAspectInput.value);
    });

    // Event listeners para os inputs de projeção ortográfica
    camLeftInput.addEventListener("input", () => {
        scene.cameraController.camera.left = parseFloat(camLeftInput.value);
    });
    camRightInput.addEventListener("input", () => {
        scene.cameraController.camera.right = parseFloat(camRightInput.value);
    });
    camTopInput.addEventListener("input", () => {
        scene.cameraController.camera.top = parseFloat(camTopInput.value);
    });
    camBottomInput.addEventListener("input", () => {
        scene.cameraController.camera.bottom = parseFloat(camBottomInput.value);
    });

    // Event listener para troca de projeção
    projectionSelect.addEventListener("change", () => {
        const projectionType = projectionSelect.value;
        scene.cameraController.camera.isOrthographic = projectionType === "orthographic";
    });

    // Event listener para alterar a cor de fundo da câmera
    camBgColorInput.addEventListener("input", () => {
        const bgColor = camBgColorInput.value;
        scene.cameraController.camera.backgroundColor = hexToRgb(bgColor);
    });

    // Event listener para seleção do skybox
    camSkyboxSelect.addEventListener("change", () => {
        const selectedSkybox = camSkyboxSelect.value;
        if (selectedSkybox === "none") {
            scene.skybox.setTextureName("");
        } else {
            scene.textureManager.loadCubeMap(selectedSkybox);
            scene.skybox.setTextureName(selectedSkybox);
        }
    });

    // Atualiza os inputs de acordo com o estado inicial da câmera
    updateUICameraInputs(scene.cameraController.camera);
}
