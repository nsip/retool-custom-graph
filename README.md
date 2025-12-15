# Data Dictionary Graph Custom Retool Component
This repository contains a single custom component designed for use within the Retool platform. It visualizes data dictionary relationships (like superclass/subclass hierarchies, attributes, and related entities) using the Cytoscape.js graph library, rendered within a React environment.
The core logic handles parsing a specific JSON input string from Retool and rendering a structured, manually positioned graph layout.

## Prerequisites
To develop or modify this component locally, you need:
* Node.js installed
* Access to a Retool instance

## Development and Usage
### 1. Local Development
To run this component locally in a development server environment provided by Retool's CLI tool, navigate to the root driectory of this project in your terminal and runn the following command: 
`npx retool-ccl dev`
This command allows you to preview your changes in the development mode of retool.

### 2. The *connectionDataString* Input
The component expects a string input named data in a specific JSON format. The schema requires a selected object and optional arrays for relationships:
```
{
  "selected": {
    "Entity_Name": "Name_Of_Central_Node",
    "Entity_ID": 101
  },
  "superclass": [
    { "EntityName": "Parent1" }
  ],
  "subclass": [
    { "EntityName": "Child1" },
    { "EntityName": "Child2" }
  ],
  "hasAttribute": [
    { "EntityName": "AttributeA" }
  ],
  "isAttributeOf": [],
  "related": [],
  "collection": []
}
```

### 3. Deployment
Once development is complete:
1. **Build the component**: Run the `npx retool-ccl dev` to build and run the componet
2. **Upload to Retool** USe the retool UI to upload the resulting bundled files as a new custom component

## File Structure
The entire component logic, including React setup, Cytoscape initialization, and data parsing utilities, is contained within a single file in the src directory called index.tsx
