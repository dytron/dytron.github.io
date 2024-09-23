#version 300 es
precision highp float;

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec3 aNormal;

uniform mat4 uModelMatrix;           // Matriz do modelo
uniform mat4 uModelViewProjectionMatrix; // MVP da câmera
uniform mat4 uLightViewProjectionMatrix;  // MVP da luz (para gerar as coordenadas de sombra)
uniform mat3 uNormalMatrix;          // Matriz normal para corrigir a direção das normais

out vec3 vNormal;
out vec4 vPositionFromLight; // Posição no espaço da luz para verificar a sombra
out vec4 vPosition;     // Posição no espaço de mundo

void main() {
    // Posição no espaço da luz (para acessar o shadow map)
    vPositionFromLight = uLightViewProjectionMatrix * uModelMatrix * aPosition;

    // Posição no espaço do mundo para usar na iluminação
    vPosition = uModelMatrix * aPosition;

    // Corrige a normal no espaço do mundo
    vNormal = normalize(uNormalMatrix * aNormal);

    // Define a posição final do vértice no espaço da câmera
    gl_Position = uModelViewProjectionMatrix * aPosition;
}
