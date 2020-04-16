import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Surfaces from './components/surfaces.component';
import {Canvas} from "react-three-fiber";
import {Controls} from "./components/controls.components";


ReactDOM.render(
    <>
        <h1>SURFACES</h1>
        <Canvas camera={{position: [0, -10, 10]}}>
            <pointLight position={[0, 10, 10]}/>
            <Surfaces
                gridSize={15}
                position={[10, 0, 0]}
                color="#d81b60"
            />
            <Surfaces
                gridSize={15}
                position={[-10, 0, 0]}
                color="#1e88e5"
            />
            <Controls
                enablePan={false}
                enableZoom={false}
                enableDamping
            />
        </Canvas>
        <a href="https://github.com/Max-Dov/surfaces" className="top-right" children="GitHub" />
    </>,
    document.getElementById('root')
);