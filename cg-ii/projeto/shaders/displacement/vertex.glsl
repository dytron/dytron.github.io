#version 300 es

layout(location = 0) in vec4 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aTexCoord;
layout(location = 3) in vec3 aTangent;

uniform mat4 uModelMatrix;
uniform mat4 uModelViewProjectionMatrix;
uniform mat4 uTransposeInverseModel; // Matriz transposta inversa do modelo para normais
uniform mat3 uNormalMatrix;          // Matriz de normais
uniform sampler2D displacementMap;
uniform float displacementScale;
uniform vec3 uViewWorldPosition;

out vec3 vNormal;
out vec3 vPosition;
out vec2 vTexCoord;
out vec3 vTangent;
out vec3 vBitangent;
out vec3 vWorldPos;
out vec3 vViewWorldPosition;

void main() {
    // Transformações das normais e tangentes para o espaço do mundo
    vec3 N = normalize(mat3(uTransposeInverseModel) * aNormal);
    vec3 T = normalize(mat3(uModelMatrix) * aTangent);
    T = normalize(T - dot(T, N) * N); // Re-ortogonalizar T com N
    vec3 B = cross(N, T);  // Calcula o bitangente

    // Matriz TBN (Tangente, Bitangente, Normal)
    mat3 TBN = transpose(mat3(T, B, N));

    // Amostra o deslocamento do mapa de displacement usando as coordenadas de textura
    float displacement = texture(displacementMap, aTexCoord).r * displacementScale;

    // Calcula a posição deslocada usando a posição original e a normal
    vec3 displacedPosition = aPosition.xyz + N * displacement;

    // Saídas para o fragment shader
    vNormal = N;
    vTangent = T;
    vBitangent = B;
    vTexCoord = aTexCoord;

    // Transforma a posição deslocada pelo model matrix para obter a posição no mundo
    vWorldPos = vec3(uModelMatrix * vec4(displacedPosition, 1.0));
    vViewWorldPosition = uViewWorldPosition;

    // Calcula a posição final com a matriz de model-view-projection
    gl_Position = uModelViewProjectionMatrix * vec4(displacedPosition, 1.0);
}
