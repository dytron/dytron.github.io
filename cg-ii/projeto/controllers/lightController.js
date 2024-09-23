import { hexToRgb } from "../utils/colorUtils.js";
import { updateUIPointLightInputs } from "../utils/domUtils.js";
import { degreesToRadians } from "../utils/mathUtils.js";

export function setupLightControls(scene) {
    // Atualiza a Directional Light
    function updateDirectionalLight() {
        scene.directionalLight.enabled = document.getElementById("dir-light-active").checked;
        scene.directionalLight.setDirection([
            parseFloat(document.getElementById("dir-light-dir-x").value),
            parseFloat(document.getElementById("dir-light-dir-y").value),
            parseFloat(document.getElementById("dir-light-dir-z").value),
        ]);
        scene.directionalLight.ambient = hexToRgb(document.getElementById("dir-light-ambient").value);
        scene.directionalLight.diffuse = hexToRgb(document.getElementById("dir-light-diffuse").value);
        scene.directionalLight.specular = hexToRgb(document.getElementById("dir-light-specular").value);
    }

    // Atualiza a Point Light selecionada
    function updatePointLight() {
        const selectedIndex = document.getElementById("point-light-select").value.split('-').pop() - 1;
        const pointLight = scene.pointLight[selectedIndex];
        
        pointLight.enabled = document.getElementById("point-light-active").checked;
        pointLight.setPosition([
            parseFloat(document.getElementById("point-light-pos-x").value),
            parseFloat(document.getElementById("point-light-pos-y").value),
            parseFloat(document.getElementById("point-light-pos-z").value),
        ]);
        pointLight.ambient = hexToRgb(document.getElementById("point-light-ambient").value);
        pointLight.diffuse = hexToRgb(document.getElementById("point-light-diffuse").value);
        pointLight.specular = hexToRgb(document.getElementById("point-light-specular").value);
        pointLight.constant = parseFloat(document.getElementById("point-light-constant").value);
        pointLight.linear = parseFloat(document.getElementById("point-light-linear").value);
        pointLight.quadratic = parseFloat(document.getElementById("point-light-quadratic").value);
    }

    // Atualiza a Spot Light
    function updateSpotLight() {
        scene.spotLight.enabled = document.getElementById("spot-light-active").checked;
        scene.spotLight.setPosition([
            parseFloat(document.getElementById("spot-light-pos-x").value),
            parseFloat(document.getElementById("spot-light-pos-y").value),
            parseFloat(document.getElementById("spot-light-pos-z").value),
        ]);
        scene.spotLight.setDirection([
            parseFloat(document.getElementById("spot-light-dir-x").value),
            parseFloat(document.getElementById("spot-light-dir-y").value),
            parseFloat(document.getElementById("spot-light-dir-z").value),
        ]);
        scene.spotLight.ambient = hexToRgb(document.getElementById("spot-light-ambient").value);
        scene.spotLight.diffuse = hexToRgb(document.getElementById("spot-light-diffuse").value);
        scene.spotLight.specular = hexToRgb(document.getElementById("spot-light-specular").value);
        scene.spotLight.constant = parseFloat(document.getElementById("spot-light-constant").value);
        scene.spotLight.linear = parseFloat(document.getElementById("spot-light-linear").value);
        scene.spotLight.quadratic = parseFloat(document.getElementById("spot-light-quadratic").value);
        scene.spotLight.cutOff = Math.cos(degreesToRadians(parseFloat(document.getElementById("spot-light-cutoff").value)));
        scene.spotLight.outerCutOff = Math.cos(degreesToRadians(parseFloat(document.getElementById("spot-light-outer-cutoff").value)));
    }



    // Event listeners para a Directional Light
    document.getElementById("dir-light-active").addEventListener("change", updateDirectionalLight);
    document.getElementById("dir-light-dir-x").addEventListener("input", updateDirectionalLight);
    document.getElementById("dir-light-dir-y").addEventListener("input", updateDirectionalLight);
    document.getElementById("dir-light-dir-z").addEventListener("input", updateDirectionalLight);
    document.getElementById("dir-light-ambient").addEventListener("input", updateDirectionalLight);
    document.getElementById("dir-light-diffuse").addEventListener("input", updateDirectionalLight);
    document.getElementById("dir-light-specular").addEventListener("input", updateDirectionalLight);

    // Event listeners para a Point Light
    document.getElementById("point-light-select").addEventListener("change", function() {
        const selectedIndex = this.value.split('-').pop() - 1;  // Extrair o índice da opção selecionada
        updateUIPointLightInputs(scene, selectedIndex);
    });
    document.getElementById("point-light-active").addEventListener("change", updatePointLight);
    document.getElementById("point-light-pos-x").addEventListener("input", updatePointLight);
    document.getElementById("point-light-pos-y").addEventListener("input", updatePointLight);
    document.getElementById("point-light-pos-z").addEventListener("input", updatePointLight);
    document.getElementById("point-light-ambient").addEventListener("input", updatePointLight);
    document.getElementById("point-light-diffuse").addEventListener("input", updatePointLight);
    document.getElementById("point-light-specular").addEventListener("input", updatePointLight);
    document.getElementById("point-light-constant").addEventListener("input", updatePointLight);
    document.getElementById("point-light-linear").addEventListener("input", updatePointLight);
    document.getElementById("point-light-quadratic").addEventListener("input", updatePointLight);

    // Event listeners para a Spot Light
    document.getElementById("spot-light-active").addEventListener("change", updateSpotLight);
    document.getElementById("spot-light-pos-x").addEventListener("input", updateSpotLight);
    document.getElementById("spot-light-pos-y").addEventListener("input", updateSpotLight);
    document.getElementById("spot-light-pos-z").addEventListener("input", updateSpotLight);
    document.getElementById("spot-light-dir-x").addEventListener("input", updateSpotLight);
    document.getElementById("spot-light-dir-y").addEventListener("input", updateSpotLight);
    document.getElementById("spot-light-dir-z").addEventListener("input", updateSpotLight);
    document.getElementById("spot-light-ambient").addEventListener("input", updateSpotLight);
    document.getElementById("spot-light-diffuse").addEventListener("input", updateSpotLight);
    document.getElementById("spot-light-specular").addEventListener("input", updateSpotLight);
    document.getElementById("spot-light-constant").addEventListener("input", updateSpotLight);
    document.getElementById("spot-light-linear").addEventListener("input", updateSpotLight);
    document.getElementById("spot-light-quadratic").addEventListener("input", updateSpotLight);
    document.getElementById("spot-light-cutoff").addEventListener("input", updateSpotLight);
    document.getElementById("spot-light-outer-cutoff").addEventListener("input", updateSpotLight);


}