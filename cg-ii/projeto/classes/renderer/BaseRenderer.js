export class BaseRenderer {
  constructor(shaderName) {
    this.shaderName = shaderName;

    this.gl = null;
    this.program = null;
  }
  initLocation(gl, program) {
    if (gl === null) return;
    this.aVertexPosition = gl.getAttribLocation(program, "aPosition");
    this.aVertexNormal = gl.getAttribLocation(program, "aNormal");
    this.uModelMatrix = gl.getUniformLocation(program, "uModelMatrix");
    this.uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
    this.uModelViewProjectionMatrix = gl.getUniformLocation(program, "uModelViewProjectionMatrix");
    this.uNormalMatrix = gl.getUniformLocation(program, "uNormalMatrix");
  }
  updateShader(gl, shaderManager) {
    const program = shaderManager.getProgram(this.shaderName);
    this.init(gl, program);
    gl.useProgram(program);
  }
  init(gl, program) {
    this.gl = gl;
    this.program = program;
    this.initLocation(gl, program);
  }
  draw(model, viewMatrix, projectionMatrix, props = {}) {}
  applyMatrixTransform(
    model,
    viewMatrix,
    projectionMatrix,
    props = {},
    setUniforms = true
  ) {
    for (const prop in props) {
      props[prop].apply(this.program, viewMatrix, projectionMatrix);
    }

    const modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, model.translation);
    mat4.rotateX(modelMatrix, modelMatrix, model.rotation[0]);
    mat4.rotateY(modelMatrix, modelMatrix, model.rotation[1]);
    mat4.rotateZ(modelMatrix, modelMatrix, model.rotation[2]);
    mat4.scale(modelMatrix, modelMatrix, model.scale);
    mat4.translate(modelMatrix, modelMatrix, [
      0,
      -model.center[1],
      -model.center[2],
    ]);

    const modelViewMatrix = mat4.create();
    mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

    const normalMatrix4 = mat4.create();
    mat4.invert(normalMatrix4, modelMatrix);
    mat4.transpose(normalMatrix4, normalMatrix4);

    const normalMatrix = mat3.create();
    mat3.fromMat4(normalMatrix, normalMatrix4);

    const modelViewProjectionMatrix = mat4.create();
    mat4.multiply(modelViewProjectionMatrix, projectionMatrix, modelViewMatrix);

    if (!setUniforms) return;

    if (this.uModelMatrix)
      gl.uniformMatrix4fv(this.uModelMatrix, false, modelMatrix);
    if (this.uModelViewMatrix)
      gl.uniformMatrix4fv(this.uModelViewMatrix, false, modelViewMatrix);
    if (this.uNormalMatrix)
      gl.uniformMatrix3fv(this.uNormalMatrix, false, normalMatrix);
    if (this.uModelViewProjectionMatrix)
      gl.uniformMatrix4fv(
        this.uModelViewProjectionMatrix,
        false,
        modelViewProjectionMatrix
      );
  }
}
