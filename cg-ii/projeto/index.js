"use strict";

import { Scene } from "./classes/Scene.js";
import { main } from "./controllers/mainController.js";
import { configureModels } from "./controllers/sceneSetup.js";
import { populateObjectList, updateUIForSelectedObject } from "./utils/domUtils.js";

// Inicializa a cena
const scene = new Scene();
window.scene = scene;
// Configura os modelos
configureModels(scene);

// Popula a lista de objetos após configurar os modelos
populateObjectList(scene.models);

// Atualiza os inputs para o primeiro objeto na lista (caso exista)
if (scene.models.length > 0) {
  updateUIForSelectedObject(scene.models);
}

// Carrega os shaders e inicia a aplicação
await scene.shaderManager
  .loadAll()
  .then(() => scene.loadAll())
  .then(() => main(scene))
  .catch((error) => console.error("Erro ao iniciar a aplicação:", error));
