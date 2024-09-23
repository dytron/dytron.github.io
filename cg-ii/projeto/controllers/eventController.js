import { updateUICameraInputs } from "./uiController.js";

export function initializeCanvasEvents(gl, scene) {
  const canvas = gl.canvas;

  // Prevenir o menu de contexto do botão direito do mouse
  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  // Detectar mousedown (botões do mouse)
  canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;
    scene.cameraController.onMouseDown(mouseX, mouseY, e.button);
  });

  // Detectar mouseup
  canvas.addEventListener("mouseup", (e) => {
    scene.cameraController.onMouseUp();
    updateUICameraInputs(scene.cameraController.camera); // Atualiza os inputs da câmera
  });

  // Detectar movimento do mouse
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;
    scene.cameraController.onMouseMove(mouseX, mouseY);
    updateUICameraInputs(scene.cameraController.camera); // Atualiza os inputs da câmera
  });

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        scene.toggleCameraController();  // Alterna entre os controladores de câmera
    }
});
}
