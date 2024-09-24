import { ModelRenderer } from "../classes/renderer/ModelRenderer.js";
import { ReflectionRenderer } from "../classes/renderer/ReflectionRenderer.js";
import { updateUIForSelectedObject } from "../utils/domUtils.js";
import {
  updateSelectedModelPosition,
  updateSelectedModelRotation,
  updateSelectedModelScale,
} from "../utils/domUtils.js";
import { populateObjectList } from "../utils/domUtils.js";
import { updateRendererControls } from "./rendererController.js";

export function setupObjectControls(models, scene) {
  const objectSelect = document.getElementById("object-select");
  const rendererSelect = document.getElementById("renderer-select");
  const addObjectBtn = document.getElementById("add-object-btn");
  const removeObjectBtn = document.getElementById("remove-object-btn");

  const modal = document.getElementById("add-object-modal");
  const confirmAddObjectBtn = document.getElementById("confirm-add-object");
  const cancelAddObjectBtn = document.getElementById("cancel-add-object");
  const objectTypeSelect = document.getElementById("object-type-select");

  // Atualiza a interface de acordo com o objeto selecionado
  objectSelect.addEventListener("change", () => {
    updateUIForSelectedObject(models);
    updateRendererControls(models); // Atualiza o renderer quando o objeto é alterado
  });

  rendererSelect.addEventListener("change", () =>
    updateRendererControls(models)
  );

  addObjectBtn.addEventListener("click", () => {
    modal.style.display = "block";
  });

  cancelAddObjectBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  let isAddObjectListenerAttached = false;

  if (!isAddObjectListenerAttached) {
    confirmAddObjectBtn.addEventListener("click", () => {
      const selectedObject = objectTypeSelect.value;
      addObjectToScene(selectedObject, scene.models, scene);
      modal.style.display = "none"; // Esconde o modal
    });

    isAddObjectListenerAttached = true;
  }

  // Event listener para remover objeto
  removeObjectBtn.addEventListener("click", () => {
    removeObjectFromScene(scene.models, scene);
  });

  // Event listeners para inputs de transformação
  const posXInput = document.getElementById("pos-x");
  const posYInput = document.getElementById("pos-y");
  const posZInput = document.getElementById("pos-z");

  const rotXInput = document.getElementById("rot-x");
  const rotYInput = document.getElementById("rot-y");
  const rotZInput = document.getElementById("rot-z");

  const scaleXInput = document.getElementById("scale-x");
  const scaleYInput = document.getElementById("scale-y");
  const scaleZInput = document.getElementById("scale-z");

  posXInput.addEventListener("input", () =>
    updateSelectedModelPosition(models)
  );
  posYInput.addEventListener("input", () =>
    updateSelectedModelPosition(models)
  );
  posZInput.addEventListener("input", () =>
    updateSelectedModelPosition(models)
  );

  rotXInput.addEventListener("input", () =>
    updateSelectedModelRotation(models)
  );
  rotYInput.addEventListener("input", () =>
    updateSelectedModelRotation(models)
  );
  rotZInput.addEventListener("input", () =>
    updateSelectedModelRotation(models)
  );

  scaleXInput.addEventListener("input", () => updateSelectedModelScale(models));
  scaleYInput.addEventListener("input", () => updateSelectedModelScale(models));
  scaleZInput.addEventListener("input", () => updateSelectedModelScale(models));
}

// Adicionar Objeto
function addObjectToScene(objectType, models, scene) {
  scene.importOBJ(objectType);
  scene.loadAll();
  let newModel;
  switch (objectType) {
    case "teapot":
      newModel = scene
        .addModelFromOBJ("teapot")
        .autoCenter()
        .setScale([0.02, 0.02, 0.02])
        .setRotationX(-Math.PI / 2)
        .setRenderer(new ModelRenderer("default"));
      break;
    case "cube":
      newModel = scene
        .addModelFromOBJ("cube")
        .autoCenter()
        .setScale([0.2, 0.2, 0.2])
        .setRotationX(-Math.PI / 2)
        .setRenderer(new ModelRenderer("default"));
      break;
    case "yoda":
      newModel = scene
        .addModelFromOBJ("yoda")
        .autoCenter()
        .setScale([0.0002, 0.0002, 0.0002])
        .setRotationX(-Math.PI / 2)
        .setRenderer(new ModelRenderer("default"));
      break;
    case "windmill":
      newModel = scene
        .addModelFromOBJ("windmill")
        .autoCenter()
        .setScale([0.1, 0.1, 0.1])
        .setRotationX(0)
        .setRenderer(new ModelRenderer("default"));
      break;
      case "sphere":
        newModel = scene
          .addModelFromOBJ("sphere")
          .autoCenter()
          .setScale([0.02, 0.02, 0.02])
          .setRotationX(0)
          .setRenderer(new ModelRenderer("default"));
        break;
      case "sphere2":
        newModel = scene
          .addModelFromOBJ("sphere2")
          .autoCenter()
          .setScale([0.02, 0.02, 0.02])
          .setRotationX(0)
          .setRenderer(new ModelRenderer("default"));
        break;
  }

  if (newModel) {
    newModel.setScene(scene);
    populateObjectList(models); // Atualiza a lista de objetos
    updateUIForSelectedObject(models);
  }
}

// Remover Objeto
function removeObjectFromScene(models, scene) {
  const objectSelect = document.getElementById("object-select");
  const selectedIndex = objectSelect.value;
  if (selectedIndex !== "") {
    models.splice(selectedIndex, 1); // Remove o objeto da lista
    populateObjectList(models); // Atualiza a lista de objetos
    //    updateUIForSelectedObject(models);
  }
}
