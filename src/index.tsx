import React, { useRef, useEffect, FC } from 'react';
import cytoscape from 'cytoscape';
import { Retool } from '@tryretool/custom-component-support'
import { MdZoomIn, MdZoomOut, MdFitScreen } from 'react-icons/md';

function createData(graphArray: any[], data: any, type: string) : any[] {
  for (let index = 0; index < data.length; index++) {
    const element = data[index];
    const nodeId = type + index;

    if(type === 'collection'){
      graphArray.push({data: { id: type + index, name: element.CollectionName, type: type } });
    } else{
      graphArray.push({data: { id: type + index, name: element.EntityName, type: type } });
    }

    if (type === 'subclass' || type === 'isAttributeOf' || type === 'related') {
      graphArray.push({ data: { id: 'selected-' + type + index, source: nodeId, target: 'selected', type: type } });
    } else if (type === 'superclass' || type === 'hasAttribute' || type === 'collection') {
      graphArray.push({ data: { id: 'selected-' + type + index, source: 'selected', target: nodeId, type: type } });
    }
  }
  return graphArray;
}

function parseData(connectionDataString: any, graphArray: any[]){
  const graphData = JSON.parse(connectionDataString);
  if (graphData && graphData.selected && graphData.selected.Entity_Name) {
    graphArray.push({ data: { id: 'selected', name: graphData.selected.Entity_Name, type: 'selected' } });

    if(graphData.superclass){
      graphArray = createData(graphArray, graphData.superclass, 'superclass')
    }
    if(graphData.subclass){
      graphArray = createData(graphArray, graphData.subclass, 'subclass')
    }
    if(graphData.collection){
      graphArray = createData(graphArray, graphData.collection, 'collection')
    }
    if(graphData.hasAttribute){
      graphArray = createData(graphArray, graphData.hasAttribute, 'hasAttribute')
    }
    if(graphData.isAttributeOf){
      graphArray = createData(graphArray, graphData.isAttributeOf, 'isAttributeOf')
    }
    if(graphData.related){
        graphArray = createData(graphArray, graphData.related, 'related')
    }
  }
  return graphArray;
}

function distributeNodesInGrid(nodes: any, startX: number, startY: number, spacing: number, nodesPerLine: number, axis: 'x' | 'y' = 'x'){
    const totalNodes = nodes.length;
    if (totalNodes === 0) return;

    nodes.forEach((node: any, index: number) => {
      const row = Math.floor(index / nodesPerLine);
      const col = index % nodesPerLine;

      let x, y;

      if (axis === 'x') {
          x = startX + (col * spacing) - ((Math.min(totalNodes, nodesPerLine) - 1) * spacing / 2);
          y = startY + (row * spacing * 0.8);
      } else {
          x = startX + (row * spacing * 0.8);
          y = startY + (col * spacing) - ((Math.min(totalNodes, nodesPerLine) - 1) * spacing / 2);
      }
      
      node.position({ x, y });
    });
};

