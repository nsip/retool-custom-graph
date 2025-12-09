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

    if (type === 'superclass' || type === 'isAttributeOf') {
      graphArray.push({ data: { id: 'selected-' + type + index, source: nodeId, target: 'selected' } });
    } else if (type === 'subclass' || type === 'hasAttribute') {
      graphArray.push({ data: { id: 'selected-' + type + index, source: 'selected', target: nodeId } });
    } else{
      graphArray.push({ data: { id: nodeId + '-selected', source: nodeId, target: 'selected' } });
      graphArray.push({ data: { id: 'selected-' + nodeId, source: 'selected', target: nodeId } });
    }
  }
  return graphArray
}

export const DataDictionaryGraph : FC = () => {
  const cyRef = useRef(null);

  const [connectionDataString, setConnectionDataString] = Retool.useStateString({
    name: "data",
    initialValue: '{"Entity_Name":"Loading..."}' 
  });

  let graphArray = [];
  
  if (connectionDataString) {
    try {
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
    } catch (e) {
      console.error("David Error parsing incoming JSON data:", e);
    }
  }
  
  useEffect(() => {
    if (cyRef.current && graphArray.length > 0) {
      const cy = cytoscape({
        container: cyRef.current,
        elements: graphArray,
        style: [
          {
            selector: 'node',
            style: {
              'label': 'data(name)',
              'text-valign': 'bottom',
              'color': 'black',
              'font-size': '10px',
              'padding': '10px'
            }
          },
          {
            selector: 'node[type="selected"]',
            style: {
              'background-color': '#337ab7',
              'shape': 'star' 
            }
          },
          {
            selector: 'node[type="superclass"]',
            style: {
              'background-color': '#dc3545',
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
              'background-color': '#fd7e14',
              'shape': 'triangle'
            }
          },
          {
            selector: 'node[type="isAttributeOf"]',
            style: {
              'background-color': '#28a745',
              'shape': 'pentagon'
            }
          },
          {
            selector: 'node[type="related"]',
            style: {
              'background-color': '#87CEFA',
              'shape': 'star',
              'width': '20px',
              'height': '20px'
            }
          },
          {
            selector: 'node[type="collection"]',
            style: {
              'background-color': '#6f42c1',
              'shape': 'ellipse'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#ccc',
              'target-arrow-color': '#ccc',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier', 
              'target-arrow-fill': 'filled',
              'source-arrow-shape': 'none' 
            }
          }
        ],
        layout: {
          name: 'cose'
        }
      });
      return () => cy.destroy();
    }
  }, [graphArray, connectionDataString]);
  
  return <div ref={cyRef} style={{ width: '100%', height: '100%' }} />;
}

