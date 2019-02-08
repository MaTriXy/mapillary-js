#ifdef GL_ES
precision highp float;
#endif

uniform mat4 projectorMat;

varying vec4 vRstq;
varying vec4 cameraCoords;

void main()
{
    vRstq = projectorMat * vec4(position, 1.0);
    cameraCoords = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}