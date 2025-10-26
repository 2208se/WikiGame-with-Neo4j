# Wikipedia Graph Analysis & WikiGame with Neo4j

A comprehensive graph analysis of the French Wikipedia's "Algorithmics" subgraph, featuring centrality metrics, pathfinding, and an interactive WikiGame implementation.

## 📖 Project Overview

This project leverages the power of the **Neo4j** graph database to explore and analyze the intricate network of topics within French Wikipedia. The focus is on the algorithmic subgraph, uncovering key pages, connection patterns, and the structural importance of nodes. The analysis is brought to life through a fully-functional **WikiGame** application, where users can find the shortest path between any two Wikipedia pages.

## ✨ Key Features

- **Graph Data Import & Processing**: Imported and modeled 7,294 Wikipedia pages and 9,645 links as a graph in Neo4j.
- **Advanced Graph Analysis**:
  - **Degree Centrality**: Identified hub pages with the most incoming and outgoing links.
  - **PageRank**: Calculated the "importance" of pages based on the network's link structure.
  - **Betweenness Centrality**: Discovered critical "bridge" pages that connect different topic communities.
- **Interactive WikiGame**:
  - **Command-Line Interface (CLI)**: A Node.js application for finding shortest paths via terminal.
  - **Modern Web Interface**: A responsive web app built with HTML, CSS, JavaScript, and Express.js.

## 🛠️ Tech Stack

- **Database**: Neo4j
- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Graph Algorithms**: Neo4j Graph Data Science (GDS) Library (PageRank, Betweenness Centrality)

## 🚀 Getting Started

### Prerequisites
- Node.js and npm
- A running Neo4j database instance (Desktop or Server)

### Installation & Run

1. **Clone the repository**
   ```bash
   git clone https://github.com/2208se/WikiGame-with-Neo4j
   cd WikiGame-with-Neo4j