export const DataDictionaryGraph : FC = () => {
  const cyRef = useRef<HTMLDivElement>(null);
  const cyInstance = useRef<cytoscape.Core | null>(null); 

  const [connectionDataString, setConnectionDataString] = Retool.useStateString({
    name: "data",
    initialValue: '{"Entity_Name":"Loading..."}' 
  });

  let graphArray: any[] = [];
  
  if (connectionDataString) {
    try {
      graphArray = parseData(connectionDataString, graphArray)
    } catch (e) {
      console.error("Error parsing incoming JSON data:", e);
    }
  }

  const handleFitView = () => {
    if (cyInstance.current) {
      cyInstance.current.fit(undefined, 50); 
    }
  };

  const handleZoomIn = () => {
    if (cyInstance.current) {
        cyInstance.current.zoom(cyInstance.current.zoom() * 1.2); 
    }
  };

  const handleZoomOut = () => {
    if (cyInstance.current) {
      const zoomLevel = cyInstance.current.zoom();
      cyInstance.current.zoom(zoomLevel / 1.2);
    }
  };
  
  useEffect(() => {
    if (cyRef.current && graphArray.length > 0) {
      const cy = cytoscape({
        container: cyRef.current,
        elements: graphArray,
        wheelSensitivity: 0.3,
        style: [
          {
            selector: 'node',
            style: {
              'label': 'data(name)',
              'text-valign': 'bottom',
              'color': 'black',
              'font-size': '20px',
              'padding': '10px',
              'width': '50px',
              'height': '50px',
              'text-wrap': 'wrap',
              'text-max-width': '100px',
            }
          },
          {
            selector: 'node[type="selected"]',
            style: {
              'background-color': '#337ab7',
              'shape': 'star',
              'width': '50px',
              'height': '50px'
            }
          },
          {
            selector: 'node[type="superclass"]',
            style: {
              'background-color': '#ffc107',
              'shape': 'round-rectangle'
            }
          },
          {
            selector: 'node[type="subclass"]',
            style: {
              'background-color': '#ffc107',
              'shape': 'round-rectangle'
            }
          },
          {
            selector: 'node[type="hasAttribute"]',
            style: {
              'background-color': '#28a745',
              'shape': 'rectangle'
            }
          },
          {
            selector: 'node[type="isAttributeOf"]',
            style: {
              'background-color': '#28a745',
              'shape': 'ellipse'
            }
          },
          {
            selector: 'node[type="related"]',
            style: {
              'background-color': '#87CEFA',
              'shape': 'star',
            }
          },
          {
            selector: 'node[type="collection"]',
            style: {
              'background-color': '#808080',
              'shape': 'rhomboid'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': 'black',
              'target-arrow-color': 'black',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier', 
              'target-arrow-fill': 'filled',
              'source-arrow-shape': 'none' 
            }
          },
          {
            selector: 'edge[type="superclass"]',
            style: {
              'line-color': 'black', 
              'target-arrow-color': 'black',
              'line-style': 'solid',
              'target-arrow-shape': 'triangle',
              'target-arrow-fill': 'hollow'
            }
          },
          {
            selector: 'edge[type="subclass"]',
            style: {
              'line-color': 'black', 
              'target-arrow-color': 'black',
              'line-style': 'solid',
              'target-arrow-shape': 'triangle',
              'target-arrow-fill': 'hollow'
            }
          },
          {
            selector: 'edge[type="related"]',
            style: {
              'line-color': 'black',
              'source-arrow-shape': 'none',
              'target-arrow-shape': 'none',
            }
          },
          {
            selector: 'edge[type="hasAttribute"]',
            style: {
              'line-color': 'black',
              'line-style': 'solid',
              'target-arrow-shape': 'diamond',
              'target-arrow-fill': 'filled'
            }
          },
          {
            selector: 'edge[type="isAttributeOf"]',
            style: {
              'line-color': 'black',
              'line-style': 'solid',
              'target-arrow-shape': 'diamond',
              'target-arrow-fill': 'filled',
              'target-arrow-color': 'black',
              'source-arrow-shape': 'none',
            }
          },
        ],
        layout: {
          name: 'preset',
          fit: true
        } as any, 
      });

      cyInstance.current = cy;

      const verticalDistance = 200;
      const horizontalDistance = 250;
      const spacing = 150;
      const nodesPerLine = 10;

      cy.getElementById('selected').position({ x: 0, y: 0 });

      distributeNodesInGrid(cy.nodes('[type="superclass"]'), 0, -verticalDistance, spacing, nodesPerLine, 'x');
      distributeNodesInGrid(cy.nodes('[type="subclass"], [type="collection"]'), 0, verticalDistance, spacing, nodesPerLine, 'x');
      distributeNodesInGrid(cy.nodes('[type="hasAttribute"]'), -horizontalDistance, 0, spacing, nodesPerLine, 'y');
      distributeNodesInGrid(cy.nodes('[type="isAttributeOf"]'), horizontalDistance, 0, spacing, nodesPerLine, 'y');
      distributeNodesInGrid(cy.nodes('[type="related"]'), 0, (-verticalDistance/2), spacing, nodesPerLine, 'x'); 

      cy.layout({ name: 'preset', fit: true, padding: 50 } as any).run();

      return () => {
         if (cyInstance.current) {
            cyInstance.current.destroy();
            cyInstance.current = null;
        }
      };
    } else if (cyInstance.current) {
        cyInstance.current.destroy();
        cyInstance.current = null;
    }
  }, [graphArray, connectionDataString]);
  
  return (<div style={{position: 'absolute', width: '100%', height: '100%'}}>
    <div style={{
      position: 'absolute',
      bottom: 10,
      right: 10,
      zIndex: 10,
      backgroundColor: '#fff',
      padding: '5px',
      borderRadius: '4px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      display: 'flex',
      gap: '5px'
    }}>
      <button onClick={handleZoomOut} title="Zoom Out" style={{ cursor: 'pointer' }}>
        <MdZoomOut size={18} />
      </button>
      <button onClick={handleFitView} title="Fit Content" style={{ cursor: 'pointer' }}>
        <MdFitScreen size={18} />
      </button>
      <button onClick={handleZoomIn} title="Zoom In" style={{ cursor: 'pointer' }}>
        <MdZoomIn size={18} />
        </button>
    </div>
    <div ref={cyRef} style={{ width: '100%', height: '100%' }} />
  </div>);
}
