import type { Express } from 'express';
import { createServer, type Server } from 'http';
import {storage} from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get All nodes
  app.get('/api/nodes', async (req, res) => {
   try {
    const nodes = await storage.getAllNodes();
    res.json(nodes);
   } catch (error) {
    console.error('Error fetching nodes:', error);
    res.status(500).json({ error: 'Failed to fetch nodes' });
   }
  });

  // Get system statistics
  app.get('/api/stats', async (req, res) => {
    try {
      const nodes = await storage.getAllNodes();
      const totalNodes = nodes.length;
      const onlineNodes = nodes.filter(node => node.isOnline).length;
      const offlineNodes = totalNodes - onlineNodes;
      const uptime = totalNodes > 0 ? ((onlineNodes / totalNodes) * 100).toFixed(1) : '0.0';

      res.json({
        totalNodes,
        onlineNodes,
        offlineNodes,
        uptime: `${uptime}%`
      });
    } catch (error) {
      console.error('Error calculatings stats:', error);
      res.status(500).json({ error: 'Failed to calculate statistics' });
    }
  });

  // Simulate real-time updates
  setInterval(async () => {
    try {
      const nodes = await storage.getAllNodes();
      // Randomly update some nodes (simulate real sensor updates)
      for (const node of nodes) {
        if (Math.random() < 0.1) { // 10% chance per interval
          const newStatus = Math.random() > 0.8 ? !node.isOnline : node.isOnline;
          const temp = newStatus ? 20 + Math.random() * 10 : undefined;
          const humidity = newStatus ? 60 + Math.random() * 20 : undefined;
          await storage.updateNodeStatus(node.nodeId, newStatus, temp, humidity);
    }
  }
} catch (error) {
  console.error('Error in background update:', error);
}
  }, 5000); // Update every 5 seconds
  return createServer(app);
}
