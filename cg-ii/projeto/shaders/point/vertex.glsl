#version 300 es

layout(location=0) in vec4 aPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uModelViewProjectionMatrix;
uniform float uPointSize; // Tamanho do ponto

void main() {
   gl_Position = uModelViewProjectionMatrix * aPosition;
   gl_PointSize = uPointSize; // Define o tamanho do ponto
}
