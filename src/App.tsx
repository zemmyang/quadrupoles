import './App.css'
import Canvas from "./Canvas";
import UserInterface from "./UserInterface";
import { calculateOrbit } from './physics.ts';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Vec3 } from './types';

function App() {
  // Group related simulation parameters together
  const [simParams, setSimParams] = useState({
    attractorSize: 1,
    initialPosition: { x: 5, y: 0, z: 0 } as Vec3,
    initialVelocity: { x: 0, y: 3, z: 0 } as Vec3,
    finalTime: 100
  });

  const [orbitData, energy] = calculateOrbit(
              simParams.finalTime,
              simParams.initialPosition,
              simParams.initialVelocity,
              simParams.attractorSize
            );

  const [calcEnergy, setCalcEnergy] = useState(energy || 0);

  // Update calcEnergy whenever energy changes
  useEffect(() => {
    if (energy !== undefined) {
      setCalcEnergy(energy);
    }
  }, [energy]);

  return (
    <Container fluid className="custom-container" style={{ padding: 20 }}>
      <Row className="mb-4">
        <Col className="text-light" style={{ textAlign: 'center' }}>
          <h1>Effects of Multipole Moments on Gravitational Orbits</h1>
          <p className="lead" style={{ maxWidth: '800px', margin: '0 auto' }}>
            A little React simulator based on my BSc thesis (PDF link here).
            </p>
            <p style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
            Note that: 
            <ul>
              <li>the physics engine uses a simple fixed time-step RK2 integrator, so accuracy may vary.</li>
              <li>the dimensions of the attractor are only for visualization purposes; the actual physics is calculated assuming a point mass/very thin ring.</li>
            </ul>
            </p>
        </Col>
      </Row>
      
      <Row>
        <Col md={5}>
          <UserInterface 
            simParams={simParams}
            setSimParams={setSimParams}
            energy={calcEnergy}
            setCalcEnergy={setCalcEnergy}
          />
        </Col>
        
        <Col md={7}>
          <Canvas
            data={orbitData}
            initialPosition={simParams.initialPosition}
            attractorSize={simParams.attractorSize}
            initialVelocity={simParams.initialVelocity}
            energy={calcEnergy}
          />
          Some interesting presets:
          <br />
          <Button
            variant="outline-primary"
            onClick={() => {
              setSimParams({
                ...simParams,
                attractorSize: 0.00001,
                finalTime: 300,
                initialPosition: { x: 4, y: 0, z: 0 },
                initialVelocity: { x: 0, y: 2, z: 3 }
              });
            }}
          >
            Monopole orbit (bound)
          </Button>
          <br />
          <Button
            variant="outline-primary"
            onClick={() => {
              setSimParams({
                ...simParams,
                attractorSize: 1,
                finalTime: 500,
                initialPosition: { x: 3, y: 1, z: 0 },
                initialVelocity: { x: 0, y: 4, z: 2 }
              });
            }}
          >
            Quadrupole orbit (bound)
          </Button>
        </Col>
      </Row>
    </Container>
  )
}

export default App;
