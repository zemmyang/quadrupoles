import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import type { Dispatch, SetStateAction } from 'react';
import { Vec3 } from './types';

interface SimulationParams {
    attractorSize: number;
    finalTime: number;
    initialPosition: Vec3;
    initialVelocity: Vec3;
}

interface UserInterfaceProps {
    simParams: SimulationParams;
    setSimParams: Dispatch<SetStateAction<SimulationParams>>;

    energy?: number;
    setCalcEnergy: Dispatch<SetStateAction<number>>;
}

export default function UserInterface(
    { simParams, setSimParams, energy, setCalcEnergy }: UserInterfaceProps) {
    // Helper function to update a single parameter
    const updateParam = <K extends keyof SimulationParams>(
        key: K,
        value: SimulationParams[K]
    ) => {
        if (key === 'attractorSize') {
            // need to ensure the current position is still valid when updating attractor size
            const newSize = value as number;
            const currentPos = simParams.initialPosition;
            const r = Math.sqrt(currentPos.x**2 + currentPos.y**2 + currentPos.z**2);
            
            if (r >= newSize) {
                // If position is still valid with new attractor size, update normally
                setSimParams(prev => ({
                    ...prev,
                    [key]: value
                }));
            } else {
                // If position would be inside attractor, adjust the position to be on the surface
                const scale = newSize / r;
                const newPos = {
                    x: currentPos.x * scale,
                    y: currentPos.y * scale,
                    z: currentPos.z * scale
                };
                
                setSimParams(prev => ({
                    ...prev,
                    [key]: value,
                    initialPosition: newPos
                }));
            }
        } else {
            setSimParams(prev => ({
                ...prev,
                [key]: value
            }));
        }
        
        setCalcEnergy(prevEnergy => prevEnergy);
    };

    // function to validate position is outside attractor radius
    const isValidPosition = (position: Vec3, attractorSize: number): boolean => {
        const r = Math.sqrt(position.x**2 + position.y**2 + position.z**2);
        return r >= attractorSize;
    };

    // function to update a nested Vec3 property
    const updateVec3 = (
        vecKey: 'initialPosition' | 'initialVelocity',
        component: 'x' | 'y' | 'z',
        value: number
    ) => {
        if (vecKey === 'initialPosition') {
            const newPosition = {
                ...simParams.initialPosition,
                [component]: value
            };
            
            if (isValidPosition(newPosition, simParams.attractorSize)) {
                setSimParams(prev => ({
                    ...prev,
                    initialPosition: newPosition
                }));

                setCalcEnergy(prevEnergy => prevEnergy);
            } else {
                console.warn(`Position would be inside attractor. Minimum distance from origin must be ${simParams.attractorSize}.`);
            }
        } else {
            setSimParams(prev => ({
                ...prev,
                [vecKey]: {
                    ...prev[vecKey],
                    [component]: value
                }
            }));

            setCalcEnergy(prevEnergy => prevEnergy);
        }
    };

    return (
        <div style={{ marginBottom: 20 }}>
            <h2>Simulation Parameters</h2>
            <div>
                <strong>System Energy: </strong> {energy !== undefined ? energy.toFixed(4) : 'Calculating...'}
                <strong>{energy !== undefined ? (energy > 0 ? ' (Unbound)' : ' (Bound)') : ''}</strong>
            </div>
            <>
            <Form.Label>Final Time: {simParams.finalTime}</Form.Label>
            <Form.Range 
                value={simParams.finalTime} 
                min={100} 
                max={1000} 
                step={100} 
                onChange={e => updateParam('finalTime', parseFloat(e.target.value))} 
            />
            <br />
            <Form.Label>Attractor Size: {simParams.attractorSize}</Form.Label>
            <br />
            <Button
                variant="outline-secondary"
                onClick={() => updateParam('attractorSize', 0.00001)}
            >
                Use Point Attractor (no multipole)
            </Button>
            <Form.Range 
                value={simParams.attractorSize} 
                min={1} 
                max={5} 
                step={1} 
                onChange={e => updateParam('attractorSize', parseFloat(e.target.value))} 
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {(() => {
                    const distance = Math.sqrt(
                        simParams.initialPosition.x**2 + 
                        simParams.initialPosition.y**2 + 
                        simParams.initialPosition.z**2
                    );
                    if (distance < simParams.attractorSize) {
                        return (
                            <small style={{ color: 'red' }}>
                                Warning: Current position is inside the attractor!
                            </small>
                        );
                    }
                    return null;
                })()}
            </div>
            <br />

            <div className="position-warning" style={{ marginBottom: '10px' }}>
                {(() => {
                    const distance = Math.sqrt(simParams.initialPosition.x**2 + simParams.initialPosition.y**2 + simParams.initialPosition.z**2);
                    const isValid = distance >= simParams.attractorSize;
                    
                    return (
                        <small style={{ color: isValid ? 'green' : 'orange' }}>
                            Note: The distance from origin must be greater than or equal to the attractor size.
                            Current distance: {distance.toFixed(2)}
                            {!isValid && <strong> - Invalid position: inside attractor!</strong>}
                        </small>
                    );
                })()}
            </div>
            
            <Form.Label>x: {simParams.initialPosition.x}</Form.Label>
            <br />
            <Form.Range 
                value={simParams.initialPosition.x} 
                min={-10} 
                max={10} 
                step={1} 
                onChange={e => {
                    const val = parseFloat(e.target.value);
                    updateVec3('initialPosition', 'x', val);
                }}
            />
            <br />
            
            <Form.Label>y: {simParams.initialPosition.y}</Form.Label>
            <br />
            <Form.Range 
                value={simParams.initialPosition.y} 
                min={-10} 
                max={10} 
                step={1} 
                onChange={e => {
                    const val = parseFloat(e.target.value);
                    updateVec3('initialPosition', 'y', val);
                }}
            />
            <br />
            <Form.Label>z: {simParams.initialPosition.z}</Form.Label>
            <br />
            <Form.Range 
                value={simParams.initialPosition.z} 
                min={-10} 
                max={10} 
                step={1} 
                onChange={e => {
                    const val = parseFloat(e.target.value);
                    updateVec3('initialPosition', 'z', val);
                }}
            />
            <br />

            <Form.Label>vx: {simParams.initialVelocity.x}</Form.Label>
            <br />
            <Form.Range 
                value={simParams.initialVelocity.x} 
                min={-10} 
                max={10} 
                step={1} 
                onChange={e => updateVec3('initialVelocity', 'x', parseFloat(e.target.value))} 
            />
            <br />
            <Form.Label>vy: {simParams.initialVelocity.y}</Form.Label>
            <br />
            <Form.Range 
                value={simParams.initialVelocity.y} 
                min={-10} 
                max={10} 
                step={1} 
                onChange={e => updateVec3('initialVelocity', 'y', parseFloat(e.target.value))} 
            />
            <br />
            <Form.Label>vz: {simParams.initialVelocity.z}</Form.Label>
            <br />
            <Form.Range 
                value={simParams.initialVelocity.z} 
                min={-10} 
                max={10} 
                step={1} 
                onChange={e => updateVec3('initialVelocity', 'z', parseFloat(e.target.value))} 
            />
            <br />

            </>

        </div>
    );
}