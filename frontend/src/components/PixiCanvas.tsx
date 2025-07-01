import React, { useEffect, useRef } from 'react';
import { Application, Graphics, Text, Container } from 'pixi.js';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface PixiCanvasProps {
  width: number;
  height: number;
  onNodeClick: (nodeId: string) => void;
  onNodeDrag: (nodeId: string, position: { x: number; y: number }) => void;
}

export const PixiCanvas: React.FC<PixiCanvasProps> = ({
  width,
  height,
  onNodeClick,
  onNodeDrag,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const nodesContainerRef = useRef<Container | null>(null);
  const messagesContainerRef = useRef<Container | null>(null);
  
  const { nodes, messages, selectedNode } = useSelector((state: RootState) => state.raft);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize PIXI Application
    const app = new Application({
      width,
      height,
      backgroundColor: 0xf8fafc,
      antialias: true,
    });

    canvasRef.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    // Create containers
    const nodesContainer = new Container();
    const messagesContainer = new Container();
    
    app.stage.addChild(messagesContainer);
    app.stage.addChild(nodesContainer);
    
    nodesContainerRef.current = nodesContainer;
    messagesContainerRef.current = messagesContainer;

    return () => {
      app.destroy(true);
    };
  }, [width, height]);

  useEffect(() => {
    if (!appRef.current || !nodesContainerRef.current) return;

    const nodesContainer = nodesContainerRef.current;
    nodesContainer.removeChildren();

    nodes.forEach((node) => {
      const nodeGraphics = new Graphics();
      
      // Node colors based on state
      let color = 0x3b82f6; // blue for follower
      if (node.state === 'leader') color = 0x10b981; // green
      if (node.state === 'candidate') color = 0xf59e0b; // yellow
      if (!node.isAlive) color = 0xef4444; // red

      // Draw node circle
      nodeGraphics.beginFill(color, node.isAlive ? 1 : 0.5);
      nodeGraphics.drawCircle(0, 0, 30);
      nodeGraphics.endFill();

      // Selection indicator
      if (selectedNode === node.nodeId) {
        nodeGraphics.lineStyle(3, 0x667eea);
        nodeGraphics.drawCircle(0, 0, 35);
      }

      // Node label
      const label = new Text(node.nodeId, {
        fontSize: 12,
        fill: 0xffffff,
        fontWeight: 'bold',
      });
      label.anchor.set(0.5);
      nodeGraphics.addChild(label);

      // State indicator
      const stateLabel = new Text(node.state.toUpperCase(), {
        fontSize: 8,
        fill: 0x000000,
      });
      stateLabel.anchor.set(0.5);
      stateLabel.y = 45;
      nodeGraphics.addChild(stateLabel);

      // Position
      nodeGraphics.x = node.position.x;
      nodeGraphics.y = node.position.y;

      // Interactivity
      nodeGraphics.interactive = true;
      nodeGraphics.buttonMode = true;
      
      let isDragging = false;
      let dragData: any = null;

      nodeGraphics.on('pointerdown', (event) => {
        if (event.data.button === 0) { // Left click
          onNodeClick(node.nodeId);
          isDragging = true;
          dragData = event.data;
          nodeGraphics.alpha = 0.8;
        }
      });

      nodeGraphics.on('pointermove', () => {
        if (isDragging && dragData) {
          const newPosition = dragData.getLocalPosition(nodeGraphics.parent);
          nodeGraphics.x = newPosition.x;
          nodeGraphics.y = newPosition.y;
          onNodeDrag(node.nodeId, { x: newPosition.x, y: newPosition.y });
        }
      });

      nodeGraphics.on('pointerup', () => {
        isDragging = false;
        dragData = null;
        nodeGraphics.alpha = 1;
      });

      nodeGraphics.on('pointerupoutside', () => {
        isDragging = false;
        dragData = null;
        nodeGraphics.alpha = 1;
      });

      nodesContainer.addChild(nodeGraphics);
    });
  }, [nodes, selectedNode, onNodeClick, onNodeDrag]);

  useEffect(() => {
    if (!appRef.current || !messagesContainerRef.current) return;

    const messagesContainer = messagesContainerRef.current;
    messagesContainer.removeChildren();

    // Draw recent messages as animated arrows
    const recentMessages = messages.slice(-10);
    
    recentMessages.forEach((message, index) => {
      const fromNode = nodes.find(n => n.nodeId === message.from);
      const toNode = nodes.find(n => n.nodeId === message.to);
      
      if (!fromNode || !toNode) return;

      const arrow = new Graphics();
      
      // Message type colors
      let color = 0x3b82f6;
      if (message.type === 'heartbeat') color = 0x10b981;
      if (message.type === 'vote_request') color = 0xf59e0b;
      if (message.type === 'vote_response') color = 0x8b5cf6;
      if (message.success === false) color = 0xef4444;

      arrow.lineStyle(2, color, 0.8);
      arrow.moveTo(fromNode.position.x, fromNode.position.y);
      arrow.lineTo(toNode.position.x, toNode.position.y);

      // Arrow head
      const angle = Math.atan2(
        toNode.position.y - fromNode.position.y,
        toNode.position.x - fromNode.position.x
      );
      const headLength = 10;
      
      arrow.lineTo(
        toNode.position.x - headLength * Math.cos(angle - Math.PI / 6),
        toNode.position.y - headLength * Math.sin(angle - Math.PI / 6)
      );
      arrow.moveTo(toNode.position.x, toNode.position.y);
      arrow.lineTo(
        toNode.position.x - headLength * Math.cos(angle + Math.PI / 6),
        toNode.position.y - headLength * Math.sin(angle + Math.PI / 6)
      );

      // Fade out animation
      arrow.alpha = Math.max(0.1, 1 - (index / 10));

      messagesContainer.addChild(arrow);
    });
  }, [messages, nodes]);

  return <div ref={canvasRef} className="pixi-canvas" />;
};