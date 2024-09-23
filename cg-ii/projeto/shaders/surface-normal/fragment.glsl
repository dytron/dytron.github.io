#version 300 es
precision mediump float;

in vec3 vNormal;
in vec4 vPosition;

out vec4 fragColor;

void main() {
  vec3 normal = normalize(vNormal);
  fragColor = vec4((normal + 1.0) * 0.5, 1.0);
}
