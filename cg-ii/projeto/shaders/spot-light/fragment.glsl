#version 300 es
precision mediump float;

in vec3 vNormal;
in vec4 vPosition;

out vec4 fragColor;

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
uniform vec3 uViewWorldPosition;

vec3 CalculateSpotLight(SpotLight light, vec3 normal, vec3 pos, vec3 viewDir) {
    vec3 lightDir = normalize(light.position - pos);
    
    // Verifica se está dentro do ângulo de corte
    float theta = dot(lightDir, normalize(-light.direction));
    float epsilon = light.cutOff - light.outerCutOff;
    float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0);

    // Atenuação da luz com a distância
    float distance = length(light.position - pos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));
    
    // Componentes de iluminação
    vec3 ambient = light.ambient * attenuation;
    vec3 diffuse = light.diffuse * max(dot(normal, lightDir), 0.0) * attenuation * intensity;
    vec3 specular = light.specular * pow(max(dot(viewDir, reflect(-lightDir, normal)), 0.0), 32.0) * attenuation * intensity;
    
    return ambient + diffuse + specular;
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(uViewWorldPosition - vPosition.xyz);

    // Calcula a iluminação usando a SpotLight
    vec3 result = CalculateSpotLight(spotLight, normal, vPosition.xyz, viewDir);
    fragColor = vec4(result, 1.0);
}
