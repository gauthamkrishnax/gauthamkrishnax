uniform float utime;
uniform float u_patternScale;
uniform float u_patternBias1;
uniform float u_patternBias2;
uniform vec3 u_firstColor;
uniform vec3 u_secondColor;
uniform vec3 u_accentColor;
varying vec3 v_pos;


float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise31(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);
    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);
    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);
    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));
    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);
    return o4.y * d.y + o4.x * (1.0 - d.y);
}


float lines(vec2 uv, float offset) {
  float val = abs(0.5 * (sin(uv.x * 30.0) + offset * 2.0));
  return smoothstep(0.0, 0.5 + offset * 0.5, val);
}
mat2 rotate2D(float angle) {
  return mat2(
    cos(angle), -sin(angle),
    sin(angle), cos(angle)
  );
}
void main() {
  vec3 t_pos = v_pos * 0.5;  
  float n = noise31(v_pos - utime * 0.2);
  vec2 baseUV = (rotate2D(n) * t_pos.xy  * u_patternScale);
  float basePattern = lines(baseUV, u_patternBias1);
  float secondPattern = lines(baseUV, u_patternBias2);
  vec3 baseColor = mix(u_secondColor, u_firstColor, basePattern);
  vec3 secondBaseColor = mix(baseColor, u_accentColor, secondPattern);
  gl_FragColor = vec4(secondBaseColor, 1.0);
}
