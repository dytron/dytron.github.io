import { hexToRgb } from "../utils/colorUtils.js";
import { PointRenderer } from "../classes/renderer/PointRenderer.js";
import { FlatRenderer } from "../classes/renderer/FlatRenderer.js";
import { ModelRenderer } from "../classes/renderer/ModelRenderer.js";

export function populateObjectList(models) {
  const objectSelect = document.getElementById("object-select");
  objectSelect.innerHTML = ""; // Limpa o select antes de popular
  models.forEach((model, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.text = `Object ${index + 1}`;
    objectSelect.add(option);
  });
}
export function updateUICameraInputs(camera) {
  // Atualize os inputs de posição
  document.getElementById("cam-pos-x").value = camera.position[0];
  document.getElementById("cam-pos-y").value = camera.position[1];
  document.getElementById("cam-pos-z").value = camera.position[2];

  // Atualize os inputs de target
  document.getElementById("cam-target-x").value = camera.target[0];
  document.getElementById("cam-target-y").value = camera.target[1];
  document.getElementById("cam-target-z").value = camera.target[2];

  // Atualize os inputs de upVector
  document.getElementById("cam-up-x").value = camera.upVector[0];
  document.getElementById("cam-up-y").value = camera.upVector[1];
  document.getElementById("cam-up-z").value = camera.upVector[2];

  // Atualize os inputs de rotação (convertendo para graus)
  document.getElementById("cam-rot-x").value = radiansToDegrees(
    camera.rotation[0]
  );
  document.getElementById("cam-rot-y").value = radiansToDegrees(
    camera.rotation[1]
  );
  document.getElementById("cam-rot-z").value = radiansToDegrees(
    camera.rotation[2]
  );

  document.getElementById("cam-fov").value = radiansToDegrees(
    camera.fov
  );

  document.getElementById("cam-aspect").value = camera.aspect;
  document.getElementById("cam-left").value = camera.left;
  document.getElementById("cam-right").value = camera.right;
  document.getElementById("cam-top").value = camera.top;
  document.getElementById("cam-bottom").value = camera.bottom;
}

