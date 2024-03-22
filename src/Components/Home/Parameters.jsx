import "./Parameters.css";
import { Tree } from "primereact/tree";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.css";
import { DiCss3, DiJavascript, DiNpm } from "react-icons/di";
import { FaList, FaRegFolder, FaRegFolderOpen } from "react-icons/fa";
import TreeView, { flattenTree } from "react-accessible-treeview";
import { Treebeard } from "react-treebeard";

import { useState, useEffect } from "react";

export default function Parameters({ paramsData }) {
  //   console.log("DATA IN PARAMS", paramsData);
  //   console.log("CHILDREN", paramsData[0].TestParameters.Children[0].Description);
  //   const buttons = paramsData[0].TestParameters.Children.map((child) => {
  //     return (
  //       <button key={child.Name} className="params-button">
  //         {child.Description}
  //       </button>
  //     );
  //   });
  const [selectedNode, setSelectedNode] = useState(null);
  const onToggle = (node, toggled) => {
    if (selectedNode) {
      selectedNode.active = false;
    }
    node.active = true;
    if (node.children) {
      node.toggled = toggled;
    }
    setSelectedNode(node);
  };

  function NodeDetails({ node }) {
    return (
      <div>
        <div>{node.name}</div>
        {node.children && (
          <ul>
            {node.children.map((child, index) => (
              <li key={index}>
                <NodeDetails node={child} />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  function Details({ node }) {
    console.log("NODE", node);
    return (
      <div>
        <h2>{node.name}</h2>

        {node.children &&
          node.children.map((child, index) => (
            <NodeDetails key={index} node={child} />
          ))}
      </div>
    );
  }

  function transformToTreeData(nodes) {
    console.log("NODES: ", nodes);
    return nodes.map((node) => {
      const {
        Description: name,
        Children: children,
        Properties: properties,
      } = node;
      let transformedChildren = [];
      if (children && children.length > 0) {
        transformedChildren = transformToTreeData(children);
      } else if (properties && properties.length > 0) {
        transformedChildren = properties.map((prop) => ({
          name: `${prop.Description}: ${
            prop.Value?.StringValue || prop.Value?.DoubleValue || ""
          }`,
        }));
      }
      return {
        name,
        children: transformedChildren,
      };
    });
  }

  const treeData = transformToTreeData(paramsData[0].TestParameters.Children);

  const treeStyle = {
    tree: {
      base: {
        background: "#fff",
        color: "#000",
        fontSize: "16px",
      },
      node: {
        activeLink: {
          background: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  return (
    <div className="parameters-wrapper">
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div
          style={{
            flex: 1,
            maxWidth: "400px",
            padding: "10px",
            overflow: "auto",
          }}
        >
          <Treebeard data={treeData} onToggle={onToggle} style={treeStyle} />
        </div>
        <div className="details-wrapper">
          <p>
            Test Name:{" "}
            {paramsData[0]?.TestParameters?.Properties[0]?.Value?.StringValue}
          </p>
          {selectedNode && <Details node={selectedNode} />}
        </div>
      </div>
    </div>
  );
}
