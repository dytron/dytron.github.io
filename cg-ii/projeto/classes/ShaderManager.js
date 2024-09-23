export class ShaderManager {
  constructor() {
    this.shaders = {};
    this.shaderNames = [];
    this.program = {};
  }
  setShaders(names) {
    this.shaderNames = names;
  }
  setProgram(shader, program) {
    this.program[shader] = program;
  }
  getProgram(shader) {
    return this.program[shader];
  }
  async loadTextFile(url) {
    const response = await fetch(url);
    const text = await response.text();
    return {
      url,
      text,
    };
  }
  async loadAll() {
    let urls = [];
    for (let shader of this.shaderNames) {
      urls.push(`./shaders/${shader}/fragment.glsl`);
      urls.push(`./shaders/${shader}/vertex.glsl`);
    }
    const files = await Promise.all(urls.map(this.loadTextFile));
    for (let file of files) {
      let shader = file.url.match(/shaders\/(.+?)\//)[1];
      let type = file.url.match(/shaders\/([^/]+)\/([^/]+)\.glsl$/)?.[2];
      if (!this.shaders[shader]) this.shaders[shader] = {};
      this.shaders[shader][type] = file.text;
    }
  }
  getSources(shader) {
    if (!this.shaders[shader]) {
      throw new Error(`Shader "${shader}" not found in shaders map.`);
    }

    const vertexSource = this.shaders[shader].vertex;
    const fragmentSource = this.shaders[shader].fragment;

    if (!vertexSource || !fragmentSource) {
      throw new Error(
        `Shader "${shader}" is missing vertex or fragment source.`
      );
    }

    return [vertexSource, fragmentSource];
  }
}
