import * as THREE from 'three';
import {Float32BufferAttribute} from "three";
import {TriangulationService} from "./triangulation.service";
import {MathService} from "./math.service";

/**
 * Provides methods related to surface generation.
 */
export class SurfaceService {
    private static r = () => Math.random(); // just for shorter access

    static generateDots = (dotsNumber: number): THREE.Vector3[] => {
        console.time('dotsgen');
        const generatedDots: THREE.Vector3[] = [];
        for (let y = 0; y < dotsNumber; y++)
            for (let x = 0; x < dotsNumber; x++) {
                generatedDots.push(new THREE.Vector3(x + SurfaceService.r() / 5, y + SurfaceService.r() / 5, SurfaceService.r() / 2));
            }
        console.timeEnd('dotsgen');
        return generatedDots;
    }

    static formGeometryFromSurface = (triangles: THREE.Triangle[]): THREE.BufferGeometry => {
        console.time('geometrygen');
        let geometry = new THREE.BufferGeometry();
        let vertices: number[] = [];
        let normals = [];
        triangles.forEach(triangle => {
            let normal = triangle.getNormal(MathService.zAxis);
            vertices.push(
                triangle.a.x, triangle.a.y, triangle.a.z,
                triangle.b.x, triangle.b.y, triangle.b.z,
                triangle.c.x, triangle.c.y, triangle.c.z,
            );
            normals.push(
                normal.x, normal.y, normal.z,
                normal.x, normal.y, normal.z,
                normal.x, normal.y, normal.z
            )
        });
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
        console.timeEnd('geometrygen');
        return geometry;
    }

    static generateSurface = (gridSize: number): THREE.Triangle[] => {
        return TriangulationService.triangulateDots(SurfaceService.generateDots(gridSize), gridSize);
    }
}