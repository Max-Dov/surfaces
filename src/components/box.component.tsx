import React, {useRef, useState} from "react";
import {useFrame} from "react-three-fiber";

export function Box(props) {
    const mesh: any = useRef();
    const [hovered, setHover] = useState(false);
    const [active, setActive] = useState(false);

    useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += Math.random() / 50));

    return (
        <mesh
            {...props}
            ref={mesh}
            scale={active ? [3, 3, 3] : [1, 1, 1]}
            onClick={e => setActive(!active)}
            onPointerOver={e => setHover(true)}
            onPointerOut={e => setHover(false)}>
            <boxBufferGeometry attach="geometry" args={[.1, .1, .1]}/>
            <meshStandardMaterial attach="material" color={hovered ? 'hotpink' : 'orange'}/>
        </mesh>
    )
}