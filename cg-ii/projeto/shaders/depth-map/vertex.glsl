#version 300 es
precision mediump float;

layout (location = 0) in vec4 aPosition; // Posição do vértice

uniform mat4 uLightViewProjectionMatrix; // Matriz de projeção e visualização da luz (MVP da luz)
uniform mat4 uModelMatrix;               // Matriz de modelo

void main() {
    // Transforma o vértice para o espaço da luz (MVP da luz)
    gl_Position = uLightViewProjectionMatrix * uModelMatrix * aPosition;
}
