const CMS_ROLES = ['super_admin', 'administrator', 'editor', 'translator', 'viewer']

export function normalizeRole(role) {
  if (!role || role === 'cms_admin') return 'super_admin'
  return role
}

export function isCmsUser(role) {
  return CMS_ROLES.includes(normalizeRole(role))
}

export function canManageUsers(role) {
  return normalizeRole(role) === 'super_admin'
}

export function canWrite(role) {
  return ['super_admin', 'administrator', 'editor', 'translator'].includes(normalizeRole(role))
}

export function canPublish(role) {
  return ['super_admin', 'administrator', 'editor'].includes(normalizeRole(role))
}
