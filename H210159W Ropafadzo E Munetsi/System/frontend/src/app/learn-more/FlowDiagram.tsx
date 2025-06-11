'use client'

import { useState } from 'react'
import './flow-diagram.css'

interface Stage {
  id: string
  title: string
  icon: string
  description: string
}

interface FlowDiagramProps {
  stages: Stage[]
  activeStage?: string
}

export default function FlowDiagram({ stages, activeStage = 'application' }: FlowDiagramProps) {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null)
  
  // Calculate progress percentage based on active stage
  const getProgressPercentage = () => {
    const activeIndex = stages.findIndex(stage => stage.id === activeStage)
    if (activeIndex === -1) return 0
    
    // Calculate progress as percentage of completed connections
    // If there are 6 stages, there are 5 connections, so we use (activeIndex / (stages.length - 1))
    return (activeIndex / (stages.length - 1)) * 100
  }
  
  // Determine stage status (active, completed, or inactive)
  const getStageStatus = (stageId: string) => {
    const activeIndex = stages.findIndex(stage => stage.id === activeStage)
    const stageIndex = stages.findIndex(stage => stage.id === stageId)
    
    if (stageId === activeStage || stageId === hoveredStage) return 'active'
    if (stageIndex < activeIndex) return 'completed'
    return 'inactive'
  }

  return (
    <div className="flow-container">
      <div className="flow-steps">
        {stages.map((stage, index) => (
          <div 
            key={stage.id} 
            className="flow-step"
            onMouseEnter={() => setHoveredStage(stage.id)}
            onMouseLeave={() => setHoveredStage(null)}
          >
            <div 
              className={`flow-step-icon ${getStageStatus(stage.id)}`}
            >
              {stage.icon}
            </div>
            <div className="flow-step-title">{stage.title}</div>
          </div>
        ))}
      </div>
      
      {/* Connector line */}
      <div className="flow-connector">
        <div 
          className="flow-connector-progress" 
          style={{ width: `${getProgressPercentage()}%` }}
        ></div>
      </div>
      
      {/* Stage description (optional) */}
      {hoveredStage && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-[#224057]">
            {stages.find(s => s.id === hoveredStage)?.title}
          </h3>
          <p className="text-gray-600">
            {stages.find(s => s.id === hoveredStage)?.description}
          </p>
        </div>
      )}
    </div>
  )
}
