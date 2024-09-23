#version 300 es

layout(location=0) in vec4 aPosition;
layout(location=1) in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uModelViewProjectionMatrix;
uniform mat3 uNormalMatrix;

out vec3 vNormal;
out vec4 vPosition;

void main() {
   vNormal = normalize(uNormalMatrix * aNormal);
   vPosition = uModelMatrix * aPosition;
   gl_Position = uModelViewProjectionMatrix * aPosition;
}