import * as THREE from 'three';
import React, {Dispatch, SetStateAction, useMemo, useRef, useState} from 'react';
import {useFrame} from 'react-three-fiber';
import {a, useSpring} from "react-spring/three";
import {SurfaceService} from "../services/surface.service";

export default function Surfaces(props: {
    gridSize?: number
}) {
    const meshRef: any = useRef();
    const initialSurface: THREE.Triangle[] = useMemo(() => SurfaceService.generateSurface(props.gridSize || 10), [props.gridSize]);
    const initialGeometry: THREE.BufferGeometry = useMemo(() => SurfaceService.formGeometryFromSurface(initialSurface), [initialSurface]);
    
    const [surface, setSurface]: [THREE.Triangle[], Dispatch<SetStateAction<THREE.Triangle[]>>] = useState(initialSurface);
    const [geometry, setGeometry]: [THREE.BufferGeometry, Dispatch<SetStateAction<THREE.BufferGeometry>>] = useState(initialGeometry);
    const [hovered, setHovered]: [boolean, Dispatch<SetStateAction<boolean>>] = useState(false);
    const surfaceProps = useSpring({
        color: hovered ? 'orange' : 'hotpink'
    });

    function shuffleTriangles(e?: PointerEvent): void {
        console.time('mesh shuffle');
        geometry.dispose(); // TODO change to create different attributes not geometry
        setGeometry(SurfaceService.formGeometryFromSurface(surface));
        console.timeEnd('mesh shuffle');
    }

    useFrame(() => {
        // meshRef.current.rotation.z += 0.05
        // shuffleTriangles();
    });

    return (<>
            <a.mesh
                visible
                ref={meshRef}
                geometry={geometry}
                position={[-props.gridSize / 2, -props.gridSize / 2, 0]}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <a.meshPhongMaterial
                    attach="material"
                    side={THREE.DoubleSide}
                    color={surfaceProps.color}
                />
            </a.mesh>
        </>
    );
}