export function setupEventListeners(models, scene) {
  const objectSelect = document.getElementById("object-select");
  const rendererSelect = document.getElementById("renderer-select");
  const addObjectBtn = document.getElementById("add-object-btn");
  const removeObjectBtn = document.getElementById("remove-object-btn");
  const modal = document.getElementById("add-object-modal");
  const closeModalBtn = document.querySelector(".close-btn");
  const confirmAddObjectBtn = document.getElementById("confirm-add-object");
  const cancelAddObjectBtn = document.getElementById("cancel-add-object");
  const objectTypeSelect = document.getElementById("object-type-select");

  // Inputs de posição e rotação
  const posXInput = document.getElementById("pos-x");
  const posYInput = document.getElementById("pos-y");
  const posZInput = document.getElementById("pos-z");
  const rotXInput = document.getElementById("rot-x");
  const rotYInput = document.getElementById("rot-y");
  const rotZInput = document.getElementById("rot-z");
  const scaleXInput = document.getElementById("scale-x");
  const scaleYInput = document.getElementById("scale-y");
  const scaleZInput = document.getElementById("scale-z");

  // Inputs de posição, target e upVector da câmera
  const camPosXInput = document.getElementById("cam-pos-x");
  const camPosYInput = document.getElementById("cam-pos-y");
  const camPosZInput = document.getElementById("cam-pos-z");

  const camTargetXInput = document.getElementById("cam-target-x");
  const camTargetYInput = document.getElementById("cam-target-y");
  const camTargetZInput = document.getElementById("cam-target-z");

  const camUpXInput = document.getElementById("cam-up-x");
  const camUpYInput = document.getElementById("cam-up-y");
  const camUpZInput = document.getElementById("cam-up-z");

  const camera = scene.camera;

  // Event listeners para os inputs de posição da câmera
  camPosXInput.addEventListener("input", () => {
    camera.position[0] = parseFloat(camPosXInput.value);
  });
  camPosYInput.addEventListener("input", () => {
    camera.position[1] = parseFloat(camPosYInput.value);
  });
  camPosZInput.addEventListener("input", () => {
    camera.position[2] = parseFloat(camPosZInput.value);
  });

  // Event listeners para os inputs de target da câmera
  camTargetXInput.addEventListener("input", () => {
    camera.target[0] = parseFloat(camTargetXInput.value);
  });
  camTargetYInput.addEventListener("input", () => {
    camera.target[1] = parseFloat(camTargetYInput.value);
  });
  camTargetZInput.addEventListener("input", () => {
    camera.target[2] = parseFloat(camTargetZInput.value);
  });

  // Event listeners para os inputs de upVector da câmera
  camUpXInput.addEventListener("input", () => {
    camera.upVector[0] = parseFloat(camUpXInput.value);
  });
  camUpYInput.addEventListener("input", () => {
    camera.upVector[1] = parseFloat(camUpYInput.value);
  });
  camUpZInput.addEventListener("input", () => {
    camera.upVector[2] = parseFloat(camUpZInput.value);
  });

  // Call to update the UI with the initial camera values
  updateUICameraInputs(camera);

  // Event listeners para seleção de objeto e renderer
  objectSelect.addEventListener("change", () =>
    updateUIForSelectedObject(models)
  );
  rendererSelect.addEventListener("change", () =>
    updateRendererControls(models)
  );

  // Event listeners para inputs de posição e rotação
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

  // Event listeners para botões de adicionar e remover objetos
  addObjectBtn.addEventListener("click", () => {
    modal.style.display = "block"; // Exibe o modal
  });

  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none"; // Esconde o modal
  });

  cancelAddObjectBtn.addEventListener("click", () => {
    modal.style.display = "none"; // Esconde o modal
  });

  confirmAddObjectBtn.addEventListener("click", () => {
    const selectedObject = objectTypeSelect.value;
    addObjectToScene(selectedObject, models, scene);
    modal.style.display = "none"; // Esconde o modal
  });

  removeObjectBtn.addEventListener("click", () => {
    const selectedIndex = objectSelect.value;
    if (selectedIndex !== "") {
      models.splice(selectedIndex, 1); // Remove o objeto da lista
      populateObjectList(models); // Atualiza a lista de objetos
    }
  });
}

function updateSelectedModelPosition(models) {
  const objectSelect = document.getElementById("object-select");
  const selectedModel = models[objectSelect.value];

  selectedModel.translation[0] = parseFloat(
    document.getElementById("pos-x").value
  );
  selectedModel.translation[1] = parseFloat(
    document.getElementById("pos-y").value
  );
  selectedModel.translation[2] = parseFloat(
    document.getElementById("pos-z").value
  );
}

function updateSelectedModelRotation(models) {
  const objectSelect = document.getElementById("object-select");
  const selectedModel = models[objectSelect.value];

  selectedModel.rotation[0] = degreesToRadians(
    parseFloat(document.getElementById("rot-x").value)
  );
  selectedModel.rotation[1] = degreesToRadians(
    parseFloat(document.getElementById("rot-y").value)
  );
  selectedModel.rotation[2] = degreesToRadians(
    parseFloat(document.getElementById("rot-z").value)
  );
}

