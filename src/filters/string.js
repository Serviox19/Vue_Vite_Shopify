/**
 * String Filters
 */

export const ucfirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const upcase = (str) => {
  if (!str) return ''
  return str.toUpperCase()
}

export const unhandleize = (str) => {
  if (!str) return ''
  return str
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const downcase = (str) => {
  if (!str) return ''
  return str.toLowerCase()
}

export const truncate = (str, length = 50) => {
  if (!str) return ''
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}
