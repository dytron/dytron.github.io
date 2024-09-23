import { CameraController } from '../classes/CameraController.js';
import { setupCameraControls, setupObjectControls } from './controllers.js';
import { initializeCanvasEvents } from './eventController.js';
import { configureScene } from './sceneSetup.js';
import { updateRendererControls } from './rendererController.js';
import { setupLightControls } from './lightController.js';
import { updateUILightingInputs } from '../utils/domUtils.js';

export function main(scene) {
  // Configura a cena
  configureScene(scene);

  const canvas = document.querySelector("#c");
  window.gl = canvas.getContext("webgl2");

  if (!gl) return;

  initializeCanvasEvents(gl, scene);

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  // Define o contexto WebGL
  gl = gl;

  // Cria os programas de shader
  scene.shaderManager.shaderNames.forEach(shader => {
    try {
      scene.createShaderProgram(shader);
    } catch (error) {
      console.error(`Erro ao criar programa de shader para ${shader}:`, error);
    }
  });

  scene.init();
  // Configura os controles de interface e eventos
  setupCameraControls(scene); 
  setupObjectControls(scene.models, scene); 
  setupLightControls(scene);
  updateUILightingInputs(scene);

  // Chama a função para configurar o renderer no início e sempre que necessário
  updateRendererControls(scene.models);


  // Inicia o loop de renderização
  const draw = () => {
    requestAnimationFrame(draw);
    scene.draw();
  };

  draw();
}
