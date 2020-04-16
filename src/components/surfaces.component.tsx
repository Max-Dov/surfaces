import * as THREE from 'three';
import React, {Dispatch, SetStateAction, useMemo, useRef, useState} from 'react';
import {useFrame} from 'react-three-fiber';
import {a, useSpring} from "react-spring/three";
import {SurfaceService} from "../services/surface.service";

export default function Surfaces(props: {
    gridSize: number
    position: [number, number, number]
    color: string
}) {
    const meshRef: any = useRef();
    const initialSurface: THREE.Triangle[] = useMemo(() => SurfaceService.generateSurface(props.gridSize), [props.gridSize]);
    const initialGeometry: THREE.BufferGeometry = useMemo(() => SurfaceService.formGeometryFromSurface(initialSurface, props.gridSize), [initialSurface, props.gridSize]);
    
    const [surface, setSurface]: [THREE.Triangle[], Dispatch<SetStateAction<THREE.Triangle[]>>] = useState(initialSurface);
    const [geometry, setGeometry]: [THREE.BufferGeometry, Dispatch<SetStateAction<THREE.BufferGeometry>>] = useState(initialGeometry);
    const [hovered, setHovered]: [boolean, Dispatch<SetStateAction<boolean>>] = useState(false);
    const surfaceProps = useSpring({
        color: hovered ? 'orange' : props.color
    });

    function shuffleTriangles(e?: PointerEvent): void {
        console.time('mesh shuffle');
        geometry.dispose(); // TODO change to create different attributes not geometry
        setGeometry(SurfaceService.formGeometryFromSurface(surface, props.gridSize));
        console.timeEnd('mesh shuffle');
    }

    useFrame(() => {
        meshRef.current.rotation.z += 0.005
        // shuffleTriangles();
    });

    return (<>
            <a.mesh
                visible
                ref={meshRef}
                geometry={geometry}
                position={props.position}
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

