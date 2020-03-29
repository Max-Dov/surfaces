import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Surfaces from './components/surfaces.component';
import {Canvas} from "react-three-fiber";
import {Controls} from "./components/controls.components";


ReactDOM.render(
    <Canvas camera={{position: [0, 0, 10], near: 0.1, far: 100}}>
        <pointLight position={[10, 10, 10]}/>
        <Surfaces />
        <Controls />
    </Canvas>
    , document.getElementById('root'));