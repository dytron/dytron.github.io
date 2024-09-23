import { degreesToRadians, radiansToDegrees } from "./mathUtils.js";

export function updateUICameraInputs(camera) {
    document.getElementById("cam-pos-x").value = camera.position[0];
    document.getElementById("cam-pos-y").value = camera.position[1];
    document.getElementById("cam-pos-z").value = camera.position[2];

    document.getElementById("cam-target-x").value = camera.target[0];
    document.getElementById("cam-target-y").value = camera.target[1];
    document.getElementById("cam-target-z").value = camera.target[2];

    document.getElementById("cam-up-x").value = camera.upVector[0];
    document.getElementById("cam-up-y").value = camera.upVector[1];
    document.getElementById("cam-up-z").value = camera.upVector[2];

    document.getElementById("cam-rot-x").value = radiansToDegrees(
        camera.rotation[0]
    );
    document.getElementById("cam-rot-y").value = radiansToDegrees(
        camera.rotation[1]
    );
    document.getElementById("cam-rot-z").value = radiansToDegrees(
        camera.rotation[2]
    );

    document.getElementById("cam-fov").value = camera.fov;
    document.getElementById("cam-aspect").value = camera.aspect;
}

export function updateSelectedModelPosition(models) {
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

export function updateSelectedModelRotation(models) {
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

export function updateSelectedModelScale(models) {
    const objectSelect = document.getElementById("object-select");
    const selectedModel = models[objectSelect.value];

    selectedModel.scale[0] = parseFloat(document.getElementById("scale-x").value);
    selectedModel.scale[1] = parseFloat(document.getElementById("scale-y").value);
    selectedModel.scale[2] = parseFloat(document.getElementById("scale-z").value);
}

export function populateObjectList(models) {
    const objectSelect = document.getElementById("object-select");
    objectSelect.innerHTML = ""; // Limpa o select antes de popular
    models.forEach((model, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.text = model.name;
//        option.text = `Object ${index + 1}`;
        objectSelect.add(option);
    });
}
export function updateUIForSelectedObject(models) {
    const objectSelect = document.getElementById("object-select");
    const selectedModel = models[objectSelect.value];

    if (!selectedModel) {
        console.error("Modelo selecionado é indefinido ou não foi encontrado.");
        return;
    }

    if (!selectedModel.translation) {
        console.error("A propriedade 'translation' não está definida no modelo selecionado.");
        return;
    }

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
    const rendererSelect = document.getElementById("renderer-select");
    if (selectedModel.renderer) {
        rendererSelect.value = selectedModel.renderer.shaderName || "default";
    } else {
        rendererSelect.value = "default";
    }

    // Atualiza o checkbox de render to texture
    document.getElementById("render-to-texture").checked = !!selectedModel.renderToTexture;
}

export function updateUILightingInputs(scene) {
    // Atualiza Directional Light
    const dirLight = scene.directionalLight;
    document.getElementById("dir-light-active").checked = dirLight.enabled;
    document.getElementById("dir-light-dir-x").value = dirLight.direction[0];
    document.getElementById("dir-light-dir-y").value = dirLight.direction[1];
    document.getElementById("dir-light-dir-z").value = dirLight.direction[2];
    document.getElementById("dir-light-ambient").value = rgbToHex(dirLight.ambient);
    document.getElementById("dir-light-diffuse").value = rgbToHex(dirLight.diffuse);
    document.getElementById("dir-light-specular").value = rgbToHex(dirLight.specular);

    // Atualiza Point Light
    const selectedIndex = document.getElementById("point-light-select").value.split('-').pop() - 1;
    const pointLight = scene.pointLight[selectedIndex];
    document.getElementById("point-light-active").checked = pointLight.enabled;
    document.getElementById("point-light-pos-x").value = pointLight.position[0];
    document.getElementById("point-light-pos-y").value = pointLight.position[1];
    document.getElementById("point-light-pos-z").value = pointLight.position[2];
    document.getElementById("point-light-ambient").value = rgbToHex(pointLight.ambient);
    document.getElementById("point-light-diffuse").value = rgbToHex(pointLight.diffuse);
    document.getElementById("point-light-specular").value = rgbToHex(pointLight.specular);
    document.getElementById("point-light-constant").value = pointLight.constant;
    document.getElementById("point-light-linear").value = pointLight.linear;
    document.getElementById("point-light-quadratic").value = pointLight.quadratic;

    // Atualiza Spot Light
    const spotLight = scene.spotLight;
    document.getElementById("spot-light-active").checked = spotLight.enabled;
    document.getElementById("spot-light-pos-x").value = spotLight.position[0];
    document.getElementById("spot-light-pos-y").value = spotLight.position[1];
    document.getElementById("spot-light-pos-z").value = spotLight.position[2];
    document.getElementById("spot-light-dir-x").value = spotLight.direction[0];
    document.getElementById("spot-light-dir-y").value = spotLight.direction[1];
    document.getElementById("spot-light-dir-z").value = spotLight.direction[2];
    document.getElementById("spot-light-ambient").value = rgbToHex(spotLight.ambient);
    document.getElementById("spot-light-diffuse").value = rgbToHex(spotLight.diffuse);
    document.getElementById("spot-light-specular").value = rgbToHex(spotLight.specular);
    document.getElementById("spot-light-constant").value = spotLight.constant;
    document.getElementById("spot-light-linear").value = spotLight.linear;
    document.getElementById("spot-light-quadratic").value = spotLight.quadratic;
    document.getElementById("spot-light-cutoff").value = radiansToDegrees(Math.acos(scene.spotLight.cutOff));
    document.getElementById("spot-light-outer-cutoff").value = radiansToDegrees(Math.acos(scene.spotLight.outerCutOff));
    
}
export function updateUIPointLightInputs(scene, selectedIndex) {
    const pointLight = scene.pointLight[selectedIndex];
    
    document.getElementById("point-light-active").checked = pointLight.enabled;
    document.getElementById("point-light-pos-x").value = pointLight.position[0];
    document.getElementById("point-light-pos-y").value = pointLight.position[1];
    document.getElementById("point-light-pos-z").value = pointLight.position[2];
    document.getElementById("point-light-ambient").value = rgbToHex(pointLight.ambient);
    document.getElementById("point-light-diffuse").value = rgbToHex(pointLight.diffuse);
    document.getElementById("point-light-specular").value = rgbToHex(pointLight.specular);
    document.getElementById("point-light-constant").value = pointLight.constant;
    document.getElementById("point-light-linear").value = pointLight.linear;
    document.getElementById("point-light-quadratic").value = pointLight.quadratic;
}


// Função auxiliar para converter RGB para HEX
function rgbToHex(rgb) {
    const [r, g, b] = rgb.map(val => Math.round(val * 255));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}
export function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r / 255, g / 255, b / 255, alpha]; // Retorna com alpha fixo
}