#version 300 es
precision highp float;
layout(location = 0) in vec4 aPosition;
layout(location = 1) in vec2 aTexCoord;
out vec2 vTexCoord;
out vec4 vPosition;

void main() {
    vTexCoord = aTexCoord;
    vPosition = aPosition;
    gl_Position = aPosition;
}