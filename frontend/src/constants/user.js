export const USER_ROLES = {
  ADMIN: 'admin',
  DIRECTOR: 'director',
  ANIMATOR: 'animator'
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'manage_all',
    'view_all',
    'create_all',
    'delete_all',
    'manage_users',
    'manage_structures'
  ],
  [USER_ROLES.DIRECTOR]: [
    'manage_team',
    'view_team_reports',
    'create_projects',
    'manage_planning',
    'view_statistics'
  ],
  [USER_ROLES.ANIMATOR]: [
    'track_time',
    'view_own_data',
    'view_own_planning'
  ]
};