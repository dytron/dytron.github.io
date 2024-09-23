#version 300 es
precision highp float;
precision mediump sampler2DShadow;

in vec4 vPositionFromLight;  // Posição no espaço da luz
in vec4 vPosition;      // Posição no espaço do mundo
in vec3 vNormal;             // Normal no espaço do mundo

uniform sampler2DShadow uShadowMap;  // Shadow map (profundidade da luz)
uniform vec3 uViewWorldPosition;     // Posição da câmera no espaço do mundo

struct SpotLight {
    vec3 position;
    vec3 direction;
    
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    
    float constant;
    float linear;
    float quadratic;
    
    float cutOff;
    float outerCutOff;
};

uniform SpotLight spotLight;          // SpotLight da cena
uniform float uShadowBias;            // Bias para ajustar a profundidade da sombra

out vec4 fragColor;

vec3 CalculateSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir, float shadow) {
    vec3 lightDir = normalize(light.position - fragPos);
    
    // Verifica se está dentro do ângulo de corte
    float theta = dot(lightDir, normalize(-light.direction));
    float epsilon = light.cutOff - light.outerCutOff;
    float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0);

    // Atenuação da luz com a distância
    float distance = length(light.position - fragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));
    
    // Componentes de iluminação
    vec3 ambient = light.ambient * attenuation;
    vec3 diffuse = light.diffuse * max(dot(normal, lightDir), 0.0) * attenuation * intensity;
    vec3 specular = light.specular * pow(max(dot(viewDir, reflect(-lightDir, normal)), 0.0), 32.0) * attenuation * intensity;
    
    return ambient + (diffuse + specular) * shadow;
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(uViewWorldPosition - vPosition.xyz);


    // --- Calcular a sombra ---

    // Converte para coordenadas de textura para o shadow map
    vec3 projCoords = vPositionFromLight.xyz / vPositionFromLight.w;
    projCoords = projCoords * 0.5 + 0.5;  // Mapeia de [-1, 1] para [0, 1]

    // Aplica o bias para evitar o shadow acne
    projCoords.z -= 0.001;

    // Pega a profundidade do shadow map
    float shadow = texture(uShadowMap, projCoords);

    // Se estiver fora do shadow map, a sombra é 1 (nenhuma sombra)
    if (projCoords.z > 1.0) {
        shadow = 1.0;
    }

    // Calcula a iluminação usando a SpotLight
    vec3 lightEffect = CalculateSpotLight(spotLight, normal, vPosition.xyz, viewDir, shadow);

    fragColor = vec4(lightEffect, 1.0);
}
