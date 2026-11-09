// Team lookups shared across pages. Each project stores { [statusId]: memberId } in stageManagers.

export function stageManagerOf(project, statusId, team) {
  const memberId = project.stageManagers?.[statusId];
  return team.find((m) => m.id === memberId) || null;
}

// Manager of the stage the project is currently in.
export function currentStageManager(project, team) {
  return stageManagerOf(project, project.statusId, team);
}
