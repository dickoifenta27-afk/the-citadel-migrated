import { base44 } from '@/api/base44Client';

// Substitute {placeholders} with game context values
export function substitutePlaceholders(text, context) {
  if (!text || !context) return text;
  let result = text;
  Object.entries(context).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, String(value));
  });
  return result;
}

// Parse and process dialogue tree node
export function processSceneNode(node, context) {
  if (!node) return null;

  const processedNode = {
    ...node,
    text: substitutePlaceholders(node.text, context),
    speaker: node.speaker || 'Advisor',
    role: node.role || '',
    type: node.type || 'ADVISOR',
    next: node.next || 'END'
  };

  if (node.choices && Array.isArray(node.choices)) {
    processedNode.choices = node.choices.map(choice => ({
      ...choice,
      text: substitutePlaceholders(choice.text, context),
      requires: choice.requires || {},
      consequences: choice.consequences || {},
      next: choice.next || 'END'
    }));
  }

  return processedNode;
}

// Apply consequences to UserState
export async function applyConsequences(consequences, userStateId) {
  if (!consequences || typeof consequences !== 'object') return;

  const updateData = {};
  
  // Resource changes
  const resourceFields = ['gold', 'food', 'iron', 'wood', 'mana', 'population'];
  resourceFields.forEach(field => {
    if (consequences[field]) {
      updateData[field] = new Function('current', `return current + ${consequences[field]}`)
    }
  });

  // Stability/Prosperity changes
  ['stability', 'prosperity'].forEach(field => {
    if (consequences[field]) {
      updateData[field] = new Function('current', `return Math.max(0, Math.min(1, current + ${consequences[field]}))`);
    }
  });

  // Political points
  if (consequences.political_points) {
    updateData.political_points = new Function('current', `return Math.max(0, current + ${consequences.political_points})`);
  }

  // Get current state and apply calculations
  const states = await base44.entities.UserState.list();
  const currentState = states[0];

  const finalData = {};
  for (const [key, fn] of Object.entries(updateData)) {
    if (typeof fn === 'function') {
      finalData[key] = fn(currentState[key] || 0);
    }
  }

  // Update
  await base44.entities.UserState.update(userStateId, finalData);
}