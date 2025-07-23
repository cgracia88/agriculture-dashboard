// Define Node type if not imported from elsewhere
type Node = {
  id: number;
  nodeId: string;
  location: string;
  section: string;
  row: string;
  isOnline: boolean;
  temperature: number | null;
  humidity: number | null;
  signalStrength: number;
  status: string;
  batteryLevel: number;
  lastSeen?: Date;
  // Add other properties as needed
};

// Define InsertNode type if not imported from elsewhere
type InsertNode = Omit<Node, 'id' | 'lastSeen'>;

function generateFieldNodes(): Node[] {
  const sections = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const nodes: Node[] = [];
  let id = 1;

  sections.forEach(section => {
    for (let row = 1; row <= 4; row++) {
      const nodeId = `Node-${section}-${String(row).padStart(3, '0')}`;
      const isOnline = Math.random() > 0.2; // 80% online rate

      nodes.push({
        id: id++,
        nodeId,
        location: `Section ${section}, Row ${row}`,
        section,
        row: String(row),
        isOnline,
        temperature: isOnline ? 20 + Math.random() * 10 : null,
        humidity: isOnline ? 60 + Math.random() * 20 : null,
        signalStrength: isOnline ? Math.floor(Math.random() * 30000) : Math.floor(Math.random() * 7200000),
          status: isOnline ? 'Online' : 'Offline',
        batteryLevel: isOnline ? 70 + Math.random() * 30:10 +Math.random() * 40,
        // Add other properties as needed
      });
    }
  });

  return nodes;
}

// Define IStorage interface if not imported from elsewhere
interface IStorage {
  getAllNodes(): Promise<Node[]>;
  getNodeById(id: number): Promise<Node | undefined>;
  createNode(insertNode: InsertNode): Promise<Node>;
  updateNodeStatus(nodeId: string, isOnline: boolean, temperature?: number, humidity?: number): Promise<Node | undefined>;
  searchNodes(query: string): Promise<Node[]>;
}

export class MemStorage implements IStorage {
  private nodes: Map<number, Node>;
  private nodesByNodeId: Map<string, Node>;
  private currentNodeId: number = 1;

  constructor() {
    this.nodes = new Map();
    this.nodesByNodeId = new Map();

    // Initialize with sample data
    const fieldNodes = generateFieldNodes();
    fieldNodes.forEach(node => {
      this.nodes.set(node.id, node);
      this.nodesByNodeId.set(node.nodeId, node);
      if (node.id >= this.currentNodeId) {
        this.currentNodeId = node.id + 1;
      }
    });
  }
async getAllNodes(): Promise<Node[]> {
  return Array.from(this.nodes.values()).sort((a, b) => a.nodeId.localeCompare(b.nodeId));
}



  async getNodeById(id: number): Promise<Node | undefined> {
    return this.nodes.get(id);        
  }
  async createNode(insertNode: InsertNode): Promise<Node> {
    const id = this.currentNodeId++;
    const node: Node = {
      ...insertNode,
      id,
      lastSeen: new Date()
    };
    this.nodes.set(id, node);
    this.nodesByNodeId.set(node.nodeId, node);
    return node;
  }
  async updateNodeStatus(nodeId: string, isOnline: boolean, temperature?: number, humidity?: number): Promise<Node | undefined> {
    const node = this.nodesByNodeId.get(nodeId);
    if (!node) {
      return undefined;
    }
    const updatedNode: Node = {
      ...node,
      isOnline,
      temperature: temperature ?? node.temperature,
      humidity: humidity ?? node.humidity,
      lastSeen: new Date(),
      status: isOnline ? 'Online' : 'Offline',
      signalStrength: isOnline ? Math.floor(Math.random() * 4) + 1 : 0,
    };
    this.nodes.set(node.id, updatedNode);
    this.nodesByNodeId.set(nodeId, updatedNode);
    return updatedNode;
  }

  async searchNodes(query: string): Promise<Node[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.nodes.values()).filter(node =>
      node.nodeId.toLowerCase().includes(lowercaseQuery) ||
      node.location.toLowerCase().includes(lowercaseQuery) ||
      node.section.toLowerCase().includes(lowercaseQuery)
    );

  }
}

export const storage = new MemStorage();