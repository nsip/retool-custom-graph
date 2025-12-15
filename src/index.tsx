import React, { useRef, useEffect, FC } from 'react';
import cytoscape from 'cytoscape';
import { Retool } from '@tryretool/custom-component-support'

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
  const cyRef = useRef(null);

  const [connectionDataString, setConnectionDataString] = Retool.useStateString({
    name: "data",
    initialValue: '{"Entity_Name":"Loading..."}' 
  });

  let graphArray: any[] = [];
  
  if (connectionDataString) {
    try {
      graphArray = parseData(connectionDataString, graphArray)
    } catch (e) {
      console.error("David Error parsing incoming JSON data:", e);
    }
  }
  
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
              'shape': 'ellipse'
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
              'target-arrow-color': 'black',
              'line-style': 'dashed',
              'source-arrow-shape': 'none',
              'target-arrow-fill': 'hollow',
            }
          },
        ],
        layout: {
          name: 'preset',
          fit: true
        } as any, 
      });

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

      return () => cy.destroy();
    }
  }, [graphArray, connectionDataString]);
  
  return <div ref={cyRef} style={{ width: '100%', height: '100%' }} />;
}
