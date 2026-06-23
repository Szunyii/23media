"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2  uRes;
  uniform vec2  uMouse;
  uniform vec3  uAccent;

  float hash(vec2 p){
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = m * p;
      a *= 0.5;
    }
    return v;
  }

  void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;
    float t = uTime * 0.05;

    // domain-warped flow
    vec2 q = vec2(fbm(uv + t), fbm(uv + vec2(5.2, 1.3) - t));
    vec2 r = vec2(
      fbm(uv + 3.5 * q + vec2(1.7, 9.2) + 0.12 * t),
      fbm(uv + 3.5 * q + vec2(8.3, 2.8) - 0.10 * t)
    );
    float f = fbm(uv + 4.0 * r + uMouse * 0.45);

    vec3 col = mix(vec3(0.027), vec3(0.06, 0.045, 0.035), f);
    col += uAccent * smoothstep(0.58, 0.98, f) * 1.05;          // bright filaments
    col += uAccent * 0.18 * pow(max(f, 0.0), 3.0);              // ember glow

    // molten glow that tracks the pointer
    float d = length(uv - uMouse * vec2(1.2, 1.0));
    col += uAccent * 0.16 * smoothstep(0.85, 0.0, d) * (0.6 + 0.4 * f);

    float vig = smoothstep(1.55, 0.25, length(uv));
    col *= vig;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // Stretch the canvas to fill its container. resize() sets the drawing-buffer
    // size; without this CSS the canvas would render at its intrinsic pixel size.
    const canvas = renderer.domElement;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    mount.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();

    const accent = new THREE.Color("#f5c518").convertSRGBToLinear();
    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uAccent: { value: new THREE.Vector3(accent.r, accent.g, accent.b) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const resize = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      const dpr = renderer.getPixelRatio();
      uniforms.uRes.value.set(w * dpr, h * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const targetMouse = new THREE.Vector2(0, 0);
    const onPointer = (e: PointerEvent) => {
      targetMouse.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      );
    };
    window.addEventListener("pointermove", onPointer);

    // Pause rendering once the hero is scrolled well out of view
    let running = true;
    const onScroll = () => {
      const past = window.scrollY > window.innerHeight * 1.8;
      if (past && running) running = false;
      else if (!past && !running) {
        running = true;
        loop();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const start = performance.now();
    let raf = 0;
    const loop = () => {
      if (!running) return;
      uniforms.uTime.value = (performance.now() - start) / 1000;
      uniforms.uMouse.value.lerp(targetMouse, 0.06);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 h-full w-full" />;
}
