#version 300 es
precision highp float;

layout(location = 0) in vec4 aPosition;
layout(location = 1) in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uModelViewProjectionMatrix;
uniform mat3 uNormalMatrix;

out vec4 vPosition;
out vec3 vNormal;

void main() {
    // Calcula a posição final do vértice no espaço do mundo
    vPosition = uModelMatrix * aPosition;

    // Normal transformada para o espaço do mundo
    vNormal = normalize(uNormalMatrix * aNormal);
   
    // Calcula a posição final do vértice para o espaço de recorte
    gl_Position = uModelViewProjectionMatrix * aPosition;
}
