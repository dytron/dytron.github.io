#version 300 es
precision highp float;

// Dados recebidos do vertex shader
in vec4 vPosition;
in vec3 vNormal;

// O cubemap (textura)
uniform samplerCube uSkybox;

// A posição da câmera no mundo
uniform vec3 uViewWorldPosition;

out vec4 fragColor;

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
uniform DirectionalLight lightDirection;
uniform PointLight pointLights[NUM_POINT_LIGHTS];
uniform SpotLight spotLight;
uniform float uIgnoreLight;

vec3 CalculateDirectionalLight(DirectionalLight light, vec3 normal, vec3 viewDir) {
    vec3 lightDir = normalize(-light.direction);
    float kd = max(dot(normal, lightDir), 0.0f);

    float ks = pow(max(dot(normal, lightDir), 0.0f), 1.0f);

    vec3 ambient = light.ambient;
    vec3 diffuse = light.diffuse * kd;
    vec3 specular = light.specular * ks;

    return (ambient + diffuse + specular);
}

vec3 CalculatePointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir) {
    vec3 lightDir = normalize(light.position - fragPos);
    float distance = length(light.position - fragPos);
    float attenuation = 1.0f / (light.constant + light.linear * distance + light.quadratic * (distance * distance));

    float kd = max(dot(normal, lightDir), 0.0f);

    float ks = pow(max(dot(normal, lightDir), 0.0f), 1.0f);

    vec3 ambient = light.ambient * attenuation;
    vec3 diffuse = light.diffuse * kd * attenuation;
    vec3 specular = light.specular * ks * attenuation;

    return (ambient + diffuse + specular) ;
}

vec3 CalculateSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir) {
    vec3 lightDir = normalize(light.position - fragPos);
    float distance = length(light.position - fragPos);
    float attenuation = 1.0f / (light.constant + light.linear * distance + light.quadratic * (distance * distance));

    // Ângulo de corte do spot light
    float theta = dot(lightDir, normalize(-light.direction));
    float epsilon = light.cutOff - light.outerCutOff;
    float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0f, 1.0f);

    float kd = max(dot(normal, lightDir), 0.0f);
    float ks = pow(max(dot(normal, lightDir), 0.0f), 1.0f);

    vec3 ambient = light.ambient * attenuation;
    vec3 diffuse = light.diffuse * kd * attenuation * intensity;
    vec3 specular = light.specular * ks * attenuation * intensity;

    return (ambient + diffuse + specular);
}

void main() {
    // Normaliza a normal interpolada
    vec3 normal = normalize(vNormal) * (float(gl_FrontFacing) * 2.0f - 1.0f);
    vec3 viewDir = normalize(uViewWorldPosition - vPosition.xyz);

    // Calcular a luz direcional
    vec3 result = lightDirection.enabled * CalculateDirectionalLight(lightDirection, normal, viewDir);

    // Adicionar a contribuição de todas as Point Lights
    for(int i = 0; i < NUM_POINT_LIGHTS; i++) {
        result += pointLights[i].enabled * CalculatePointLight(pointLights[i], normal, vPosition.xyz, viewDir);
    }

    vec3 reflectionDir = reflect(-viewDir, normal);

    // Adicionar a contribuição da Spot Light
    result += spotLight.enabled * CalculateSpotLight(spotLight, normal, vPosition.xyz, viewDir);
    
    float ks = pow(max(dot(normal, reflectionDir), 0.0f), 1.0f);
    result *= vec3(texture(uSkybox, reflectionDir));

    // Mostrar só reflexo se ignoreLight = 1.0
    result -= uIgnoreLight*result;
    result += uIgnoreLight*vec3(texture(uSkybox, reflectionDir));


    fragColor = vec4(result, 1.0f);
}
