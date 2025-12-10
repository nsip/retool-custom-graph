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

    if (type === 'superclass' || type === 'isAttributeOf' || type === 'related') {
      graphArray.push({ data: { id: 'selected-' + type + index, source: nodeId, target: 'selected', type: type } });
    } else if (type === 'subclass' || type === 'hasAttribute' || type === 'collection') {
      graphArray.push({ data: { id: 'selected-' + type + index, source: 'selected', target: nodeId, type: type } });
    }
  }
  return graphArray;
}

export const DataDictionaryGraph : FC = () => {
  const cyRef = useRef(null);

  const [connectionDataString, setConnectionDataString] = Retool.useStateString({
    name: "data",
    initialValue: '{"Entity_Name":"Loading..."}' 
  });

  let graphArray = [];
  
  const collectionIconUri = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20640%20640%22%3E%3C!--!Font%20Awesome%20Free%207.1.0%20by%20%40fontawesome%20-%20https%3A%2F%2Ffontawesome.com%20License%20-%20https%3A%2F%2Ffontawesome.com%2Flicense%2Ffree%20Copyright%202025%20Fonticons%2C%20Inc.--%3E%3Cpath%20d%3D%22M480%20576L192%20576C139%20576%2096%20533%2096%20480L96%20160C96%20107%20139%2064%20192%2064L496%2064C522.5%2064%20544%2085.5%20544%20112L544%20400C544%20420.9%20530.6%20438.7%20512%20445.3L512%20512C529.7%20512%20544%20526.3%20544%20544C544%20561.7%20529.7%20576%20512%20576L480%20576zM192%20448C174.3%20448%20160%20462.3%20160%20480C160%20497.7%20174.3%20512%20192%20512L448%20512L448%20448L192%20448zM224%20216C224%20229.3%20234.7%20240%20248%20240L424%20240C437.3%20240%20448%20229.3%20448%20216C448%20202.7%20437.3%20192%20424%20192L248%20192C234.7%20192%20224%20202.7%20224%20216zM248%20288C234.7%20288%20224%20298.7%20224%20312C224%20325.3%20234.7%20336%20248%20336L424%20336C437.3%20336%20448%20325.3%20448%20312C448%20298.7%20437.3%20288%20424%20288L248%20288z%22%2F%3E%3C%2Fsvg%3E';
  
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
              'padding': '10px',
              'width': '30px',
              'height': '30px'
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
            selector: 'node[type="superclass"], node[type="subclass"], node[type="hasAttribute"], node[type="isAttributeOf"], node[type="related"], node[type="collection"]',
            style: {
                'width': '25px',
                'height': '25px',
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
              'width': '30px',
              'height': '30px', 
              'background-color': 'white', 
              'shape': 'ellipse', 
              'background-image': collectionIconUri,
              'background-fit': 'contain',
              'background-clip': 'none',
              'background-opacity': 1,
              'label': 'data(name)',
              'text-valign': 'bottom',
              'background-position-x': '50%',
              'background-position-y': '50%',
            }
          },
          {
            selector: 'node[type="superclass"], node[type="subclass"], node[type="hasAttribute"], node[type="isAttributeOf"], node[type="related"]',
            style: {
                'width': '20px', 
                'height': '20px',
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
            }
          },
        ],
        layout: {
          name: 'cose'
        }
      });
      return () => cy.destroy();
    }
  }, [graphArray, connectionDataString, collectionIconUri]);
  
  return <div ref={cyRef} style={{ width: '100%', height: '100%' }} />;
}
