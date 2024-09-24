#version 300 es
precision highp float;
precision mediump sampler2DShadow;

in vec4 vPositionFromLight;
in vec4 vPosition;
in vec3 vNormal;
in vec2 vTexCoord;

uniform sampler2DShadow uShadowMap;
uniform vec3 uViewWorldPosition; 

struct Material {
    sampler2D normalMap;
    sampler2D diffuseMap;
    sampler2D specularMap;
    float shininess;
    vec3 diffuse;
    vec3 ambient;
    vec3 specular;
};

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

uniform SpotLight spotLight;
uniform float uShadowBias;
uniform Material material;

out vec4 fragColor;

vec3 CalculateSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir, vec2 texCoord, float shadow, Material material) {
    vec3 lightDir = normalize(light.position - fragPos);
    
    float theta = dot(lightDir, normalize(-light.direction));
    float epsilon = light.cutOff - light.outerCutOff;
    float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0);

    float distance = length(light.position - fragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));
    
    vec3 ambient = material.ambient * light.ambient * attenuation * vec3(texture(material.diffuseMap, texCoord));
    vec3 diffuse = material.diffuse * light.diffuse * max(dot(normal, lightDir), 0.0) * attenuation * intensity * vec3(texture(material.diffuseMap, texCoord));
    
    vec3 reflectDir = reflect(-lightDir, normal);
    vec3 specular = material.specular * light.specular * pow(max(dot(viewDir, reflectDir), 0.0), material.shininess) * attenuation * intensity * vec3(texture(material.specularMap, texCoord));

    return ambient + (diffuse + specular) * shadow;
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(uViewWorldPosition - vPosition.xyz);

    // --- Calcular a sombra ---
    vec3 projCoords = vPositionFromLight.xyz / vPositionFromLight.w;
    projCoords = projCoords * 0.5 + 0.5;  // Mapeia de [-1, 1] para [0, 1]

    projCoords.z -= uShadowBias;  // Aplica o bias para evitar o shadow acne

    // Pega a profundidade do shadow map
    float shadow = texture(uShadowMap, projCoords);

    if (projCoords.z > 1.0) {
        shadow = 1.0;
    }

    vec3 lightEffect = CalculateSpotLight(spotLight, normal, vPosition.xyz, viewDir, vTexCoord, shadow, material);

    fragColor = vec4(lightEffect, 1.0);
}
