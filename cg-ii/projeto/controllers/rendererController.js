import { hexToRgb } from "../utils/colorUtils.js";
import { PointRenderer } from "../classes/renderer/PointRenderer.js";
import { FlatRenderer } from "../classes/renderer/FlatRenderer.js";
import { ModelRenderer } from "../classes/renderer/ModelRenderer.js";
import { WireframeRenderer } from "../classes/renderer/WireframeRenderer.js";
import { MaterialRenderer } from "../classes/renderer/MaterialRenderer.js";
import { ShadowMapRenderer } from "../classes/renderer/ShadowMapRenderer.js";
import { ReflectionRenderer } from "../classes/renderer/ReflectionRenderer.js";
import { DisplacementRenderer } from "../classes/renderer/DisplacementRenderer.js";

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
      pointColorInput.value = "#ffffff";

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

    case "shadow-map":
      renderer = new ShadowMapRenderer("shadow-map");
      let materialURLS =
        "./materials/" +
        selectedModel.obj.url.split("/")[2].replace(".obj", ".mtl");
      (async (renderer) => {
        const material = await scene.materialManager.loadMtl(materialURLS);
        renderer.setMaterials(material);
        selectedModel.setRenderer(renderer);
      })(renderer);


      break;

    case "point-light":
      renderer = new ModelRenderer("point-light");
      let pointLight = selectedModel.scene.pointLight;
      // Posição da Luz
      const positionDiv = document.createElement("div");
      const positionLabel = document.createElement("label");
      positionLabel.innerText = "Light Position:";
      positionDiv.appendChild(positionLabel);

      ["X", "Y", "Z"].forEach((axis, index) => {
        const positionInput = document.createElement("input");
        positionInput.type = "number";
        positionInput.step = "0.1";
        positionInput.value = pointLight.position[index];
        positionInput.addEventListener("input", () => {
          pointLight.position[index] = parseFloat(positionInput.value);
        });
        positionDiv.appendChild(positionInput);
      });
      additionalControls.appendChild(positionDiv);

      // Atenuação Constante
      const constantDiv = document.createElement("div");
      const constantLabel = document.createElement("label");
      constantLabel.innerText = "Constant Attenuation:";
      const constantInput = document.createElement("input");
      constantInput.type = "number";
      constantInput.step = "0.01";
      constantInput.value = pointLight.constant;
      constantInput.addEventListener("input", () => {
        pointLight.constant = parseFloat(constantInput.value);
      });
      constantDiv.appendChild(constantLabel);
      constantDiv.appendChild(constantInput);
      additionalControls.appendChild(constantDiv);

      // Atenuação Linear
      const linearDiv = document.createElement("div");
      const linearLabel = document.createElement("label");
      linearLabel.innerText = "Linear Attenuation:";
      const linearInput = document.createElement("input");
      linearInput.type = "number";
      linearInput.step = "0.01";
      linearInput.value = pointLight.linear;
      linearInput.addEventListener("input", () => {
        pointLight.linear = parseFloat(linearInput.value);
      });
      linearDiv.appendChild(linearLabel);
      linearDiv.appendChild(linearInput);
      additionalControls.appendChild(linearDiv);

      // Atenuação Quadrática
      const quadraticDiv = document.createElement("div");
      const quadraticLabel = document.createElement("label");
      quadraticLabel.innerText = "Quadratic Attenuation:";
      const quadraticInput = document.createElement("input");
      quadraticInput.type = "number";
      quadraticInput.step = "0.01";
      quadraticInput.value = pointLight.quadratic;
      quadraticInput.addEventListener("input", () => {
        pointLight.quadratic = parseFloat(quadraticInput.value);
      });
      quadraticDiv.appendChild(quadraticLabel);
      quadraticDiv.appendChild(quadraticInput);
      additionalControls.appendChild(quadraticDiv);

      // Cor Ambiente
      const ambientDiv = document.createElement("div");
      const ambientLabel = document.createElement("label");
      ambientLabel.innerText = "Ambient Color:";
      const ambientInput = document.createElement("input");
      ambientInput.type = "color";
      ambientInput.value = "#cccccc"; // Default color
      ambientInput.addEventListener("input", () => {
        const rgbColor = hexToRgb(ambientInput.value);
        pointLight.ambient = rgbColor;
      });
      ambientDiv.appendChild(ambientLabel);
      ambientDiv.appendChild(ambientInput);
      additionalControls.appendChild(ambientDiv);

      // Cor Difusa
      const diffuseDiv = document.createElement("div");
      const diffuseLabel = document.createElement("label");
      diffuseLabel.innerText = "Diffuse Color:";
      const diffuseInput = document.createElement("input");
      diffuseInput.type = "color";
      diffuseInput.value = "#ffffff"; // Default color
      diffuseInput.addEventListener("input", () => {
        const rgbColor = hexToRgb(diffuseInput.value);
        pointLight.diffuse = rgbColor;
      });
      diffuseDiv.appendChild(diffuseLabel);
      diffuseDiv.appendChild(diffuseInput);
      additionalControls.appendChild(diffuseDiv);

      // Cor Especular
      const specularDiv = document.createElement("div");
      const specularLabel = document.createElement("label");
      specularLabel.innerText = "Specular Color:";
      const specularInput = document.createElement("input");
      specularInput.type = "color";
      specularInput.value = "#ffffff"; // Default color
      specularInput.addEventListener("input", () => {
        const rgbColor = hexToRgb(specularInput.value);
        pointLight.specular = rgbColor;
      });
      specularDiv.appendChild(specularLabel);
      specularDiv.appendChild(specularInput);
      additionalControls.appendChild(specularDiv);

      break;

    case "wireframe":
      renderer = new WireframeRenderer("flat");

      const wireframeColorLabel = document.createElement("label");
      wireframeColorLabel.innerText = "Color:";
      const wireframeColorInput = document.createElement("input");
      wireframeColorInput.type = "color";
      wireframeColorInput.value = "#ffffff";

      additionalControls.appendChild(wireframeColorLabel);
      additionalControls.appendChild(wireframeColorInput);

      wireframeColorInput.addEventListener("input", () => {
        const hexColor = wireframeColorInput.value;
        const rgbColor = hexToRgb(hexColor);
        renderer.setColor(rgbColor);
      });
      break;
    case "material":
      renderer = new MaterialRenderer("material");
      let materialURL =
        "./materials/" +
        selectedModel.obj.url.split("/")[2].replace(".obj", ".mtl");
      (async (renderer) => {
        const material = await scene.materialManager.loadMtl(materialURL);
        renderer.setMaterials(material);
        selectedModel.setRenderer(renderer);
        const renderToTextureCheckbox =
          document.getElementById("render-to-texture");

        // Adicionar um event listener para a checkbox
        renderToTextureCheckbox.addEventListener("change", function () {
          const shouldRenderToTexture = renderToTextureCheckbox.checked;
          selectedModel.setRenderToTexture(shouldRenderToTexture);
        });
      })(renderer);

      const ignoreLightDiv = document.createElement("div");
      ignoreLightDiv.classList = ["input-group"];
      // Criar o checkbox para ignorar luzes
      const  ignoreLightLabel = document.createElement("label");
      ignoreLightLabel.innerText = "Ignore Shading:";

      const  ignoreLightCheckbox = document.createElement("input");
      ignoreLightCheckbox.type = "checkbox";

      // Adicionar o label e checkbox no painel de controles adicionais
      ignoreLightDiv.appendChild(ignoreLightLabel);
      ignoreLightDiv.appendChild(ignoreLightCheckbox);
      additionalControls.appendChild(ignoreLightDiv);

      // Adicionar o evento para o checkbox
      ignoreLightCheckbox.addEventListener("change", () => {
        const ignoreLight = ignoreLightCheckbox.checked;
        renderer.setIgnoreLight(ignoreLight);
      });
      break;

    case "reflections":
      renderer = new ReflectionRenderer("reflections");

      const ignoreLightDivR = document.createElement("div");
      ignoreLightDivR.classList = ["input-group"];
      // Criar o checkbox para ignorar luzes
      const ignoreLightLabelR = document.createElement("label");
      ignoreLightLabelR.innerText = "Ignore Shading:";

      const ignoreLightCheckboxR = document.createElement("input");
      ignoreLightCheckboxR.type = "checkbox";

      // Adicionar o label e checkbox no painel de controles adicionais
      ignoreLightDivR.appendChild(ignoreLightLabelR);
      ignoreLightDivR.appendChild(ignoreLightCheckboxR);
      additionalControls.appendChild(ignoreLightDivR);

      // Adicionar o evento para o checkbox
      ignoreLightCheckboxR.addEventListener("change", () => {
        const ignoreLightR = ignoreLightCheckboxR.checked;
        renderer.setIgnoreLight(ignoreLightR);
      });
      break;

    default:
      renderer = new ModelRenderer("default");
      break;
  }

  selectedModel.setRenderer(renderer);
}
