#version 300 es

layout(location = 0) in vec4 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aTexCoord;
layout(location = 3) in vec3 aTangent;

uniform mat4 uModelMatrix;
uniform mat4 uModelViewProjectionMatrix;
uniform mat3 uNormalMatrix;

out vec3 vNormal;
out vec4 vPosition;
out vec2 vTexCoord;
out vec3 vTangent;

void main() {
   vNormal = normalize(uNormalMatrix * aNormal);
   vPosition = uModelMatrix * aPosition;

   vTangent = normalize(uNormalMatrix * aTangent);

   vTexCoord = aTexCoord;
   gl_Position = uModelViewProjectionMatrix * aPosition;
}