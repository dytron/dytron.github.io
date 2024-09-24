#version 300 es
precision highp float;

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aTexCoord;
//layout(location = 3) in vec3 aTangent;

uniform mat4 uModelMatrix;
uniform mat4 uModelViewProjectionMatrix;
uniform mat4 uLightViewProjectionMatrix; 
uniform mat3 uNormalMatrix;

out vec3 vNormal;
//out vec3 vTangent;
out vec4 vPositionFromLight;
out vec4 vPosition;
out vec2 vTexCoord;

void main() {
    vPositionFromLight = uLightViewProjectionMatrix * uModelMatrix * aPosition;

    vPosition = uModelMatrix * aPosition;

    //vTangent = normalize(uNormalMatrix * aTangent);

    vTexCoord = aTexCoord;
    vNormal = normalize(uNormalMatrix * aNormal);

    gl_Position = uModelViewProjectionMatrix * aPosition;
}
