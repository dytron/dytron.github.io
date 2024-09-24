import { ModelRenderer } from "../classes/renderer/ModelRenderer.js";
import { PointRenderer } from "../classes/renderer/PointRenderer.js";
import { FlatRenderer } from "../classes/renderer/FlatRenderer.js";
import { ShadowMapRenderer } from "../classes/renderer/ShadowMapRenderer.js";
import { MaterialRenderer } from "../classes/renderer/MaterialRenderer.js";

export function configureScene(scene) {
  //
}

export function configureModels(scene) {
  // Carrega os objetos
  scene.importOBJ("teapot");
  scene.importOBJ("cube");

  // Configura os modelos
  const teapot = scene
    .addModelFromOBJ("teapot")
    .autoCenter()
    .setScale([0.02, 0.02, 0.02])
    .setRotationX(-Math.PI / 2)
    .setRenderer(new ModelRenderer("default"))

  const cube = scene
    .addModelFromOBJ("cube")
    .autoCenter()
    .setScale([1, 0.01, 1])
    .setPosition([0, -0.16, 0])
    .setRenderer(new ModelRenderer("default"))
    .setCastShadows(false);


  const models = [teapot, cube];

  scene.shaderManager.setShaders([
    "default",
    "surface-normal",
    "point",
    "flat",
    "material",
    "cube-map",
    "depth-map",
    "reflections",
    "shadow-map",
    "quad-shadow",
  ]);

  return models;
}
