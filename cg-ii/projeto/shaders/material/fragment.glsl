#version 300 es
precision mediump float;

in vec2 vTexCoord;
in vec3 vNormal;
in vec3 vTangent;
in vec4 vPosition;

out vec4 fragColor;

struct Material {
    sampler2D normalMap;
    sampler2D diffuseMap;
    sampler2D specularMap;
    float shininess;
    vec3 diffuse;
    vec3 ambient;
    vec3 specular;
};

struct DirectionalLight {
    float enabled;
    vec3 direction;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

struct PointLight {
    float enabled;
    vec3 position;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;

    float constant;
    float linear;
    float quadratic;
};

struct SpotLight {
    float enabled;
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

#define NUM_POINT_LIGHTS 4

uniform float uIgnoreLight;
uniform vec3 uViewWorldPosition;
uniform DirectionalLight lightDirection;
uniform PointLight pointLights[NUM_POINT_LIGHTS];
uniform SpotLight spotLight;
uniform Material material;

vec3 CalculateDirectionalLight(DirectionalLight light, vec3 normal, vec3 viewDir, vec2 texCoord, Material material) {
    vec3 dir = normalize(-light.direction);
    float kd = max(dot(normal, dir), 0.0f);

    vec3 halfwayDir = normalize(dir + viewDir);
    float ks = pow(max(dot(normal, halfwayDir), 0.0f), material.shininess);

    vec3 ambient = material.ambient * light.ambient * vec3(texture(material.diffuseMap, texCoord));
    vec3 diffuse = material.diffuse * light.diffuse * kd * vec3(texture(material.diffuseMap, texCoord));
    vec3 specular = material.specular * light.specular * ks * vec3(texture(material.specularMap, texCoord));

    return (ambient + diffuse + specular);
}

vec3 CalculatePointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir, vec2 texCoord, Material material) {
    vec3 lightDir = normalize(light.position - fragPos);
    float distance = length(light.position - fragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));

    float kd = max(dot(normal, lightDir), 0.0);
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float ks = pow(max(dot(normal, halfwayDir), 0.0), material.shininess);

    vec3 ambient = material.ambient * light.ambient * attenuation * vec3(texture(material.diffuseMap, texCoord));
    vec3 diffuse = material.diffuse * light.diffuse * kd * attenuation * vec3(texture(material.diffuseMap, texCoord));
    vec3 specular = material.specular * light.specular * ks * attenuation * vec3(texture(material.specularMap, texCoord));

    return (ambient + diffuse + specular);
}

vec3 CalculateSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir, vec2 texCoord, Material material) {
    vec3 lightDir = normalize(light.position - fragPos);
    float distance = length(light.position - fragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));

    // Ângulo de corte do spot light
    float theta = dot(lightDir, normalize(-light.direction));
    float epsilon = light.cutOff - light.outerCutOff;
    float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0);

    float kd = max(dot(normal, lightDir), 0.0);
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float ks = pow(max(dot(normal, halfwayDir), 0.0), material.shininess);

    vec3 ambient = material.ambient * light.ambient * attenuation * vec3(texture(material.diffuseMap, texCoord));
    vec3 diffuse = material.diffuse * light.diffuse * kd * attenuation * intensity * vec3(texture(material.diffuseMap, texCoord));
    vec3 specular = material.specular * light.specular * ks * attenuation * intensity * vec3(texture(material.specularMap, texCoord));

    return (ambient + diffuse + specular);
}

void main() {
    vec3 normal = normalize(vNormal) * (float(gl_FrontFacing) * 2.0 - 1.0);
    vec3 tangent = normalize(vTangent) * (float(gl_FrontFacing) * 2.0 - 1.0);
    vec3 bitangent = normalize(cross(normal, tangent));

    mat3 tbn = mat3(tangent, bitangent, normal);
    normal = texture(material.normalMap, vTexCoord).rgb * 2.0f - 1.0f;
    normal = normalize(tbn * normal);

    vec3 viewDir = normalize(uViewWorldPosition - vPosition.xyz);

    // Calcular a luz direcional
    vec3 result = lightDirection.enabled * CalculateDirectionalLight(lightDirection, normal, viewDir, vTexCoord, material);

    // Adicionar a contribuição de todas as Point Lights
    for (int i = 0; i < NUM_POINT_LIGHTS; i++) {
        result += pointLights[i].enabled * CalculatePointLight(pointLights[i], normal, vPosition.xyz, viewDir, vTexCoord, material);
    }

    // Adicionar a contribuição da Spot Light
    result += spotLight.enabled * CalculateSpotLight(spotLight, normal, vPosition.xyz, viewDir, vTexCoord, material);
    result -= uIgnoreLight * result;
    result += uIgnoreLight * vec3(texture(material.diffuseMap, vTexCoord));
    fragColor = vec4(result, 1.0f);
}
