#version 300 es
precision mediump float;

in vec3 vNormal;
in vec4 vPosition;

out vec4 fragColor;

struct PointLight {
    vec3 position;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;

    float constant;
    float linear;
    float quadratic;
};

uniform PointLight pointLight;
uniform vec3 uViewWorldPosition;

vec3 CalculatePointLight(PointLight light, vec3 normal, vec3 pos, vec3 viewDir) {
    vec3 lightDir = normalize(light.position - pos);
    float kd = max(dot(normal, lightDir), 0.0);

    vec3 halfwayDir = normalize(lightDir + viewDir);
    float ks = pow(max(dot(normal, halfwayDir), 0.0), 32.0);

    // specular
    //vec3 reflectDir = reflect(-lightDir, normal);
    //float ks = pow(max(dot(viewDir, reflectDir), 0.0f), 32.0);

    // Atenuação (diminuição da intensidade com a distância)
    float distance = length(light.position - pos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));

    vec3 ambient = light.ambient * attenuation;
    vec3 diffuse = light.diffuse * kd * attenuation;
    vec3 specular = light.specular * ks * attenuation;

    return (ambient + diffuse + specular);
}

void main() {
    vec3 normal = normalize(vNormal) ;
    vec3 viewDir = normalize(uViewWorldPosition - vPosition.xyz);
    vec3 result = CalculatePointLight(pointLight, normal, vPosition.xyz, viewDir);
    fragColor = vec4(result, 1.0);
}
