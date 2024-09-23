#version 300 es
precision mediump float;
 
uniform samplerCube uSkybox;
uniform mat4 uViewDirectionProjectionInverse;
 
in vec4 vPosition;
out vec4 fragColor;

void main() {
  vec4 t = uViewDirectionProjectionInverse * vPosition;
  fragColor = texture(uSkybox, normalize(t.xyz / t.w));
}