function updateSelectedModelScale(models) {
  const objectSelect = document.getElementById("object-select");
  const selectedModel = models[objectSelect.value];

  selectedModel.scale[0] = parseFloat(document.getElementById("scale-x").value);
  selectedModel.scale[1] = parseFloat(document.getElementById("scale-y").value);
  selectedModel.scale[2] = parseFloat(document.getElementById("scale-z").value);
}
export function updateUIForSelectedObject(models) {
  const objectSelect = document.getElementById("object-select");
  const selectedModel = models[objectSelect.value];

  document.getElementById("pos-x").value = selectedModel.translation[0];
  document.getElementById("pos-y").value = selectedModel.translation[1];
  document.getElementById("pos-z").value = selectedModel.translation[2];

  document.getElementById("rot-x").value = radiansToDegrees(
    selectedModel.rotation[0]
  );
  document.getElementById("rot-y").value = radiansToDegrees(
    selectedModel.rotation[1]
  );
  document.getElementById("rot-z").value = radiansToDegrees(
    selectedModel.rotation[2]
  );
  document.getElementById("scale-x").value = selectedModel.scale[0];
  document.getElementById("scale-y").value = selectedModel.scale[1];
  document.getElementById("scale-z").value = selectedModel.scale[2];
}
function normalizeDegrees(degrees) {
  return ((degrees % 360) + 360) % 360;
}

function degreesToRadians(degrees) {
  degrees = normalizeDegrees(degrees);
  return (degrees * Math.PI) / 180;
}

function radiansToDegrees(radians) {
  let degrees = (radians * 180) / Math.PI;
  return normalizeDegrees(degrees);
}

export function updateRendererControls(models) {
  const objectSelect = document.getElementById("object-select");
  const rendererSelect = document.getElementById("renderer-select");
  const additionalControls = document.getElementById(
    "additional-renderer-controls"
  );

  additionalControls.innerHTML = "";

  const selectedModel = models[objectSelect.value];
  let renderer;

  switch (rendererSelect.value) {
    case "point":
      renderer = new PointRenderer("point");

      const pointSizeDiv = document.createElement("div");
      const pointSizeLabel = document.createElement("label");
      pointSizeLabel.innerText = "Point Size:";
      const pointSizeInput = document.createElement("input");
      pointSizeInput.type = "number";
      pointSizeInput.step = "0.1";
      pointSizeInput.value = "5.0";

      pointSizeDiv.appendChild(pointSizeLabel);
      pointSizeDiv.appendChild(pointSizeInput);
      additionalControls.appendChild(pointSizeDiv);

      pointSizeInput.addEventListener("input", () => {
        renderer.setPointSize(parseFloat(pointSizeInput.value));
      });

      const pointColorDiv = document.createElement("div");
      const pointColorLabel = document.createElement("label");
      pointColorLabel.innerText = "Color:";
      const pointColorInput = document.createElement("input");
      pointColorInput.type = "color";
      pointColorInput.value = "#ffffff"; // Valor padrão de cor

      pointColorDiv.appendChild(pointColorLabel);
      pointColorDiv.appendChild(pointColorInput);
      additionalControls.appendChild(pointColorDiv);

      pointColorInput.addEventListener("input", () => {
        const hexColor = pointColorInput.value;
        const rgbColor = hexToRgb(hexColor);
        renderer.setColor(rgbColor);
      });
      break;

    case "flat":
      renderer = new FlatRenderer("flat");
      const flatColorLabel = document.createElement("label");
      flatColorLabel.innerText = "Color:";
      const flatColorInput = document.createElement("input");
      flatColorInput.type = "color";
      flatColorInput.value = "#ffffff";
      additionalControls.appendChild(flatColorLabel);
      additionalControls.appendChild(flatColorInput);

      flatColorInput.addEventListener("input", () => {
        const hexColor = flatColorInput.value;
        const rgbColor = hexToRgb(hexColor);
        renderer.setColor(rgbColor);
      });
      break;

    case "surface-normal":
      renderer = new ModelRenderer("surface-normal");
      break;

    default:
      renderer = new ModelRenderer("default");
      break;
  }

  selectedModel.setRenderer(renderer);
}

function addObjectToScene(objectType, models, scene) {
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
        .setScale([0.02, 0.02, 0.02])
        .setRotationX(-Math.PI / 2)
        .setRenderer(new ModelRenderer("default"));
      break;
    // Adicione outros casos conforme necessário
  }

  if (newModel) {
    models.push(newModel);
    populateObjectList(models); // Atualiza a lista de objetos
  }
}
